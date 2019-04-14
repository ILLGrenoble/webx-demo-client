import { Serializer } from "./Serializer";
import { WebXCommand } from "../command";
import { WebXWindowsMessage, WebXMessage, WebXImageMessage } from "../message";
import { WebXConnectionMessage } from "../message/WebXConnectionMessage";
import { WebXWindowProperties } from "../display";
import { Texture, LinearFilter } from "three";

export class JsonSerializer implements Serializer {

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
            if (json.type === 'Connection') {
                resolve(new WebXConnectionMessage(json.screenSize, json.commandId));

            } else if (json.type === 'Windows') {
                const windows = json.windows as Array<{id: number, x: number, y: number, width: number, height: number}>;
                resolve(new WebXWindowsMessage(windows.map(window  => new WebXWindowProperties(window as {id: number, x: number, y: number, width: number, height: number})), json.commandId));
            
            } else if (json.type === 'Image') {
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

            } else {
                resolve(null);
            }
        });

        return promise;
    }
}