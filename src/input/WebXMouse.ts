import { WebXMouseState } from './WebXMouseState';

export class WebXMouse {

    /**
     * The current mouse state. The properties of this state are updated when
     * mouse events fire. This state object is also passed in as a parameter to
     * the handler of any mouse events.
     */
    private currentMouseState = new WebXMouseState({
        x: 0,
        y: 0,
        left: false,
        middle: false,
        right: false,
        up: false,
        down: false
    });


    /**
     * The minimum amount of pixels scrolled required for a single scroll button
     * click.
     */
    private _scrollThreshold: number = 53;

    /**
     * The number of pixels to scroll per line.
     */

    private _pixelsPerLine: number = 18;

    /**
     * The number of pixels to scroll per page.
     */
    private _pixelsPerPage: number;

    public get scrollThreshold(): number {
        return this._scrollThreshold;
    }

    public get pixelsPerLine(): number {
        return this._pixelsPerLine;
    }

    public set pixelsPerLine(value: number) {
        this._pixelsPerLine = value;
    }


    /**
     * Provides cross-browser mouse events for a given element
     * @param element The element to use to provide mouse events
     */
    constructor(private element: HTMLElement, config?: { pixelsPerLine?: number, scrollThreshold?: number }) {
        if(config) {
            this.setConfiguration(config);
        }
        this.bindListeners();
    }

    /**
     * Set the mouse configuration
     * @param config the configuration
     */
    private setConfiguration(config: { pixelsPerLine?: number, scrollThreshold?: number }): void {
        const { pixelsPerLine, scrollThreshold } = config;
        this._pixelsPerLine = pixelsPerLine || this._pixelsPerLine;
        this._scrollThreshold = scrollThreshold || this._scrollThreshold;
    }

    /**
     * Cancel a mouse event
     * @param event the event to cancel
     */
    private cancelEvent(event: Event): void {
        event.stopPropagation();
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.returnValue = false;
    }

    /**
     * Bind the mouse listeners to the given element
     */
    private bindListeners(): void {
        const element = this.element;

        element.addEventListener("contextmenu", this.processContextMenu.bind(this), false);
        element.addEventListener('mousemove', this.processMouseMove.bind(this));
        element.addEventListener('mousedown', this.processMouseDown.bind(this));
        element.addEventListener('mouseup', this.processMouseUp.bind(this));
        element.addEventListener('mouseout', this.processMouseOut.bind(this));
        ['DOMMouseScroll', 'mousewheel', 'wheel'].forEach(listener => {
            element.addEventListener(listener, this.processMouseWheel.bind(this));
        });
    }

    /**
     * Process mouse up event
     * @param event the mouse event
     */
    private processMouseUp(event: MouseEvent): void {
        const currentMouseState = this.currentMouseState;
        switch (event.button) {
            case 0:
                currentMouseState.left = false;
                break;
            case 1:
                currentMouseState.middle = false;
                break;
            case 2:
                currentMouseState.right = false;
                break;
        }
        this.handleMouseUp(currentMouseState);
    }


    /**
     * Process mouse down event
     * @param event the mouse event
     */
    private processMouseDown(event: MouseEvent): void {
        const currentMouseState = this.currentMouseState;
        switch (event.button) {
            case 0:
                currentMouseState.left = true;
                break;
            case 1:
                currentMouseState.middle = true;
                break;
            case 2:
                currentMouseState.right = true;
                break;
        }
        this.handleMouseDown(currentMouseState);
    }


    /**
     * Process mouse wheel event
     * @param event the mouse event
     */
    private processMouseWheel(event: MouseEvent): void {

    }


    /**
     * Process mouse out event
     * @param event the mouse event
     */
    private processMouseOut(event: MouseEvent): void {

    }

    /**
     * Process the mouse move event
     * @param event the mouse event
     */
    private processMouseMove(event: Event): void {

    }


    /**
     * Process the context menu event
     * Block context menu so right-click gets sent properly
     * @param event the mouse event
     */
    private processContextMenu(event: MouseEvent): void {
        this.cancelEvent(event);
    }

    /**
     * Fired whenever the user moves the mouse
     * @param mouseState the current mouse state
     */
    handleMouseMove(mouseState: WebXMouseState): void {
        throw new Error('Handler not implemented');
    }

    /**
     * Fired whenever a mouse button is effectively pressed. This can happen
     * as part of a "click" gesture initiated by the user by tapping one
     * or more fingers over the touchpad element, as part of a "scroll"
     * gesture initiated by dragging two fingers up or down, etc.
     * 
     * @param mouseState the current mouse state
     */
    handleMouseDown(mouseState: WebXMouseState): void {
        throw new Error('Handler not implemented');
    }

    /**
     * Fired whenever a mouse button is effectively released. This can happen
     * as part of a "click" gesture initiated by the user by tapping one
     * or more fingers over the touchpad element, as part of a "scroll"
     * gesture initiated by dragging two fingers up or down, etc.
     * @param mouseState the current mouse state
     */
    handleMouseUp(mouseState: WebXMouseState): void {
        throw new Error('Handler not implemented');
    }



}