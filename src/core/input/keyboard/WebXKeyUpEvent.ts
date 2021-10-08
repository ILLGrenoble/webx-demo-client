import { WebXKeyEvent } from './WebXKeyEvent';

export class WebXKeyUpEvent extends WebXKeyEvent {

  private _keyCode: number;
  private _key: string;
  private _location: number;
  private _keyIdentifier: string;


  public get keyCode(): number {
    return this._keyCode;
  }


  public get key(): string {
    return this._key;
  }

  public get location(): number {
    return this._location;
  }

  public get keyIdentifier(): string {
    return this._keyIdentifier;
  }


  constructor(keyCode: number,  keyIdentifier: string, key: string, location: number) {
    super();
    this._keyCode = keyCode;
    this._key = key;
    this._location = location;
    this._keyIdentifier = keyIdentifier;
    this._keysym = this.keysymFromKeycode(keyCode, location) || this.keysymFromKeyIdentifier(key,location);

    // @TODO Fix this!
    // Fall back to the most recently pressed keysym associated with the
    // keyCode if the inferred key doesn't seem to actually be pressed
    // if (!WebXKeyboard.pressed[this.keysym])
    //     this.keysym = recentKeysym[keyCode] || this.keysym;
    // }

    // Keyup is as reliable as it will ever be
    this.reliable = true;

  }
}
