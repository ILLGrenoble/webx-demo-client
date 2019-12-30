import { WebXSerializer } from './WebXSerializer';
import { WebXInstruction } from '../instruction';
import { WebXWindowsMessage, WebXMessage, WebXImageMessage, WebXSubImagesMessage } from '../message';
import { WebXWindowProperties, WebXSubImage } from '../display';
import { Texture, LinearFilter } from 'three';
import { WebXScreenMessage } from '../message/WebXScreenMessage';
import { WebXMouseCursorMessage } from '../message/WebXMouseCursorMessage';

export class WebXJsonSerializer implements WebXSerializer {
  serializeInstruction(command: WebXInstruction): string {
    return command.toJsonString();
  }

  deserializeMessage(data: any): Promise<WebXMessage> {
    const json: any = JSON.parse(data);

    const promise: Promise<WebXMessage> = new Promise<WebXMessage>((resolve, reject) => {
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

            resolve(new WebXImageMessage(windowId, depth, texture, json.commandId));
          };
          image.src = imageData;
        } else {
          resolve(new WebXImageMessage(windowId, depth, null, json.commandId));
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

          const imagePromise = new Promise<WebXSubImage>((innerResolve, innerReject) => {
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

      } else if (json.type === 'cursor') {
        const imageData = json.data;
        if (data != null && data !== '') {
          const image: HTMLImageElement = new Image();
          const texture: Texture = new Texture(image);
          image.onload = () => {
            texture.needsUpdate = true;
            texture.flipY = false;
            texture.minFilter = LinearFilter;

            resolve(new WebXMouseCursorMessage(json.x, json.y, json.xHot, json.yHot, json.name, texture, json.commandId));
          };
          image.src = imageData;
          
        } else {
          resolve(new WebXMouseCursorMessage(json.x, json.y, json.xHot, json.yHot, json.name, null, json.commandId));
        }
        
      } else {
        resolve(null);
      }
    });

    return promise;
  }
}
