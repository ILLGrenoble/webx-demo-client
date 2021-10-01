import {WebXTracerHandler} from "../../tracer/WebXTracerHandler";
import {WebXImageMessage, WebXMessage, WebXMessageType, WebXSubImagesMessage} from "../../message";

export class DemoBasicMessageHandler implements WebXTracerHandler<WebXMessage> {

  private _messages: WebXMessage[] = [];
  private _el: HTMLElement;
  private readonly _fragment: DocumentFragment;

  constructor() {
    this._el = document.getElementById('messages');
    this._fragment = document.createDocumentFragment();
  }

  handle(message: WebXMessage): void {
    this._messages.push(message);
    if (this._messages.length > 25) {
      this._messages.shift();
    }
    const els = this._messages.map((message) => this.createMessageElement(this.createMessageText(message)))
    this._fragment.append(...els);
    this._el.replaceChildren(this._fragment)
    this._el.scrollTop = this._el.scrollHeight;
  }

  private createMessageElement (html: string): HTMLElement {
    const el = document.createElement('div');
    el.classList.add('events__message');
    el.innerHTML = html;
    return el;
  }

  private createMessageText(message: WebXMessage) {
    if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      return `IMAGE (${imageMessage.texture.image.width} x ${imageMessage.texture.image.height})`;

    } else {
      return WebXMessageType[message.type];
    }
  }
}
