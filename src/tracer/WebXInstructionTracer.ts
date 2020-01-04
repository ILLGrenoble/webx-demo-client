import { WebXTracer } from "./WebXTracer";
import { WebXInstruction } from "../instruction";

export class WebXInstructionTracer extends WebXTracer<WebXInstruction> {

  constructor(handler: (instruction: WebXInstruction) => void) {
    super(handler);
  }

  handle(instruction: WebXInstruction): void {
    if (this._handler) {
      this._handler(instruction);
    }
  }

}
