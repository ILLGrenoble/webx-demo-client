import { Serializer } from "./Serializer";
import { WebXCommand } from "../command";
import { WebXWindowsMessage, WebXMessage } from "../message";
import { WebXConnectionMessage } from "../message/WebXConnectionMessage";
import { WebXWindowProperties } from "../display";

export class JsonSerializer implements Serializer {

    serializeCommand(command: WebXCommand): string {
        const json: any = {
            id: command.id,
            type: command.type
        };

        return JSON.stringify(json);
    }

    deserializeMessage(data: string): WebXMessage {
        const json: any = JSON.parse(data);

        if (json.type === 'Connection') {
            return new WebXConnectionMessage(json.screenSize, json.commandId)

        } else if (json.type === 'Windows') {
            const windows = json.windows as Array<{id: number, x: number, y: number, width: number, height: number}>;
            return new WebXWindowsMessage(windows.map(window  => new WebXWindowProperties(window as {id: number, x: number, y: number, width: number, height: number})), json.commandId);
        }

        return null;
    }
}