import { WebXKeyboard } from '..';

/**
 * A key event having a corresponding timestamp. This event is non-specific.
 * Its subclasses should be used instead when recording specific key
 * events.
 */
export abstract class WebXKeyEvent {
  /**
   * An arbitrary timestamp in milliseconds, indicating this event's
   * position in time relative to other events.
   */
  private _timestamp = new Date().getTime();

  /**
   * Whether the default action of this key event should be prevented.
   */
  private _defaultPrevented = false;

  /**
   * The keysym of the key associated with this key event, as determined
   * by a best-effort guess using available event properties and keyboard
   * state.
   */
  private _keysym: number = null;

  /**
   * Whether the keysym value of this key event is known to be reliable.
   * If false, the keysym may still be valid, but it's only a best guess,
   * and future key events may be a better source of information.
   */
  private _reliable = false;

  public get timestamp() {
    return this._timestamp;
  }

  public set timestamp(timestamp: number) {
    this._timestamp = timestamp;
  }

  public get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }

  public set defaultPrevented(defaultPrevented: boolean) {
    this._defaultPrevented = defaultPrevented;
  }

  public get keysym(): number {
    return this._keysym;
  }

  public set keysym(keysym: number) {
    this._keysym = keysym;
  }

  public get reliable(): boolean {
    return this._reliable;
  }

  public set reliable(reliable: boolean) {
    this._reliable = reliable;
  }

  /**
   * Returns the number of milliseconds elapsed since this event was
   * received.
   *
   * @return {number} The number of milliseconds elapsed since this
   *                  event was received.
   */
  public getAge(): number {
    const now = new Date().getTime();
    return now - this._timestamp;
  }

  /**
   * Returns true if the given keysym corresponds to a printable character,
   * false otherwise.
   *
   * @returns {Boolean}
   *     true if the given keysym corresponds to a printable character,
   *     false otherwise.
   */
  public isPrintable() {
    const keysym = this._keysym;
    // Keysyms with Unicode equivalents are printable
    return (keysym >= 0x00 && keysym <= 0xff) || (keysym & 0xffff0000) === 0x01000000;
  }

  public isControlCharacter(codepoint: number): boolean {
    return codepoint <= 0x1f || (codepoint >= 0x7f && codepoint <= 0x9f);
  }

  public keysymFromKeycode(keyCode: number, location: number) {
    return this.getKeysym(WebXKeyboard.keycodeKeysyms[keyCode], location);
  }

  public getKeysym(keysyms: Array<number>, location: number) {
    if (!keysyms) {
      return null;
    }

    return keysyms[location] || keysyms[0];
  }

  constructor() {}
}
