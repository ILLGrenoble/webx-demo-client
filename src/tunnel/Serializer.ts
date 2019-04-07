import { WebXCommand } from "../command";
import { WebXMessage } from "../message";

export interface Serializer {

    serializeCommand(command: WebXCommand): any;

    deserializeMessage(data: any): WebXMessage;
}