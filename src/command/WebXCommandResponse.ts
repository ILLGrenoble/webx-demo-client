import { WebXCommand } from "./WebXCommand";

export class WebXCommandResponse<T> {

    private _onResponseReceived: (message: T) => void;
    private _onTimeout: () => void;
    private _timeoutMs: number;
    private _timeoutId: number = 0;

    constructor(private command: WebXCommand) {
    }

    then(onResponseReceived: (message: T) => void): WebXCommandResponse<T> {
        this._onResponseReceived = onResponseReceived;
        return this;
    }

    timeout(timeoutMs: number, onTimeout: () => void): WebXCommandResponse<T> {
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