import { WebXTunnel } from '../tunnel';
import { WebXImageInstruction } from '../instruction';
import { Texture } from 'three';
import { WebXImageMessage } from '../message';

export class WebXTextureFactory {
  private static _instance: WebXTextureFactory;

  private constructor(private _tunnel: WebXTunnel) {}

  public static initInstance(tunnel: WebXTunnel): WebXTextureFactory {
    if (WebXTextureFactory._instance == null) {
      WebXTextureFactory._instance = new WebXTextureFactory(tunnel);
    }
    return WebXTextureFactory._instance;
  }

  public static instance(): WebXTextureFactory {
    return WebXTextureFactory._instance;
  }

  public getWindowTexture(windowId: number): Promise<{ depth: number; texture: Texture }> {
    const promise: Promise<{ depth: number; texture: Texture }> = new Promise<{ depth: number; texture: Texture }>((resolve, reject) => {
      return this._tunnel.sendRequest(new WebXImageInstruction(windowId)).then((response: WebXImageMessage) => {
        resolve({
          depth: response.depth,
          texture: response.texture
        });
      });
    });

    return promise;
  }
}
