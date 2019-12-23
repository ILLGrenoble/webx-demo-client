import { WebXKeydownEvent, WebXKeyPressEvent, WebXKeyboardModifierState } from "./keyboard";

/**
 * Represents a WebX keyboard
 * For more information about keyboard encoding for X11, please see:
 * https://tronche.com/gui/x/xlib/input/keyboard-encoding.html
 */
export class WebXKeyboard {

    /**
     * The element to use to provide keyboard events
     */
    private _element: HTMLElement;

    /**
     * Set of known platform-specific or browser-specific quirks which must be
     * accounted for to properly interpret key events, even if the only way to
     * reliably detect that quirk is to platform/browser-sniff.
     */
    private _quirks = {
        /**
         * Whether keyup events are universally unreliable.
         */
        keyupUnreliable: false,

        /**
         * Whether the Alt key is actually a modifier for typable keys and is
         * thus never used for keyboard shortcuts.
         */
        altIsTypableOnly: false,

        /**
         * Whether we can rely on receiving a keyup event for the Caps Lock
         * key.
         */
        capsLockKeyupUnreliable: false
    }

    /**
      * The state of every key, indexed by keysym. If a particular key is
      * pressed, the value of pressed for that keysym will be true. If a key
      * is not currently pressed, it will not be defined. 
      */
    private _pressed: Array<number> = [];

    /**
     * All modifiers and their states.
     */
    private _modifiers = new WebXKeyboardModifierState();

    /**
     * Timeout before key repeat starts.
     * @private
     */
    private keyRepeatTimeout: number = null;

    /**
     * Interval which presses and releases the last key pressed while that
     * key is still being held down.
     */
    private keyRepeatInterval: number = null;

    private static nonRepeatableKeys: Array<number> = [
        0xFE03, // ISO Level 3 Shift (AltGr)
        0xFFE1, // Left shift
        0xFFE2, // Right shift
        0xFFE3, // Left ctrl 
        0xFFE4, // Right ctrl 
        0xFFE5, // Caps Lock
        0xFFE7, // Left meta 
        0xFFE8, // Right meta 
        0xFFE9, // Left alt
        0xFFEA, // Right alt
        0xFFEB, // Left hyper
        0xFFEC  // Right hyper
    ];


    /**
    * Map of known JavaScript keycodes which do not map to typable characters
    * to their X11 keysym equivalents.
    */
    public static keycodeKeysyms: { [index: number]: Array<number> } = {
        8: [0xFF08], // backspace
        9: [0xFF09], // tab
        12: [0xFF0B, 0xFF0B, 0xFF0B, 0xFFB5], // clear       / KP 5
        13: [0xFF0D], // enter
        16: [0xFFE1, 0xFFE1, 0xFFE2], // shift
        17: [0xFFE3, 0xFFE3, 0xFFE4], // ctrl
        18: [0xFFE9, 0xFFE9, 0xFE03], // alt
        19: [0xFF13], // pause/break
        20: [0xFFE5], // caps lock
        27: [0xFF1B], // escape
        32: [0x0020], // space
        33: [0xFF55, 0xFF55, 0xFF55, 0xFFB9], // page up     / KP 9
        34: [0xFF56, 0xFF56, 0xFF56, 0xFFB3], // page down   / KP 3
        35: [0xFF57, 0xFF57, 0xFF57, 0xFFB1], // end         / KP 1
        36: [0xFF50, 0xFF50, 0xFF50, 0xFFB7], // home        / KP 7
        37: [0xFF51, 0xFF51, 0xFF51, 0xFFB4], // left arrow  / KP 4
        38: [0xFF52, 0xFF52, 0xFF52, 0xFFB8], // up arrow    / KP 8
        39: [0xFF53, 0xFF53, 0xFF53, 0xFFB6], // right arrow / KP 6
        40: [0xFF54, 0xFF54, 0xFF54, 0xFFB2], // down arrow  / KP 2
        45: [0xFF63, 0xFF63, 0xFF63, 0xFFB0], // insert      / KP 0
        46: [0xFFFF, 0xFFFF, 0xFFFF, 0xFFAE], // delete      / KP decimal
        91: [0xFFEB], // left window key (hyper_l)
        92: [0xFF67], // right window key (menu key?)
        93: null,     // select key
        96: [0xFFB0], // KP 0
        97: [0xFFB1], // KP 1
        98: [0xFFB2], // KP 2
        99: [0xFFB3], // KP 3
        100: [0xFFB4], // KP 4
        101: [0xFFB5], // KP 5
        102: [0xFFB6], // KP 6
        103: [0xFFB7], // KP 7
        104: [0xFFB8], // KP 8
        105: [0xFFB9], // KP 9
        106: [0xFFAA], // KP multiply
        107: [0xFFAB], // KP add
        109: [0xFFAD], // KP subtract
        110: [0xFFAE], // KP decimal
        111: [0xFFAF], // KP divide
        112: [0xFFBE], // f1
        113: [0xFFBF], // f2
        114: [0xFFC0], // f3
        115: [0xFFC1], // f4
        116: [0xFFC2], // f5
        117: [0xFFC3], // f6
        118: [0xFFC4], // f7
        119: [0xFFC5], // f8
        120: [0xFFC6], // f9
        121: [0xFFC7], // f10
        122: [0xFFC8], // f11
        123: [0xFFC9], // f12
        144: [0xFF7F], // num lock
        145: [0xFF14], // scroll lock
        225: [0xFE03]  // altgraph (iso_level3_shift)
    };

    /**
     * Map of known JavaScript keyidentifiers which do not map to typable
     * characters to their unshifted X11 keysym equivalents.
     */
    public static keyidentifierKeysym: { [index: string]: Array<number> } = {
        "Again": [0xFF66],
        "AllCandidates": [0xFF3D],
        "Alphanumeric": [0xFF30],
        "Alt": [0xFFE9, 0xFFE9, 0xFE03],
        "Attn": [0xFD0E],
        "AltGraph": [0xFE03],
        "ArrowDown": [0xFF54],
        "ArrowLeft": [0xFF51],
        "ArrowRight": [0xFF53],
        "ArrowUp": [0xFF52],
        "Backspace": [0xFF08],
        "CapsLock": [0xFFE5],
        "Cancel": [0xFF69],
        "Clear": [0xFF0B],
        "Convert": [0xFF21],
        "Copy": [0xFD15],
        "Crsel": [0xFD1C],
        "CrSel": [0xFD1C],
        "CodeInput": [0xFF37],
        "Compose": [0xFF20],
        "Control": [0xFFE3, 0xFFE3, 0xFFE4],
        "ContextMenu": [0xFF67],
        "Delete": [0xFFFF],
        "Down": [0xFF54],
        "End": [0xFF57],
        "Enter": [0xFF0D],
        "EraseEof": [0xFD06],
        "Escape": [0xFF1B],
        "Execute": [0xFF62],
        "Exsel": [0xFD1D],
        "ExSel": [0xFD1D],
        "F1": [0xFFBE],
        "F2": [0xFFBF],
        "F3": [0xFFC0],
        "F4": [0xFFC1],
        "F5": [0xFFC2],
        "F6": [0xFFC3],
        "F7": [0xFFC4],
        "F8": [0xFFC5],
        "F9": [0xFFC6],
        "F10": [0xFFC7],
        "F11": [0xFFC8],
        "F12": [0xFFC9],
        "F13": [0xFFCA],
        "F14": [0xFFCB],
        "F15": [0xFFCC],
        "F16": [0xFFCD],
        "F17": [0xFFCE],
        "F18": [0xFFCF],
        "F19": [0xFFD0],
        "F20": [0xFFD1],
        "F21": [0xFFD2],
        "F22": [0xFFD3],
        "F23": [0xFFD4],
        "F24": [0xFFD5],
        "Find": [0xFF68],
        "GroupFirst": [0xFE0C],
        "GroupLast": [0xFE0E],
        "GroupNext": [0xFE08],
        "GroupPrevious": [0xFE0A],
        "FullWidth": null,
        "HalfWidth": null,
        "HangulMode": [0xFF31],
        "Hankaku": [0xFF29],
        "HanjaMode": [0xFF34],
        "Help": [0xFF6A],
        "Hiragana": [0xFF25],
        "HiraganaKatakana": [0xFF27],
        "Home": [0xFF50],
        "Hyper": [0xFFED, 0xFFED, 0xFFEE],
        "Insert": [0xFF63],
        "JapaneseHiragana": [0xFF25],
        "JapaneseKatakana": [0xFF26],
        "JapaneseRomaji": [0xFF24],
        "JunjaMode": [0xFF38],
        "KanaMode": [0xFF2D],
        "KanjiMode": [0xFF21],
        "Katakana": [0xFF26],
        "Left": [0xFF51],
        "Meta": [0xFFE7, 0xFFE7, 0xFFE8],
        "ModeChange": [0xFF7E],
        "NumLock": [0xFF7F],
        "PageDown": [0xFF56],
        "PageUp": [0xFF55],
        "Pause": [0xFF13],
        "Play": [0xFD16],
        "PreviousCandidate": [0xFF3E],
        "PrintScreen": [0xFF61],
        "Redo": [0xFF66],
        "Right": [0xFF53],
        "RomanCharacters": null,
        "Scroll": [0xFF14],
        "Select": [0xFF60],
        "Separator": [0xFFAC],
        "Shift": [0xFFE1, 0xFFE1, 0xFFE2],
        "SingleCandidate": [0xFF3C],
        "Super": [0xFFEB, 0xFFEB, 0xFFEC],
        "Tab": [0xFF09],
        "UIKeyInputDownArrow": [0xFF54],
        "UIKeyInputEscape": [0xFF1B],
        "UIKeyInputLeftArrow": [0xFF51],
        "UIKeyInputRightArrow": [0xFF53],
        "UIKeyInputUpArrow": [0xFF52],
        "Up": [0xFF52],
        "Undo": [0xFF65],
        "Win": [0xFFEB],
        "Zenkaku": [0xFF28],
        "ZenkakuHankaku": [0xFF2A]
    };

    /**
     * Create a new keyboard instance
     * @param element the element to bind the keyboard to
     */
    constructor(element: HTMLElement) {
        this._element = element;
        this.handleQuirks();
        this.bindListeners();
    }

    /**
     * Set quirk flags depending on platform/browser, if such information is available
     */
    handleQuirks(): void {
        if (navigator && navigator.platform) {
            // All keyup events are unreliable on iOS (sadly)
            if (navigator.platform.match(/ipad|iphone|ipod/i)) {
                this._quirks.keyupUnreliable = true;
            }
            // The Alt key on Mac is never used for keyboard shortcuts, and the
            // Caps Lock key never dispatches keyup events
            else if (navigator.platform.match(/^mac/i)) {
                this._quirks.altIsTypableOnly = true;
                this._quirks.capsLockKeyupUnreliable = true;
            }
        }
    }

    /**
     * Bind the keyboard listeners to the given element
     */
    private bindListeners(): void {
        const element = this._element;
        element.addEventListener('keydown', this.handleKeyDown.bind(this));
        element.addEventListener('keypress', this.handleKeyPress.bind(this));
        element.addEventListener('keyup', this.handleKeyUp.bind(this));
    }



    private isControlCharacter(codepoint: number) {
        return codepoint <= 0x1F || (codepoint >= 0x7F && codepoint <= 0x9F);
    }

    public getMappedKeyFromCharCode(codepoint: number) {
        if (this.isControlCharacter(codepoint)) {
            return 0xFF00 | codepoint;
        }
        // Keysyms for ASCII chars
        if (codepoint >= 0x0000 && codepoint <= 0x00FF) {
            return codepoint;
        }
        // Keysyms for Unicode
        if (codepoint >= 0x0100 && codepoint <= 0x10FFFF) {
            return 0x01000000 | codepoint;
        }
        return null;
    }

    /**
     * Handle keypress event
     * @param event the keyboard event
     */
    private handleKeyPress(event: KeyboardEvent): void {
        console.log('Got keypress event', event);
    }

    /**
 * Handle keydown event
 * @param event the keyboard event
 */
    private handleKeyDown(event: KeyboardEvent): void {
        var codepoint = event.key.charCodeAt(0);
        const mappedKey = this.getMappedKeyFromCharCode(codepoint);
        this.onKeyDown(event.key);
    }


    /**
     * Handle key up event
     * @param event the keyboard event
     */
    private handleKeyUp(event: KeyboardEvent): void {
        var codepoint = event.key.charCodeAt(0);
        const mappedKey = this.getMappedKeyFromCharCode(codepoint);
        this.onKeyUp(mappedKey);
    }

    /**
     * Create a new keyboard down event
     */
    private createKeydownEvent(): WebXKeydownEvent {
        return null;
        // return new WebXKeydownEvent();
    }


    /**
     * Create a new key press event
     */
    private createKeyPressEvent(): WebXKeyPressEvent {
        return null;
        // return new WebXKeyPressEvent();
    }

    /**
     * Fired whenever the user presses a key with the element associated
     * with this Guacamole.Keyboard in focus.
     * 
     * @param key The key being pressed
     */
    public onKeyDown(key: any): void {

    }

    /**
     * Fired whenever the user releases a key with the element associated
     * with this Guacamole.Keyboard in focus.
     * 
     * @param key The key being released
     */
    public onKeyUp(key: any): void {

    }

    /**
     * Check if a given key is pressed down
     * @param key the key to check
     */
    public isKeyPressed(key: number): boolean {
        return this._pressed[key] ? true : false;
    }


    /**
     * Check if a given key symbol is repeatable
     * @param keySymbol the key to check
     */
    public isKeyRepeatable(keySymbol: number): boolean {
        const nonRepeatableKeys = WebXKeyboard.nonRepeatableKeys;
        return nonRepeatableKeys[keySymbol] ? false : true;
    }


    /**
    * Returns true if the given keysym corresponds to a printable character,
    * false otherwise.
    *
    * @param key the key symbol to check
    *
    * @returns  true if the given keysym corresponds to a printable character, false otherwise.
    */
    private isPrintable(key: number) {
        // Keysyms with Unicode equivalents are printable
        return (key >= 0x00 && key <= 0xFF)
            || (key & 0xFFFF0000) === 0x01000000;

    };

    /**
     * Resets the state of this keyboard
     */
    public reset(): void {
        this._pressed.forEach(this.release.bind(this));
    }

    /**
     * Presses and releases the keys necessary to tpe the given string of characters
     * @param message the string to type
     */
    public type(message: string): void {
        for (const char of message) {
            // @TODO
            // press down
            // and then release
        }
    }

    /**
     * Marks a key as pressed, firing the keydown event if registered. Key repeat for the pressed 
     * key will start after a delay if that key is not a modifier. 
     * The return value of this function depends on the return value of the keydown event handler, if any.
     * @param keysym the keysym of the key to press
     * @return {boolean} true if event should not be canceled, false otherwise.
     */
    public press(keysym: number): void {
        if (keysym == null) {
            return;
        }
        console.log('Pressed key', keysym);
        if (this.isKeyRepeatable(keysym)) {
            console.log('Key is repeatable', keysym);
            this._pressed.push(keysym);
            this.clearKeyRepeatTimers();
            this.setKeyRepeatTimeout(keysym);
        }
    }

    /**
     * Marks a key as released, firing the keyup event if registered
     * @param keysym the keysym of the key to release.
     */
    public release(key: number): void {
        if (this.isKeyPressed(key)) {
            console.log('Releasing key', key);
            delete this._pressed[key];
            this.clearKeyRepeatTimers();
            // send key event
            this.onKeyUp(key);
        }
    }

    /**
     * Set the key repeat interval for a given timeout
     * @param key the key to repeat
     */
    public setKeyRepeatInterval(key: number): void {
        console.log('Setting key repeat interval');
        const timeout = 50;
        this.keyRepeatInterval = setInterval(() => {
            this.onKeyUp(key);
            this.onKeyDown(key);
        }, timeout);
    }

    /**
     * Set the key repeat timeout for a given timeout
     * @param key the key to repeat
     */
    public setKeyRepeatTimeout(key: number): void {
        const timeout = 500;
        this.keyRepeatTimeout = setTimeout(() => {
            this.setKeyRepeatInterval(key);
        }, timeout)
    }

    /**
     * Clear the key repeat timers
     */
    public clearKeyRepeatTimers(): void {
        clearTimeout(this.keyRepeatTimeout);
        clearInterval(this.keyRepeatInterval);
    }

}