// @TODO Implement a mouse state and touchmove, touch start etc
// Perhaps use rxjs with subscriptions?
export class WebXMouse {

    /**
     * Provides cross-browser mouse events for a given element
     * @param element The element to use to provide mouse events
     */
    constructor(private element: HTMLElement) {
        this.bindListeners();
    }
    /**
     * Bind the mouse listeners to the given element
     */
    private bindListeners(): void {
        const element = this.element;

        element.addEventListener('mousemove', (event: MouseEvent) => {
            // do logic here
            this.handleMouseMove(event);
        });
        element.addEventListener('mousedown', (event: MouseEvent) => {
            // do logic here
            this.handleMouseDown(event);
        });
        element.addEventListener('mouseup', (event: MouseEvent) => {
            // do logic here
            this.handleMouseUp(event);
        });

        element.addEventListener('mouseout', (event: MouseEvent) => {
            // do logic here

        });

        ['DOMMouseScroll', 'mousewheel', 'wheel'].forEach(listener => {
            element.addEventListener(listener, (event: MouseEvent) => {
                // do logic here

            });
        });
    }

    /**
     * Fired whenever the user moves the mouse
     * @param mouseState the current mouse state
     */
    handleMouseMove(mouseState: any): void {
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
    handleMouseDown(mouseState: any): void {
        throw new Error('Handler not implemented');

    }


    /**
     * Fired whenever a mouse button is effectively released. This can happen
     * as part of a "click" gesture initiated by the user by tapping one
     * or more fingers over the touchpad element, as part of a "scroll"
     * gesture initiated by dragging two fingers up or down, etc.
     * @param mouseState the current mouse state
     */
    handleMouseUp(mouseState: any): void {
        throw new Error('Handler not implemented');
    }



}