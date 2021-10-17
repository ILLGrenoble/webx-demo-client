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

  get alphaTexture(): Texture {
    return this._alphaTexture;
  }

  constructor(private _windowId: number, private _depth: number, private _texture: Texture, private _alphaTexture: Texture, commandId: number, private _size: number) {
    super(WebXMessageType.IMAGE, commandId);
  }
}