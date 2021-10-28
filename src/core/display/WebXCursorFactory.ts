import { WebXTunnel } from '../tunnel';
import { WebXCursorImageMessage } from '../message';
import { WebXCursorImageInstruction } from '../instruction';
import { Texture } from 'three';

export interface WebXCursorData {
  xHot: number;
  yHot: number;
  cursorId: number;
  texture: Texture;
}

export class WebXCursorFactory {
  private static _INSTANCE: WebXCursorFactory;

  private _cursorMap: Map<number, WebXCursorData> = new Map();

  private constructor(private _tunnel: WebXTunnel) {}

  public static initInstance(tunnel: WebXTunnel): WebXCursorFactory {
    if (WebXCursorFactory._INSTANCE == null) {
      WebXCursorFactory._INSTANCE = new WebXCursorFactory(tunnel);
    }
    return WebXCursorFactory._INSTANCE;
  }

  public static instance(): WebXCursorFactory {
    return WebXCursorFactory._INSTANCE;
  }

  public getCursor(cursorId?: number): Promise<{x?: number; y?: number; cursor: WebXCursorData}> {
    return new Promise<{ x?: number; y?: number; cursor: WebXCursorData }>((resolve) => {
      const cursorData = this._cursorMap.get(cursorId);
      if (cursorData != null) {
        resolve({ cursor: cursorData });
      } else {
        this._tunnel.sendRequest(new WebXCursorImageInstruction(cursorId)).then((response: WebXCursorImageMessage) => {
          const newCursorData = {
            xHot: response.xHot,
            yHot: response.yHot,
            cursorId: response.cursorId,
            texture: response.texture
          }

          this._cursorMap.set(response.cursorId, newCursorData);

          resolve({
            x: response.x,
            y: response.y,
            cursor: newCursorData
          });
        });
      }
    });
  }
}
