import { WebXSerializer } from './WebXSerializer';
import { WebXInstruction } from '../instruction';
import {
  WebXCursorImageMessage,
  WebXImageMessage,
  WebXMessage,
  WebXMouseMessage,
  WebXScreenMessage,
  WebXSubImagesMessage,
  WebXWindowsMessage
} from '../message';
import { WebXSubImage, WebXWindowProperties } from '../display';
import { LinearFilter, Texture } from 'three';

export class WebXJsonSerializer implements WebXSerializer {
  serializeInstruction(command: WebXInstruction): string {
    return command.toJsonString();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  deserializeMessage(data: any): Promise<WebXMessage> {
    const json: any = JSON.parse(data);

    return new Promise<WebXMessage>((resolve) => {
      if (json.type === 'screen') {
        resolve(new WebXScreenMessage(json.screenSize, json.commandId));

      } else if (json.type === 'windows') {
        const windows = json.windows as Array<{ id: number; x: number; y: number; width: number; height: number }>;
        resolve(
          new WebXWindowsMessage(
            windows.map(window => new WebXWindowProperties(window as { id: number; x: number; y: number; width: number; height: number })),
            json.commandId
          )
        );

      } else if (json.type === 'image') {
        const imageData = json.data;
        const windowId = json.windowId;
        const depth = json.depth;
        if (imageData != null && imageData !== '') {
          const image: HTMLImageElement = new Image();
          const texture: Texture = new Texture(image);
          image.onload = () => {
            texture.needsUpdate = true;
            texture.flipY = false;

            resolve(new WebXImageMessage(windowId, depth, texture, json.commandId, imageData.length));
          };
          image.src = imageData;
        } else {
          resolve(new WebXImageMessage(windowId, depth, null, json.commandId, 0));
        }

      } else if (json.type === 'subimages') {
        const windowId = json.windowId;
        const imagePromises = new Array<Promise<WebXSubImage>>();
        json.subImages.forEach((subImage: any) => {
          const x = subImage.x;
          const y = subImage.y;
          const width = subImage.width;
          const height = subImage.height;
          const depth = subImage.depth;
          const imageData = subImage.data;

          const imagePromise = new Promise<WebXSubImage>((innerResolve) => {
            const image: HTMLImageElement = new Image();
            const texture: Texture = new Texture(image);
            image.onload = () => {
              texture.needsUpdate = true;
              texture.flipY = false;

              innerResolve(new WebXSubImage({ x, y, width, height, depth, texture }));
            };
            image.src = imageData;
          });
          imagePromises.push(imagePromise);
        });

        Promise.all(imagePromises).then((webXSubImages: WebXSubImage[]) => {
          resolve(new WebXSubImagesMessage(windowId, webXSubImages));
        });

      } else if (json.type === 'mouse') {
        resolve(new WebXMouseMessage(json.x, json.y, json.cursorId, json.commandId));

      } else if (json.type === 'cursorimage') {
        const imageData = json.data;
        if (data != null && data !== '') {
          const image: HTMLImageElement = new Image();
          const texture: Texture = new Texture(image);
          image.onload = () => {
            texture.needsUpdate = true;
            texture.flipY = false;
            texture.minFilter = LinearFilter;

            resolve(new WebXCursorImageMessage(json.x, json.y, json.xHot, json.yHot, json.name, texture, json.commandId));
          };
          image.src = imageData;

        } else {
          resolve(new WebXCursorImageMessage(json.x, json.y, json.xHot, json.yHot, json.id, null, json.commandId));
        }

      } else {
        resolve(null);
      }
    });
  }
}
