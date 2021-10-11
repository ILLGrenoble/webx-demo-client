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

    return new Promise<WebXMessage>((resolve) => {
      const commandId: number = buffer.getUint32();

      /*if (buffer.messageTypeId === WebXMessageType.CONNECTION) {
      } else */
      if (buffer.messageTypeId === WebXMessageType.SCREEN) {
        const screenWidth: number = buffer.getInt32();
        const screenHeight: number = buffer.getInt32();
        resolve(new WebXScreenMessage({ width: screenWidth, height: screenHeight }, commandId));

      } else if (buffer.messageTypeId === WebXMessageType.WINDOWS) {
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

      } else if (buffer.messageTypeId === WebXMessageType.IMAGE) {
        const windowId = buffer.getUint32();
        const depth = buffer.getUint32();
        const imageType = buffer.getString(4);
        const mimetype = imageType.substr(0, 3) === 'jpg' ? 'image/jpeg' : imageType.substr(0, 3) === 'png' ? 'image/png' : 'image/bmp';
        const imageDataSize = buffer.getUint32();
        const imageData: Uint8Array = buffer.getUint8Array(imageDataSize);

        if (imageDataSize > 0 && imageData != null) {
          const blob = new Blob([imageData], { type: mimetype });
          const url = URL.createObjectURL(blob);

          const image: HTMLImageElement = new Image();
          const texture: Texture = new Texture(image);
          image.onload = () => {
            URL.revokeObjectURL(url);

            texture.needsUpdate = true;
            texture.flipY = false;

            resolve(new WebXImageMessage(windowId, depth, texture, commandId, imageDataSize));
          };
          image.src = url;

        } else {
          resolve(new WebXImageMessage(windowId, depth, null, commandId, 0));
        }

      } else if (buffer.messageTypeId === WebXMessageType.SUBIMAGES) {
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
          const mimetype = imageType.substr(0, 3) === 'jpg' ? 'image/jpeg' : imageType.substr(0, 3) === 'png' ? 'image/png' : 'image/bmp';
          const imageDataSize = buffer.getUint32();
          const imageData: Uint8Array = buffer.getUint8Array(imageDataSize);

          const imagePromise = new Promise<WebXSubImage>((innerResolve, innerReject) => {
            const blob = new Blob([imageData], { type: mimetype });
            const url = URL.createObjectURL(blob);

            const image: HTMLImageElement = new Image();
            const texture: Texture = new Texture(image);
            image.onload = () => {
              URL.revokeObjectURL(url);

              texture.needsUpdate = true;
              texture.flipY = false;

              innerResolve(new WebXSubImage({ x, y, width, height, depth, texture }));
            };
            image.src = url;
          });
          imagePromises.push(imagePromise);
        }

        Promise.all(imagePromises).then((webXSubImages: WebXSubImage[]) => {
          resolve(new WebXSubImagesMessage(windowId, webXSubImages));
        });

      } else if (buffer.messageTypeId === WebXMessageType.MOUSE) {
        const x = buffer.getInt32();
        const y = buffer.getInt32();
        const cursorId = buffer.getUint32();

        resolve(new WebXMouseMessage(x, y, cursorId, commandId));

      } else if (buffer.messageTypeId === WebXMessageType.CURSOR_IMAGE) {
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
      }

    });
  }
}
