import { WebXInstruction } from './WebXInstruction';

export class WebXInstructionResponse<T> {
  private _onResponseReceived: (message: T) => void;
  private _onTimeout: () => void;
  private _timeoutMs: number;
  private _timeoutId: number = 0;

  constructor(private _instruction: WebXInstruction) {}

  then(onResponseReceived: (message: T) => void): WebXInstructionResponse<T> {
    this._onResponseReceived = onResponseReceived;
    return this;
  }

  timeout(timeoutMs: number, onTimeout: () => void): WebXInstructionResponse<T> {
    this._timeoutMs = timeoutMs;
    this._onTimeout = onTimeout;

    this._timeoutId = setTimeout(this._onTimeout.bind(this), this._timeoutMs);
    return this;
  }

  resolve(message: T): void {
    if (this._timeoutId > 0) {
      clearTimeout(this._timeoutId);
    }
    if (this._onResponseReceived != null) {
      this._onResponseReceived(message);
    }
  }
}
