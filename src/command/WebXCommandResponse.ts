import { WebXCommand } from "./WebXCommand";

export class WebXCommandResponse<T> {

    private onResponseReceived: (message: T) => void;

    constructor(private command: WebXCommand) {
    }

    then(onResponseReceived: (message: T) => void): WebXCommandResponse<T> {
        this.onResponseReceived = onResponseReceived;
        return this;
    }

    resolve(message: T): void {
        if (this.onResponseReceived != null) {
            this.onResponseReceived(message);
        }
    }
}