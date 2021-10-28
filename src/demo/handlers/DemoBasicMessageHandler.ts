import {
  WebXFileSize,
  WebXHandler,
  WebXImageMessage,
  WebXMessage,
  WebXMessageHandler,
  WebXMessageType,
  WebXMouseMessage,
  WebXScreenMessage,
  WebXSubImagesMessage,
  WebXWindowsMessage
} from '../../core';

export class DemoBasicMessageHandler extends WebXMessageHandler implements WebXHandler {

  private _messages: WebXMessage[] = [];
  private _el: HTMLElement;
  private readonly _fragment: DocumentFragment;

  constructor() {
    super();
    this._el = document.getElementById('messages');
    this._fragment = document.createDocumentFragment();
  }

  private _createMessageElement(message: WebXMessage): HTMLElement {
    const el = document.createElement('tr');
    const details = this._createMessageText(message);
    el.innerHTML = `
        <td>${WebXMessageType[message.type]}</td>
        <td>${details}</td>
    `;
    return el;
  }

  private _createMessageText(message: WebXMessage): string {
    if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      const size = WebXFileSize.humanFileSize(imageMessage.size);
      const { width, height } = imageMessage.colorMap.image;
      return `${width} x ${height} (${size})`;

    } else if (message.type === WebXMessageType.SUBIMAGES) {
      const subImagesMessage = message as WebXSubImagesMessage;
      const size = WebXFileSize.humanFileSize(subImagesMessage.size);
      return `count = ${subImagesMessage.subImages.length} (${size})`;

    } else if (message.type === WebXMessageType.MOUSE) {
      const mouseMessage = message as WebXMouseMessage;
      return `x = ${mouseMessage.x}, y = ${mouseMessage.y}, cursorId = ${mouseMessage.cursorId}`;

    } else if (message.type === WebXMessageType.SCREEN) {
      const screenMessage = message as WebXScreenMessage;
      return `${screenMessage.screenSize.width} x ${screenMessage.screenSize.height}`;

    } else if (message.type === WebXMessageType.WINDOWS) {
      const windowsMessage = message as WebXWindowsMessage;
      return `count = ${windowsMessage.windows.length}`;

    } else {
      return `${WebXMessageType[message.type]}`;
    }
  }

  handle(message: WebXMessage): void {
    this._messages.push(message);
    if (this._messages.length > 25) {
      this._messages.shift();
    }
    const els = this._messages.map(m => this._createMessageElement(m));
    this._fragment.append(...els);
    this._el.replaceChildren(this._fragment);
    this._el.scrollTop = this._el.scrollHeight;
  }

  destroy(): void {
  }

}
