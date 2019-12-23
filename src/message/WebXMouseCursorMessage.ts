import { WebXMessage } from "./WebXMessage";
import { WebXMessageType } from "./WebXMessageType";
import { Texture } from "three";

export class WebXMouseCursorMessage extends WebXMessage {
    

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    public get texture(): Texture {
        return this._texture;
    }

    constructor(private _x: number, private  _y: number, private _texture: Texture, commandId?: number) {
        super(WebXMessageType.MOUSE_CURSOR, commandId);
    }


}