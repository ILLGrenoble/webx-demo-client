export class WebXKey {
  private _code: string;

  private _symbol: string;

  public get code(): string {
    return this._code;
  }

  public set code(code: string) {
    this._code = code;
  }

  public get symbol(): string {
    return this._symbol;
  }

  public set symbol(symbol: string) {
    this._symbol = symbol;
  }

  /**
   * Create a new webx key
   * @param code a key code represents a physical (or logical) key. KeyCodes lie in the inclusive range [8,255].
   * @param symbol a key symbol is an encoding of a symbol on the cap of a key
   * See: https://tronche.com/gui/x/xlib/input/keyboard-encoding.html
   * https://www.cl.cam.ac.uk/~mgk25/ucs/keysymdef.h
   */
  constructor(code: string, symbol: string) {
    this._code = code;
    this._symbol = symbol;
  }
}
