import { WebXTunnel } from './tunnel';
import { WebXInstruction, WebXScreenInstruction, WebXKeyboardInstruction, WebXMouseInstruction } from './instruction';
import { WebXMessageType, WebXMessage, WebXWindowsMessage, WebXImageMessage, WebXSubImagesMessage } from './message';
import { WebXWindowProperties, WebXSubImage } from './display';
import { WebXTextureFactory } from './display/WebXTextureFactory';
import { Texture } from 'three';
import { WebXScreenMessage } from './message/WebXScreenMessage';
import { WebXMouseCursorMessage } from './message/WebXMouseCursorMessage';
import { WebXMouseState, WebXMouse, WebXKeyboard } from './input';

const noop = function() {};

export class WebXClient {

  private _onWindows: (windows: Array<WebXWindowProperties>) => void = null;
  private _onImage: (windowId: number, depth: number, texture: Texture) => void = null;
  private _onSubImages: (windowId: number, subImages: WebXSubImage[]) => void = null;
  private _onMouseCursor: (x: number, y: number, xHot: number, yHot: number, name: string, texture: Texture) => void = null;

  get onWindows(): (windows: Array<WebXWindowProperties>) => void {
    return this._onWindows ? this._onWindows : noop;
  }

  set onWindows(func: (windows: Array<WebXWindowProperties>) => void) {
    this._onWindows = func;
  }

  get onImage(): (windowId: number, depth: number, texture: Texture) => void {
    return this._onImage ? this._onImage : noop;
  }

  set onImage(func: (windowId: number, depth: number, texture: Texture) => void) {
    this._onImage = func;
  }

  get onSubImages(): (windowId: number, subImages: WebXSubImage[]) => void {
    return this._onSubImages ? this._onSubImages : noop;
  }

  set onSubImages(func: (windowId: number, subImages: WebXSubImage[]) => void) {
    this._onSubImages = func;
  }

  get onMouseCursor(): (x: number, y: number, xHot: number, yHot: number, name: string, texture: Texture) => void {
    return this._onMouseCursor ? this._onMouseCursor : noop;
  }

  set onMouseCursor(func: (x: number, y: number, xHot: number, yHot: number, name: string, texture: Texture) => void) {
    this._onMouseCursor = func;
  }

  constructor(private _tunnel: WebXTunnel) {
    this._tunnel.handleMessage = this.handleMessage.bind(this);
    WebXTextureFactory.initInstance(this._tunnel);
  }

  connect(): Promise<WebXScreenMessage> {
    return this._tunnel.connect().then(data => {
      // When connect get configuration from server
      return this.sendRequest(new WebXScreenInstruction()) as Promise<WebXScreenMessage>;
    });
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
    console.log('Sending instruction');
    this._tunnel.sendInstruction(command);
  }

  sendRequest(command: WebXInstruction): Promise<WebXMessage> {
    return this._tunnel.sendRequest(command);
  }

  handleMessage(message: WebXMessage) {
    if (message.type === WebXMessageType.WINDOWS) {
      const windows = (message as WebXWindowsMessage).windows;
      this.onWindows(windows);

    } else if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      this.onImage(imageMessage.windowId, imageMessage.depth, imageMessage.texture);

    } else if (message.type === WebXMessageType.SUBIMAGES) {
      const subImagesMessage = message as WebXSubImagesMessage;
      this.onSubImages(subImagesMessage.windowId, subImagesMessage.subImages);
      
    } else if (message.type === WebXMessageType.MOUSE_CURSOR) {
      const mouseCursorMessage = message as WebXMouseCursorMessage;
      this.onMouseCursor(mouseCursorMessage.x, mouseCursorMessage.y, mouseCursorMessage.xHot, mouseCursorMessage.yHot, mouseCursorMessage.name, mouseCursorMessage.texture);
    }
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


}
