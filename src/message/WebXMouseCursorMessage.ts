import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import { Texture } from 'three';

export class WebXMouseCursorMessage extends WebXMessage {
  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get xHot(): number {
    return this._xHot;
  }

  get yHot(): number {
    return this._yHot;
  }

  get id(): number {
    return this._id;
  }

  public get texture(): Texture {
    return this._texture;
  }

  constructor(private _x: number, private _y: number, private _xHot: number, private _yHot: number, private _id: number, private _texture: Texture, commandId?: number) {
    super(WebXMessageType.MOUSE_CURSOR, commandId);
  }
}
