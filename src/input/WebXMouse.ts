import { WebXMouseState } from './mouse';

export class WebXMouse {

    private _element: HTMLElement;

    /**
     * The current mouse state. The properties of this state are updated when
     * mouse events fire. This state object is also passed in as a parameter to
     * the handler of any mouse events.
     */
    private _currentState = new WebXMouseState({
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
    private _pixelsPerPage: number = this._pixelsPerLine * 16;

    /**
     * Cumulative scroll delta amount. This value is accumulated through scroll
     * events and results in scroll button clicks if it exceeds a certain
     * threshold.
     */
    private _scrollDelta: number = 0;

    public get scrollThreshold(): number {
        return this._scrollThreshold;
    }

    public set scrollThreshold(scrollThreshold: number) {
        this._scrollThreshold = scrollThreshold;
    }

    public get pixelsPerLine(): number {
        return this._pixelsPerLine;
    }

    public set pixelsPerLine(value: number) {
        this._pixelsPerLine = value;
        this._pixelsPerPage = value * 16;
    }


    /**
     * Provides cross-browser mouse events for a given element
     * @param _element The element to use to provide mouse events
     */
    constructor(private element: HTMLElement, config?: { pixelsPerLine?: number, scrollThreshold?: number }) {
        this._element = element;
        if (config) {
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
        this.pixelsPerLine = pixelsPerLine || this._pixelsPerLine;
        this.scrollThreshold = scrollThreshold || this._scrollThreshold;
    }

    /**
     * Cancel an event
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
        const element = this._element;
        element.addEventListener("contextmenu", this.handleContextMenu.bind(this), false);
        element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        element.addEventListener('mouseup', this.handleMouseUp.bind(this));
        element.addEventListener('mouseout', this.handleMouseOut.bind(this));
        ['DOMMouseScroll', 'mousewheel', 'wheel'].forEach(listener => {
            element.addEventListener(listener, this.handleMouseWheel.bind(this), { passive: true });
        });
    }

    /**
     * Process mouse up event
     * @param event the mouse event
     */
    private handleMouseUp(event: MouseEvent): void {
        const currentState = this._currentState;
        switch (event.button) {
            case 0:
                currentState.left = false;
                break;
            case 1:
                currentState.middle = false;
                break;
            case 2:
                currentState.right = false;
                break;
        }
        this.onMouseUp(currentState);
    }

    /**
     * Process mouse down event
     * @param event the mouse event
     */
    private handleMouseDown(event: MouseEvent): void {
        const currentState = this._currentState;
        switch (event.button) {
            case 0:
                currentState.left = true;
                break;
            case 1:
                currentState.middle = true;
                break;
            case 2:
                currentState.right = true;
                break;
        }
        this.onMouseDown(currentState);
    }

    /**
     * Process mouse wheel event
     * @param event the mouse event
     */
    private handleMouseWheel(event: MouseWheelEvent): void {
        // Determine approximate scroll amount (in pixels)
        let delta = event.deltaY;
        // If successfully retrieved scroll amount, convert to pixels if not
        // already in pixels
        if (delta) {

            // Convert to pixels if delta was lines
            if (event.deltaMode === 1) {
                delta = event.deltaY * this._pixelsPerLine;
            }
            // Convert to pixels if delta was pages
            else if (event.deltaMode === 2) {
                delta = event.deltaY * this._pixelsPerPage;
            }

        } else {
            // Otherwise, assume legacy mousewheel event and line scrolling
            delta = event.detail * this._pixelsPerLine;
        }

        // Update overall delta
        this._scrollDelta += delta;

        // Up
        if (this._scrollDelta <= -this._scrollThreshold) {

            // Repeatedly click the up button until insufficient delta remains
            do {
                const currentState = this._currentState;
                currentState.up = true;
                this.onMouseDown(currentState);

                currentState.up = false;
                this.onMouseUp(currentState);

                this._scrollDelta += this._scrollThreshold;

            } while (this._scrollDelta <= -this._scrollThreshold);

            // Reset delta
            this._scrollDelta = 0;
        }

        // Down
        if (this._scrollDelta >= this._scrollThreshold) {
            // Repeatedly click the down button until insufficient delta remains
            do {
                const currentState = this._currentState;

                currentState.down = true;
                this.onMouseDown(currentState);

                currentState.down = false;
                this.onMouseUp(currentState);

                this._scrollDelta -= this._scrollThreshold;

            } while (this._scrollDelta >= this._scrollThreshold);

            // Reset delta
            this._scrollDelta = 0;
        }
    }

    /**
     * Process mouse out event
     * @param event the mouse event
     */
    private handleMouseOut(event: MouseEvent): void {
        // reset all buttons
        const currentState = this._currentState;
        currentState.releaseButtons();
        this.onMouseUp(currentState);
        this.onMouseOut(currentState);
    }

    /**
     * Process the mouse move event
     * @param event the mouse event
     */
    private handleMouseMove(event: MouseEvent): void {
        const currentState = this._currentState;
        const bounds = this._element.getBoundingClientRect();
        currentState.x = event.clientX - bounds.left;
        currentState.y = event.clientY - bounds.top;
        this.onMouseMove(currentState);
    }

    /**
     * Process the context menu event
     * Block context menu so right-click gets sent properly
     * @param event the mouse event
     */
    private handleContextMenu(event: MouseEvent): void {
        this.cancelEvent(event);
    }

    /**
     * Fired whenever the user moves the mouse
     * @param mouseState the current mouse state
     */
    onMouseMove(mouseState: WebXMouseState): void {
    }

    /**
     * Fired whenever a mouse button is effectively pressed. This can happen
     * as part of a "click" gesture initiated by the user by tapping one
     * or more fingers over the touchpad element, as part of a "scroll"
     * gesture initiated by dragging two fingers up or down, etc.
     * 
     * @param mouseState the current mouse state
     */
    onMouseDown(mouseState: WebXMouseState): void {
    }

    /**
     * Fired whenever a mouse button is effectively released. This can happen
     * as part of a "click" gesture initiated by the user by tapping one
     * or more fingers over the touchpad element, as part of a "scroll"
     * gesture initiated by dragging two fingers up or down, etc.
     * @param mouseState the current mouse state
     */
    onMouseUp(mouseState: WebXMouseState): void {
    }

    /**
     * Fired whenever the mouse leaves the boundaries of the element associated
     * with this mouse
     * 
     * @param mouseState the current mouse state
     */
    onMouseOut(mouseState: WebXMouseState): void {
    }


}