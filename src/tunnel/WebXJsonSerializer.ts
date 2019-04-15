import { WebXSerializer } from "./WebXSerializer";
import { WebXCommand } from "../command";
import { WebXWindowsMessage, WebXMessage, WebXImageMessage, WebXSubImagesMessage } from "../message";
import { WebXConnectionMessage } from "../message/WebXConnectionMessage";
import { WebXWindowProperties, WebXSubImage } from "../display";
import { Texture, LinearFilter } from "three";

export class WebXJsonSerializer implements WebXSerializer {

    serializeCommand(command: WebXCommand): string {
        const json: any = {
            id: command.id,
            type: command.type
        };
        if (command.numericPayload) {
            json.numericPayload = command.numericPayload;
        }

        return JSON.stringify(json);
    }

    deserializeMessage(data: any): Promise<WebXMessage> {
        const json: any = JSON.parse(data);

        const promise: Promise<WebXMessage> = new Promise<WebXMessage>((resolve, reject) => {
            if (json.type === 'connection') {
                resolve(new WebXConnectionMessage(json.screenSize, json.commandId));

            } else if (json.type === 'windows') {
                const windows = json.windows as Array<{id: number, x: number, y: number, width: number, height: number}>;
                resolve(new WebXWindowsMessage(windows.map(window  => new WebXWindowProperties(window as {id: number, x: number, y: number, width: number, height: number})), json.commandId));
            
            } else if (json.type === 'image') {
                const data = 'data:image/png;base64,' + json.data;
                const windowId = json.windowId;
                const depth = json.depth;
                const image: HTMLImageElement = new Image();
                const texture: Texture = new Texture(image);
                image.onload = () => {
                    texture.needsUpdate = true;
                    texture.flipY = false;
                    texture.minFilter = LinearFilter;
                    
                    resolve(new WebXImageMessage(windowId, depth, texture, json.commandId));
                }
                image.src = data;
            
            } else if (json.type === 'subimages') {
                const windowId = json.windowId;
                const imagePromises = new Array<Promise<WebXSubImage>>();
                json.subImages.forEach((subImage: any) => {
                    const x = subImage.x;
                    const y = subImage.y;
                    const width = subImage.width;
                    const height = subImage.height;
                    const depth = subImage.depth;
                    const data = 'data:image/png;base64,' + subImage.data;

                    const promise = new Promise<WebXSubImage>((resolve, reject) => {
                        const image: HTMLImageElement = new Image();
                        const texture: Texture = new Texture(image);
                        image.onload = () => {
                            texture.needsUpdate = true;
                            texture.flipY = false;
                            texture.minFilter = LinearFilter;
                            
                            resolve(new WebXSubImage({x, y, width, height, depth, texture}));
                        }
                        image.src = data;
        
                    });
                    imagePromises.push(promise);
                });

                Promise.all(imagePromises).then((webXSubImages: WebXSubImage[]) => {
                    resolve(new WebXSubImagesMessage(windowId, webXSubImages));
                })

            } else {
                resolve(null);
            }
        });

        return promise;
    }
}