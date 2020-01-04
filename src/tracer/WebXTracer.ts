export abstract class WebXTracer<T> {

  protected _handler: (data: T) => void = null;

  constructor(handler: (data: T) => void) {
    this._handler = handler;
  }

  abstract handle(data: T): void;
}
