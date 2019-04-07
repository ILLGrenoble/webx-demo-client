
import { WebXMessage } from "./WebXMessage";
import { WebXMessageType } from "./WebXMessageType";

export class WebXConnectionMessage extends WebXMessage {
    
    public get screenSize(): {width: number, height: number} {
        return this._screenSize;
    }

    constructor(private _screenSize: {width: number, height: number}, commandId?: number) {
        super(WebXMessageType.CONNECT, commandId);
    }
}