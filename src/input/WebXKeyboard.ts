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

    /**
     * Handle keydown event
     * @param event the keyboard event
     */
    private handleKeyDown(event: KeyboardEvent): void {
        console.log('Got keydown event', event);
        this.onKeyDown(event);
    }

    /**
     * Handle keypress event
     * @param event the keyboard event
     */
    private handleKeyPress(event: KeyboardEvent): void {
        console.log('Got keypress event', event);
    }

    /**
     * Handle key up event
     * @param event the keyboard event
     */
    private handleKeyUp(event: KeyboardEvent): void {
        console.log('Got keyup event', event);
        this.onKeyUp(event);
    }

    /**
     * Create a new keyboard down event
     */
    private createKeydownEvent(): WebXKeydownEvent {
        return new WebXKeydownEvent();
    }


    /**
     * Create a new key press event
     */
    private createKeyPressEvent(): WebXKeyPressEvent {
        return new WebXKeyPressEvent();
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