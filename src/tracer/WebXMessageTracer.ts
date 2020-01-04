import { WebXTracer } from "./WebXTracer";
import { WebXMessage } from "../message";

export class WebXMessageTracer extends WebXTracer<WebXMessage> {

  constructor(handler: (message: WebXMessage) => void) {
    super(handler);
  }

  handle(message: WebXMessage): void {
    if (this._handler) {
      this._handler(message);
    }
  }

}
