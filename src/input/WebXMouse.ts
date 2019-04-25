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
     * Provides cross-browser mouse events for a given element
     * @param _element The element to use to provide mouse events
     */
    constructor(private element: HTMLElement) {
        this._element = element;
        this.bindListeners();
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
        element.addEventListener('keydown', this.handleKeyDown.bind(this));
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
        const currentState = this._currentState;
        if (event.deltaY < 0) {
            currentState.up = true;
            this.onMouseDown(currentState);

            currentState.up = false;
            this.onMouseUp(currentState);
        }

        if (event.deltaY > 0) {
            currentState.down = true;
            this.onMouseDown(currentState);

            currentState.down = false;
            this.onMouseUp(currentState);

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
     * Handle keydown event
     * @param event the keyboard event
     */
    private handleKeyDown(event: KeyboardEvent): void {
        console.log('etting shift', event);
        console.log('Num lock', event.getModifierState("NumLock"));
        if (event.shiftKey) {
            this._currentState.shift = true;
        }
        if (event.ctrlKey) {
            this._currentState.ctrl = true;
        }
        if (event.altKey) {
            console.log('Got alt key');
            this._currentState.alt = true;
        }
        this.onKeyDown(this._currentState);
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


    onKeyDown(mouseState: WebXMouseState): void {

    }


}