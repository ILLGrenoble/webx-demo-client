import { WebXTunnel } from './tunnel';
import { WebXInstruction, WebXScreenInstruction, WebXKeyboardInstruction, WebXMouseInstruction } from './instruction';
import { WebXMessageType, WebXMessage, WebXWindowsMessage, WebXImageMessage, WebXSubImagesMessage, WebXMouseMessage  } from './message';
import { WebXWindowProperties, WebXSubImage, WebXDisplay } from './display';
import { WebXTextureFactory } from './display';
import { Texture } from 'three';
import { WebXScreenMessage } from './message';
import { WebXMouseState, WebXMouse, WebXKeyboard } from './input';
import { WebXConfiguration } from './WebXConfiguration';
import { WebXMessageHandler, WebXInstructionHandler } from './tracer';
import { WebXCursorFactory } from './display/WebXCursorFactory';

const noop = function() {};

export class WebXClient {

  private _onWindows: (windows: Array<WebXWindowProperties>) => void = null;
  private _onImage: (windowId: number, depth: number, colorMap: Texture, alphaMap: Texture) => void = null;
  private _onSubImages: (windowId: number, subImages: WebXSubImage[]) => void = null;
  private _onMouse: (x: number, y: number, cursorId: number) => void = null;
  private _tracers: Map<string, WebXMessageHandler | WebXInstructionHandler> = new Map();

  get onWindows(): (windows: Array<WebXWindowProperties>) => void {
    return this._onWindows ? this._onWindows : noop;
  }

  set onWindows(func: (windows: Array<WebXWindowProperties>) => void) {
    this._onWindows = func;
  }

  get onImage(): (windowId: number, depth: number, colorMap: Texture, alphaMap: Texture) => void {
    return this._onImage ? this._onImage : noop;
  }

  set onImage(func: (windowId: number, depth: number, colorMap: Texture, alphaMap: Texture) => void) {
    this._onImage = func;
  }

  get onSubImages(): (windowId: number, subImages: WebXSubImage[]) => void {
    return this._onSubImages ? this._onSubImages : noop;
  }

  set onSubImages(func: (windowId: number, subImages: WebXSubImage[]) => void) {
    this._onSubImages = func;
  }

  get onMouse(): (x: number, y: number, cursorId: number) => void {
    return this._onMouse ? this._onMouse : noop;
  }

  set onMouse(func: (x: number, y: number, cursorId: number) => void) {
    this._onMouse = func;
  }

  get tracers(): Map<string,WebXMessageHandler | WebXInstructionHandler> {
    return this._tracers;
  }

  constructor(private _tunnel: WebXTunnel, private _config: WebXConfiguration) {
    WebXTextureFactory.initInstance(this._tunnel);
    WebXCursorFactory.initInstance(this._tunnel);
  }

  connect(): Promise<WebXScreenMessage> {
    return this._tunnel.connect().then(data => {
      this._tunnel.handleMessage = this.handleMessage.bind(this);

      // When connect get configuration from server
      return this.sendRequest(new WebXScreenInstruction()) as Promise<WebXScreenMessage>;
    });
  }

  /**
   *
   * @param containerElement The main container
   * @param screenWidth  the screen width
   * @param screenHeight the screen height
   */
  createDisplay(containerElement: HTMLElement, screenWidth: number, screenHeight: number): WebXDisplay {
    return new WebXDisplay(containerElement, screenWidth, screenHeight);
  }

  /**
   * Create a new mouse and bind it to an element
   * @param element the element to attach the mouse to
   */
  createMouse(element: HTMLElement): WebXMouse {
    return new WebXMouse(element);
  }

    /**
   * Create a new keyboard and bind it to an element
   * @param element the element to attach the keyboard to
   */
  createKeyboard(element: HTMLElement): WebXKeyboard {
    return new WebXKeyboard(element);
  }

  sendInstruction(command: WebXInstruction): void {
    this._tunnel.sendInstruction(command);
    this._tracers.forEach((value, key) => {
      if(value instanceof WebXInstructionHandler) {
          value.handle(command);
        }
    });
  }

  sendRequest(command: WebXInstruction): Promise<WebXMessage> {
    return this._tunnel.sendRequest(command);
  }

  handleMessage(message: WebXMessage): void {
    if (message.type === WebXMessageType.WINDOWS) {
      const windows = (message as WebXWindowsMessage).windows;
      this.onWindows(windows);

    } else if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      this.onImage(imageMessage.windowId, imageMessage.depth, imageMessage.colorMap, imageMessage.alphaMap);

    } else if (message.type === WebXMessageType.SUBIMAGES) {
      const subImagesMessage = message as WebXSubImagesMessage;
      this.onSubImages(subImagesMessage.windowId, subImagesMessage.subImages);

    } else if (message.type === WebXMessageType.MOUSE) {
      const mouseMessage = message as WebXMouseMessage;
      this.onMouse(mouseMessage.x, mouseMessage.y, mouseMessage.cursorId);
    }

    this._tracers.forEach((value, key) => {
      if(value instanceof WebXMessageHandler) {
        value.handle(message);
      }
    });

  }

  /**
   * Sends a mouse event having the properties provided by the given mouse state
   * @param mouseState the state of the mouse to send in the mouse event
   */
  sendMouse(mouseState: WebXMouseState): void {
    this.sendInstruction(new WebXMouseInstruction(mouseState.x, mouseState.y, mouseState.getButtonMask()));
  }

  /**
   * Sends a key event
   * @param pressed {Boolean} Whether the key is pressed (true) or released (false)
   * @param key {number} the key to send
   */
  sendKeyEvent(key: number, pressed: boolean): void {
    this.sendInstruction(new WebXKeyboardInstruction(key, pressed));
  }

  /**
   * Sends a key down event
   * @param key {number} the key to send
   */
  sendKeyDown(key: number): void {
    this.sendKeyEvent(key, true);
  }

  /**
   * Sends a key up event
   * @param key {number} the key to send
   */
  sendKeyUp(key: number): void {
    this.sendKeyEvent(key, false);
  }

  /**
   * Register a new tracer handler
   * @param name the name of the tracer (must be unique)
   * @param handler the tracer handler
   */
  registerTracer(name: string, handler: WebXMessageHandler | WebXInstructionHandler): void {
    this._tracers.set(name, handler);
  }

  /**
   * Unregister a tracer
   * @param name the name of the tracer
   */
  unregisterTracer(name: string): void {
    if(this._tracers.has(name)) {
      this._tracers.delete(name);
    }
  }

}
