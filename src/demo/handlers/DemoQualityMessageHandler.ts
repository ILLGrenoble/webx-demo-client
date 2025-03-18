import {
  WebXHandler,
  WebXMessage,
  WebXMessageHandler,
  WebXMessageType,
  WebXQualityMessage
} from '@illgrenoble/webx-client';

export class DemoQualityMessageHandler extends WebXMessageHandler implements WebXHandler {

  private _qualityElement: HTMLInputElement;

  constructor() {
    super();

    this._qualityElement = document.getElementById('quality-slider') as HTMLInputElement;
  }

  handle(message: WebXMessage): void {
    if (message.type == WebXMessageType.QUALITY) {
      const qualityMessage = message as WebXQualityMessage;
      this._qualityElement.value = `${qualityMessage.index}`;
    }
  }

  destroy(): void {
    // do nothing
  }

}
