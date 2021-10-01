import {WebXTracerHandler} from "./WebXTracerHandler";
import {WebXAsyncExec} from "../utils";

export abstract class WebXTracer<T> {

  protected _handlers: WebXTracerHandler<T>[] = [];

  constructor(handlers: WebXTracerHandler<T>[]) {
    this._handlers = handlers;
  }

  handle(data: T): void {
    this._handlers.forEach(handler => new WebXAsyncExec(handler.handle.bind(handler)).exec(data));
    // this._handlers.forEach(handler => handler.handle(data);
  }

  addHandler(handler: WebXTracerHandler<T>) {
    this._handlers.push(handler);
  }
}
