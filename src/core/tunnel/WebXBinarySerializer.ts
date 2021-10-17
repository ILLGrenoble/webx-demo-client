import { WebXSerializer } from './WebXSerializer';
import { WebXInstruction } from '../instruction';
import {
  WebXCursorImageMessage,
  WebXImageMessage,
  WebXMessage,
  WebXMessageType,
  WebXMouseMessage,
  WebXScreenMessage,
  WebXSubImagesMessage,
  WebXWindowsMessage
} from '../message';
import { WebXBinaryBuffer } from '../utils';
import { WebXSubImage, WebXWindowProperties } from '../display';
import { Texture } from 'three';

export class WebXBinarySerializer implements WebXSerializer {

  serializeInstruction(command: WebXInstruction): string {
    return command.toJsonString();
  }

  deserializeMessage(data: any): Promise<WebXMessage> {
    const arrayBuffer = data as ArrayBuffer;
    if (arrayBuffer.byteLength === 0) {
      console.warn('Got a zero length message');
      return new Promise<WebXMessage>((resolve, reject) => {
        resolve(null);
      });
    }

    const buffer: WebXBinaryBuffer = new WebXBinaryBuffer(arrayBuffer);
    const {messageTypeId} = buffer;

    /*if (buffer.messageTypeId === WebXMessageType.CONNECTION) {
    } else */
    if (messageTypeId === WebXMessageType.SCREEN) {
      return this._createScreenMessage(buffer);
    } else if (messageTypeId === WebXMessageType.WINDOWS) {
      return this._createWindowsMessage(buffer);
    } else if (messageTypeId === WebXMessageType.IMAGE) {
      return this._createImageMessage(buffer);
    } else if (messageTypeId === WebXMessageType.SUBIMAGES) {
      return this._createSubImagesMessage(buffer);
    } else if (messageTypeId === WebXMessageType.MOUSE) {
      return this._createMouseMessage(buffer);
    } else if (messageTypeId === WebXMessageType.CURSOR_IMAGE) {
      return this._createCursorImageMessage(buffer);
    }
  }

  private _determineMimeType(imageType: string): string {
    if(imageType.substr(0, 3) === 'jpg' || imageType === 'jpga')  {
      return 'image/jpeg';
    }
    else if(imageType.substr(0,3) === 'png') {
        return 'image/png';
    }
    return 'image/bmp';
  }

  private _createTextureFromImageBlob(blob: Blob): Promise<Texture> {
    return new Promise<Texture>((resolve) => {
      if(blob) {
        const texture: Texture = new Texture();
        texture.needsUpdate = true;
        texture.flipY = false;

        // not supported by all of the browsers at the moment
        // https://caniuse.com/createimagebitmap
        if(typeof createImageBitmap === 'function') {
          createImageBitmap(blob).then(bitmap => {
            texture.image = bitmap;
            resolve(texture);
          });
        } else {
          // fall back to the standard way of creating an image
          const url = URL.createObjectURL(blob);
          const image: HTMLImageElement = new Image();
          image.addEventListener('load', () => {
            texture.image = image;
            URL.revokeObjectURL(url);
            resolve(texture);
          });
          image.src = url;
        }
      } 
      else {
        resolve(null);
      }
    });
  }

  private _createImageMessage(buffer: WebXBinaryBuffer): Promise<WebXImageMessage> {
    return new Promise<WebXImageMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const windowId = buffer.getUint32();
      const depth = buffer.getUint32();
      const imageType = buffer.getString(4);
      const imageDataSize = buffer.getUint32();
      const alphaDataSize = buffer.getUint32();
      const imageData: Uint8Array = buffer.getUint8Array(imageDataSize);
      const alphaData: Uint8Array = buffer.getUint8Array(alphaDataSize);
      const blob = () => {
        if (imageDataSize > 0) {
          return new Blob([imageData], { type: this._determineMimeType(imageType) });
        }
        return null;
      }
      const alphaBlob = () => {
        if(alphaDataSize > 0) {
          return new Blob([alphaData], { type: this._determineMimeType(imageType) });
        }
        return null;
      }

      Promise.all([
        this._createTextureFromImageBlob(blob()), 
        this._createTextureFromImageBlob(alphaBlob())
      ]).then(([imageTexture, alphaTexture]) => {
        resolve(new WebXImageMessage(windowId, depth, imageTexture, alphaTexture, commandId, imageDataSize));
      });

    });
  }

  private _createSubImagesMessage(buffer: WebXBinaryBuffer): Promise<WebXSubImagesMessage> {
    return new Promise<WebXSubImagesMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const windowId = buffer.getUint32();
      const imagePromises = new Array<Promise<WebXSubImage>>();
      const numberOfSubImages = buffer.getUint32();
      for (let i = 0; i < numberOfSubImages; i++) {
        const x = buffer.getInt32();
        const y = buffer.getInt32();
        const width = buffer.getInt32();
        const height = buffer.getInt32();
        const depth = buffer.getUint32();
        const imageType = buffer.getString(4);
        const imageDataSize = buffer.getUint32();
        const alphaDataSize = buffer.getUint32();
        const imageData: Uint8Array = buffer.getUint8Array(imageDataSize);
        const alphaData: Uint8Array = buffer.getUint8Array(alphaDataSize);
        const blob = () => {
          if (imageDataSize > 0) {
            return new Blob([imageData], { type: this._determineMimeType(imageType) });
          }
          return null;
        }
        const alphaBlob = () => {
          if(alphaDataSize > 0) {
            return new Blob([alphaData], { type: this._determineMimeType(imageType) });
          }
          return null;
        }

        const imagePromise = new Promise<WebXSubImage>((innerResolve, innerReject) => {
          Promise.all([
            this._createTextureFromImageBlob(blob()), 
            this._createTextureFromImageBlob(alphaBlob())
          ]).then(([texture, alphaTexture]) => {
            innerResolve(new WebXSubImage({ x, y, width, height, depth, texture, alphaTexture }));
          });
        });
        
        imagePromises.push(imagePromise);
      }

      Promise.all(imagePromises).then((webXSubImages: WebXSubImage[]) => {
        resolve(new WebXSubImagesMessage(windowId, webXSubImages));
      });

    });
  }

  private _createMouseMessage(buffer: WebXBinaryBuffer): Promise<WebXMouseMessage> {
    return new Promise<WebXMouseMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const x = buffer.getInt32();
      const y = buffer.getInt32();
      const cursorId = buffer.getUint32();
      resolve(new WebXMouseMessage(x, y, cursorId, commandId));
    });
  }

  private _createWindowsMessage(buffer: WebXBinaryBuffer): Promise<WebXWindowsMessage> {
    return new Promise<WebXWindowsMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const numberOfWindows: number = buffer.getUint32();
      const windows: Array<WebXWindowProperties> = new Array<WebXWindowProperties>();
      for (let i = 0; i < numberOfWindows; i++) {
        const windowId = buffer.getUint32();
        const x = buffer.getInt32();
        const y = buffer.getInt32();
        const width = buffer.getInt32();
        const height = buffer.getInt32();

        windows.push(new WebXWindowProperties({ id: windowId, x: x, y: y, width: width, height: height }));
      }
      resolve(new WebXWindowsMessage(windows, commandId));
    });
  }

  private _createCursorImageMessage(buffer: WebXBinaryBuffer): Promise<WebXCursorImageMessage> {
    return new Promise<WebXCursorImageMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const x = buffer.getInt32();
      const y = buffer.getInt32();
      const xHot = buffer.getInt32();
      const yHot = buffer.getInt32();
      const cursorId = buffer.getUint32();
      const imageDataSize = buffer.getUint32();
      const imageData: Uint8Array = buffer.getUint8Array(imageDataSize);

      if (imageDataSize > 0 && imageData != null) {
        const blob = new Blob([imageData], { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        const image: HTMLImageElement = new Image();
        const texture: Texture = new Texture(image);
        image.onload = () => {
          URL.revokeObjectURL(url);

          texture.needsUpdate = true;
          texture.flipY = false;

          resolve(new WebXCursorImageMessage(x, y, xHot, yHot, cursorId, texture, commandId));
        };
        image.src = url;

      } else {
        resolve(new WebXCursorImageMessage(x, y, xHot, yHot, cursorId, null, commandId));
      }
    });
  }

  private _createScreenMessage(buffer: WebXBinaryBuffer): Promise<WebXScreenMessage> {
    return new Promise<WebXScreenMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const screenWidth: number = buffer.getInt32();
      const screenHeight: number = buffer.getInt32();
      resolve(new WebXScreenMessage({ width: screenWidth, height: screenHeight }, commandId));
    });
  }

}