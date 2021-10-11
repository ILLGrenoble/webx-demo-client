import { WebXTunnel } from '../tunnel';
import { WebXImageInstruction } from '../instruction';
import { Texture } from 'three';
import { WebXImageMessage } from '../message';

export class WebXTextureFactory {
  private static _INSTANCE: WebXTextureFactory;

  private constructor(private _tunnel: WebXTunnel) {}

  public static initInstance(tunnel: WebXTunnel): WebXTextureFactory {
    if (WebXTextureFactory._INSTANCE == null) {
      WebXTextureFactory._INSTANCE = new WebXTextureFactory(tunnel);
    }
    return WebXTextureFactory._INSTANCE;
  }

  public static instance(): WebXTextureFactory {
    return WebXTextureFactory._INSTANCE;
  }

  public getWindowTexture(windowId: number): Promise<{ depth: number; texture: Texture }> {
    return new Promise<{ depth: number; texture: Texture }>((resolve) => {
      return this._tunnel.sendRequest(new WebXImageInstruction(windowId)).then((response: WebXImageMessage) => {
        resolve({
          depth: response.depth,
          texture: response.texture
        });
      });
    });
  }
}
