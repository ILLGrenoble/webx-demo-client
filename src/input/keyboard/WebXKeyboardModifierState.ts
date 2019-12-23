/**
 * The state of all supported keyboard mofifiers
 */
export class WebXKeyboardModifierState {

    /**
     * Whether shift is currently pressed.
     */
    private _shift: boolean = false;

    /**
     * Whether ctrl is currently pressed.
     */
    private _ctrl: boolean = false;

    /**
     * Whether alt is currently pressed.
     */
    private _alt: boolean = false;

    /**
     * Whether meta (apple key) is currently pressed.
     */
    private _meta: boolean = false;

    /**
     * Whether hyper (windows key) is currently pressed.
     */
    private _hyper: boolean = false;

    public get shift(): boolean {
        return this._shift;
    }

    public get ctrl(): boolean {
        return this._ctrl;
    }

    public get alt(): boolean {
        return this._alt;
    }

    public get meta(): boolean {
        return this._meta;
    }

    public get hyper(): boolean {
        return this._hyper;
    }

    public set shift(value: boolean) {
        this._shift = value;
    }

    public set ctrl(value: boolean) {
        this._ctrl = value;
    }

    public set alt(value: boolean) {
        this._alt = value;
    }

    public set meta(value: boolean) {
        this._meta = value;
    }

    public set hyper(value: boolean) {
        this._hyper = value;
    }

    constructor(state?: { shift: boolean, ctrl: boolean, alt: boolean, meta: boolean, hyper: boolean }) {
        if (state) {
            const { shift, ctrl, alt, meta, hyper } = state;
            this._shift = shift;
            this._ctrl = ctrl;
            this._alt = alt;
            this._meta = meta;
            this._hyper = hyper;
        }
    }

    /**
     * Handles the modifier state applicable to the keyboard event given 
     * @param event the keyboard event to be read
     */
    public fromKeyboardEvent(event: KeyboardEvent) {
        this._shift = event.shiftKey;
        this._ctrl = event.ctrlKey;
        this._alt = event.altKey;
        this._meta = event.metaKey;

        if (event.getModifierState) {
            this.hyper = event.getModifierState('OS')
                || event.getModifierState('Super')
                || event.getModifierState('Hyper')
                || event.getModifierState('Win');
        }
    }

}