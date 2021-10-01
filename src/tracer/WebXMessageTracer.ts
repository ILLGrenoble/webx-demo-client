import { WebXTracer } from "./WebXTracer";
import { WebXMessage } from "../message";
import {WebXTracerHandler} from "./WebXTracerHandler";

export class WebXMessageTracer extends WebXTracer<WebXMessage> {

  constructor(...handlers: WebXTracerHandler<WebXMessage>[]) {
    super(handlers);
  }

}
