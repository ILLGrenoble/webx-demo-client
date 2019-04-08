import { WebXMessage } from "./WebXMessage";
import { WebXMessageType } from "./WebXMessageType";
import { Texture } from "three";

export class WebXImageMessage extends WebXMessage {
    
    public get windowId(): number {
        return this._windowId;
    }

    public get texture(): Texture {
        return this._texture;
    }

    constructor(private _windowId: number, private _texture: Texture, commandId?: number) {
        super(WebXMessageType.IMAGE, commandId);
    }
}