import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import { Texture } from 'three';

export class WebXImageMessage extends WebXMessage {
  public get windowId(): number {
    return this._windowId;
  }

  public get depth(): number {
    return this._depth;
  }

  public get texture(): Texture {
    return this._texture;
  }

  public get size(): number {
    return this._size;
  }

  constructor(private _windowId: number, private _depth: number, private _texture: Texture, commandId: number, private _size: number) {
    super(WebXMessageType.IMAGE, commandId);
  }
}
