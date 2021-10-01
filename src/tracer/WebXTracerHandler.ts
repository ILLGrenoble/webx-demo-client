export interface WebXTracerHandler<T> {

  handle(data: T): void;
}
