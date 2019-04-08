/**
   * A key event having a corresponding timestamp. This event is non-specific.
   * Its subclasses should be used instead when recording specific key events.
   */
export abstract class WebXKeyEvent {

    protected _timestamp: number;
    protected _defaultPrevented = false;
    protected _keysym: number = null;
    protected _reliable: boolean = false;

    public get timestamp(): number {
        return this._timestamp;
    }

    public get defaultPrevented(): boolean {
        return this._defaultPrevented;
    }

    public get keysym(): number {
        return this._keysym;
    }

    public get reliable(): boolean {
        return this._reliable;
    }

    constructor() {
        this._timestamp = new Date().getTime();
    }

    getAge(): number {
        const now = new Date().getTime();
        return now - this._timestamp;
    }
}