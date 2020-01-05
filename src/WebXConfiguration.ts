import { WebXMessageTracer, WebXInstructionTracer } from "./tracer";

export interface WebXConfiguration {
  tracers?: {
    message: WebXMessageTracer;
    instruction: WebXInstructionTracer;
  };
}
