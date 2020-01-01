import { WebXMouseState } from './mouse';

export class WebXMouse {
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
  constructor(private _element: HTMLElement) {
    this._bindListeners();
  }

  /**
   * Cancel an event
   * @param event the event to cancel
   */
  private _cancelEvent(event: Event): void {
    event.stopPropagation();
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.returnValue = false;
  }

  /**
   * Bind the mouse listeners to the given element
   */
  private _bindListeners(): void {
    const element = this._element;
    element.addEventListener('contextmenu', this._handleContextMenu.bind(this), false);
    element.addEventListener('mousemove', this._handleMouseMove.bind(this));
    element.addEventListener('mousedown', this._handleMouseDown.bind(this));
    element.addEventListener('mouseup', this._handleMouseUp.bind(this));
    element.addEventListener('mouseout', this._handleMouseOut.bind(this));
    ['DOMMouseScroll', 'mousewheel', 'wheel'].forEach(listener => {
      element.addEventListener(listener, this._handleMouseWheel.bind(this), { passive: true });
    });
  }

  /**
   * Process mouse up event
   * @param event the mouse event
   */
  private _handleMouseUp(event: MouseEvent): void {
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
  private _handleMouseDown(event: MouseEvent): void {
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
  private _handleMouseWheel(event: MouseWheelEvent): void {
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
  private _handleMouseOut(event: MouseEvent): void {
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
  private _handleMouseMove(event: MouseEvent): void {
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
  private _handleContextMenu(event: MouseEvent): void {
    this._cancelEvent(event);
  }


  /**
   * Fired whenever the user moves the mouse
   * @param mouseState the current mouse state
   */
  onMouseMove(mouseState: WebXMouseState): void {}

  /**
   * Fired whenever a mouse button is effectively pressed. This can happen
   * as part of a "click" gesture initiated by the user by tapping one
   * or more fingers over the touchpad element, as part of a "scroll"
   * gesture initiated by dragging two fingers up or down, etc.
   *
   * @param mouseState the current mouse state
   */
  onMouseDown(mouseState: WebXMouseState): void {}

  /**
   * Fired whenever a mouse button is effectively released. This can happen
   * as part of a "click" gesture initiated by the user by tapping one
   * or more fingers over the touchpad element, as part of a "scroll"
   * gesture initiated by dragging two fingers up or down, etc.
   * @param mouseState the current mouse state
   */
  onMouseUp(mouseState: WebXMouseState): void {}

  /**
   * Fired whenever the mouse leaves the boundaries of the element associated
   * with this mouse
   *
   * @param mouseState the current mouse state
   */
  onMouseOut(mouseState: WebXMouseState): void {}

}
