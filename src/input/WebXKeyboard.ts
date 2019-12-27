import { WebXKeydownEvent, WebXKeyPressEvent, WebXKeyboardModifierState } from './keyboard';

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
  };

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
  private _keyRepeatTimeout: number = null;

  /**
   * Interval which presses and releases the last key pressed while that
   * key is still being held down.
   */
  private _keyRepeatInterval: number = null;

  private static NON_REPEATABLE_KEYS: Array<number> = [
    0xfe03, // ISO Level 3 Shift (AltGr)
    0xffe1, // Left shift
    0xffe2, // Right shift
    0xffe3, // Left ctrl
    0xffe4, // Right ctrl
    0xffe5, // Caps Lock
    0xffe7, // Left meta
    0xffe8, // Right meta
    0xffe9, // Left alt
    0xffea, // Right alt
    0xffeb, // Left hyper
    0xffec // Right hyper
  ];

  /**
   * Map of known JavaScript keycodes which do not map to typable characters
   * to their X11 keysym equivalents.
   */
  public static keycodeKeysyms: { [index: number]: Array<number> } = {
    8: [0xff08], // backspace
    9: [0xff09], // tab
    12: [0xff0b, 0xff0b, 0xff0b, 0xffb5], // clear       / KP 5
    13: [0xff0d], // enter
    16: [0xffe1, 0xffe1, 0xffe2], // shift
    17: [0xffe3, 0xffe3, 0xffe4], // ctrl
    18: [0xffe9, 0xffe9, 0xfe03], // alt
    19: [0xff13], // pause/break
    20: [0xffe5], // caps lock
    27: [0xff1b], // escape
    32: [0x0020], // space
    33: [0xff55, 0xff55, 0xff55, 0xffb9], // page up     / KP 9
    34: [0xff56, 0xff56, 0xff56, 0xffb3], // page down   / KP 3
    35: [0xff57, 0xff57, 0xff57, 0xffb1], // end         / KP 1
    36: [0xff50, 0xff50, 0xff50, 0xffb7], // home        / KP 7
    37: [0xff51, 0xff51, 0xff51, 0xffb4], // left arrow  / KP 4
    38: [0xff52, 0xff52, 0xff52, 0xffb8], // up arrow    / KP 8
    39: [0xff53, 0xff53, 0xff53, 0xffb6], // right arrow / KP 6
    40: [0xff54, 0xff54, 0xff54, 0xffb2], // down arrow  / KP 2
    45: [0xff63, 0xff63, 0xff63, 0xffb0], // insert      / KP 0
    46: [0xffff, 0xffff, 0xffff, 0xffae], // delete      / KP decimal
    91: [0xffeb], // left window key (hyper_l)
    92: [0xff67], // right window key (menu key?)
    93: null, // select key
    96: [0xffb0], // KP 0
    97: [0xffb1], // KP 1
    98: [0xffb2], // KP 2
    99: [0xffb3], // KP 3
    100: [0xffb4], // KP 4
    101: [0xffb5], // KP 5
    102: [0xffb6], // KP 6
    103: [0xffb7], // KP 7
    104: [0xffb8], // KP 8
    105: [0xffb9], // KP 9
    106: [0xffaa], // KP multiply
    107: [0xffab], // KP add
    109: [0xffad], // KP subtract
    110: [0xffae], // KP decimal
    111: [0xffaf], // KP divide
    112: [0xffbe], // f1
    113: [0xffbf], // f2
    114: [0xffc0], // f3
    115: [0xffc1], // f4
    116: [0xffc2], // f5
    117: [0xffc3], // f6
    118: [0xffc4], // f7
    119: [0xffc5], // f8
    120: [0xffc6], // f9
    121: [0xffc7], // f10
    122: [0xffc8], // f11
    123: [0xffc9], // f12
    144: [0xff7f], // num lock
    145: [0xff14], // scroll lock
    225: [0xfe03] // altgraph (iso_level3_shift)
  };

  /**
   * Map of known JavaScript keyidentifiers which do not map to typable
   * characters to their unshifted X11 keysym equivalents.
   */
  public static keyidentifierKeysym: { [index: string]: Array<number> } = {
    Again: [0xff66],
    AllCandidates: [0xff3d],
    Alphanumeric: [0xff30],
    Alt: [0xffe9, 0xffe9, 0xfe03],
    Attn: [0xfd0e],
    AltGraph: [0xfe03],
    ArrowDown: [0xff54],
    ArrowLeft: [0xff51],
    ArrowRight: [0xff53],
    ArrowUp: [0xff52],
    Backspace: [0xff08],
    CapsLock: [0xffe5],
    Cancel: [0xff69],
    Clear: [0xff0b],
    Convert: [0xff21],
    Copy: [0xfd15],
    Crsel: [0xfd1c],
    CrSel: [0xfd1c],
    CodeInput: [0xff37],
    Compose: [0xff20],
    Control: [0xffe3, 0xffe3, 0xffe4],
    ContextMenu: [0xff67],
    Delete: [0xffff],
    Down: [0xff54],
    End: [0xff57],
    Enter: [0xff0d],
    EraseEof: [0xfd06],
    Escape: [0xff1b],
    Execute: [0xff62],
    Exsel: [0xfd1d],
    ExSel: [0xfd1d],
    F1: [0xffbe],
    F2: [0xffbf],
    F3: [0xffc0],
    F4: [0xffc1],
    F5: [0xffc2],
    F6: [0xffc3],
    F7: [0xffc4],
    F8: [0xffc5],
    F9: [0xffc6],
    F10: [0xffc7],
    F11: [0xffc8],
    F12: [0xffc9],
    F13: [0xffca],
    F14: [0xffcb],
    F15: [0xffcc],
    F16: [0xffcd],
    F17: [0xffce],
    F18: [0xffcf],
    F19: [0xffd0],
    F20: [0xffd1],
    F21: [0xffd2],
    F22: [0xffd3],
    F23: [0xffd4],
    F24: [0xffd5],
    Find: [0xff68],
    GroupFirst: [0xfe0c],
    GroupLast: [0xfe0e],
    GroupNext: [0xfe08],
    GroupPrevious: [0xfe0a],
    FullWidth: null,
    HalfWidth: null,
    HangulMode: [0xff31],
    Hankaku: [0xff29],
    HanjaMode: [0xff34],
    Help: [0xff6a],
    Hiragana: [0xff25],
    HiraganaKatakana: [0xff27],
    Home: [0xff50],
    Hyper: [0xffed, 0xffed, 0xffee],
    Insert: [0xff63],
    JapaneseHiragana: [0xff25],
    JapaneseKatakana: [0xff26],
    JapaneseRomaji: [0xff24],
    JunjaMode: [0xff38],
    KanaMode: [0xff2d],
    KanjiMode: [0xff21],
    Katakana: [0xff26],
    Left: [0xff51],
    Meta: [0xffe7, 0xffe7, 0xffe8],
    ModeChange: [0xff7e],
    NumLock: [0xff7f],
    PageDown: [0xff56],
    PageUp: [0xff55],
    Pause: [0xff13],
    Play: [0xfd16],
    PreviousCandidate: [0xff3e],
    PrintScreen: [0xff61],
    Redo: [0xff66],
    Right: [0xff53],
    RomanCharacters: null,
    Scroll: [0xff14],
    Select: [0xff60],
    Separator: [0xffac],
    Shift: [0xffe1, 0xffe1, 0xffe2],
    SingleCandidate: [0xff3c],
    Super: [0xffeb, 0xffeb, 0xffec],
    Tab: [0xff09],
    UIKeyInputDownArrow: [0xff54],
    UIKeyInputEscape: [0xff1b],
    UIKeyInputLeftArrow: [0xff51],
    UIKeyInputRightArrow: [0xff53],
    UIKeyInputUpArrow: [0xff52],
    Up: [0xff52],
    Undo: [0xff65],
    Win: [0xffeb],
    Zenkaku: [0xff28],
    ZenkakuHankaku: [0xff2a]
  };

  /**
   * Create a new keyboard instance
   * @param element the element to bind the keyboard to
   */
  constructor(element: HTMLElement) {
    this._element = element;
    this.handleQuirks();
    this._bindListeners();
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
  private _bindListeners(): void {
    const element = this._element;
    element.addEventListener('keydown', this._handleKeyDown.bind(this));
    element.addEventListener('keypress', this._handleKeyPress.bind(this));
    element.addEventListener('keyup', this._handleKeyUp.bind(this));
  }

  private _isControlCharacter(codepoint: number) {
    return codepoint <= 0x1f || (codepoint >= 0x7f && codepoint <= 0x9f);
  }

  public getMappedKeyFromCharCode(codepoint: number) {
    if (this._isControlCharacter(codepoint)) {
      return 0xff00 | codepoint;
    }
    // Keysyms for ASCII chars
    if (codepoint >= 0x0000 && codepoint <= 0x00ff) {
      return codepoint;
    }
    // Keysyms for Unicode
    if (codepoint >= 0x0100 && codepoint <= 0x10ffff) {
      return 0x01000000 | codepoint;
    }
    return null;
  }

  /**
   * Handle keypress event
   * @param event the keyboard event
   */
  private _handleKeyPress(event: KeyboardEvent): void {
    console.log('Got keypress event', event);
  }

  /**
   * Handle keydown event
   * @param event the keyboard event
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    const codepoint = event.key.charCodeAt(0);
    const mappedKey = this.getMappedKeyFromCharCode(codepoint);
    this.onKeyDown(event.key);
  }

  /**
   * Handle key up event
   * @param event the keyboard event
   */
  private _handleKeyUp(event: KeyboardEvent): void {
    const codepoint = event.key.charCodeAt(0);
    const mappedKey = this.getMappedKeyFromCharCode(codepoint);
    this.onKeyUp(mappedKey);
  }

  /**
   * Create a new keyboard down event
   */
  private _createKeydownEvent(): WebXKeydownEvent {
    return null;
    // return new WebXKeydownEvent();
  }

  /**
   * Create a new key press event
   */
  private _createKeyPressEvent(): WebXKeyPressEvent {
    return null;
    // return new WebXKeyPressEvent();
  }

  /**
   * Fired whenever the user presses a key with the element associated
   * with this Guacamole.Keyboard in focus.
   *
   * @param key The key being pressed
   */
  public onKeyDown(key: any): void {}

  /**
   * Fired whenever the user releases a key with the element associated
   * with this Guacamole.Keyboard in focus.
   *
   * @param key The key being released
   */
  public onKeyUp(key: any): void {}

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
    const NON_REPEATABLE_KEYS = WebXKeyboard.NON_REPEATABLE_KEYS;
    return NON_REPEATABLE_KEYS[keySymbol] ? false : true;
  }

  /**
   * Returns true if the given keysym corresponds to a printable character,
   * false otherwise.
   *
   * @param key the key symbol to check
   *
   * @returns  true if the given keysym corresponds to a printable character, false otherwise.
   */
  private _isPrintable(key: number) {
    // Keysyms with Unicode equivalents are printable
    return (key >= 0x00 && key <= 0xff) || (key & 0xffff0000) === 0x01000000;
  }

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
    this._keyRepeatInterval = setInterval(() => {
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
    this._keyRepeatTimeout = setTimeout(() => {
      this.setKeyRepeatInterval(key);
    }, timeout);
  }

  /**
   * Clear the key repeat timers
   */
  public clearKeyRepeatTimers(): void {
    clearTimeout(this._keyRepeatTimeout);
    clearInterval(this._keyRepeatInterval);
  }
}
