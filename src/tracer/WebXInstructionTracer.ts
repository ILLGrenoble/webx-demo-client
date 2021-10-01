import { WebXTracer } from "./WebXTracer";
import { WebXInstruction } from "../instruction";
import {WebXTracerHandler} from "./WebXTracerHandler";

export class WebXInstructionTracer extends WebXTracer<WebXInstruction> {

  constructor(...handlers: WebXTracerHandler<WebXInstruction>[]) {
    super(handlers);
  }

}
