import { WebXKeyEvent } from '.';

export class WebXKeydownEvent extends WebXKeyEvent {

    private _keyCode: number;
    private _keyIdentifier: string;
    private _key: string;
    private _location: number;

    public get keyCode(): number {
        return this._keyCode;
    }

    public set keyCode(keyCode: number) {
        this._keyCode = keyCode;
    }

    public get keyIdentifier(): string {
        return this._keyIdentifier;
    }

    public set keyIdentifier(keyIdentifier: string) {
        this._keyIdentifier = keyIdentifier;
    }

    public get key(): string {
        return this._key;
    }

    public set key(key: string) {
        this._key = key;
    }

    public get location(): number {
        return this._location;
    }

    public set location(location: number) {
        this._location = location;
    }

    /**
     * Information related to the pressing of a key, which need not be a key
     * associated with a printable character. The presence or absence of any
     * information within this object is browser-dependent.
     *
     * @private
     * @constructor
     * @augments Guacamole.Keyboard.KeyEvent
     * @param {number} keyCode The JavaScript key code of the key pressed.
     * @param {string} keyIdentifier The legacy DOM3 "keyIdentifier" of the key
     *                               pressed, as defined at:
     *                               http://www.w3.org/TR/2009/WD-DOM-Level-3-Events-20090908/#events-Events-KeyboardEvent
     * @param {string} key The standard name of the key pressed, as defined at:
     *                     http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
     * @param {number} location The location on the keyboard corresponding to
     *                          the key pressed, as defined at:
     *                          http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
     */
    constructor(keyCode: number, keyIdentifier: string, key: string, location: number) {
        super();
        this._keyCode = keyCode;
        this._keyIdentifier = keyIdentifier;
        this._key = key;
        this._location = location;
    }

}