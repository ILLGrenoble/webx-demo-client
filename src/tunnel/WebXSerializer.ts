import { WebXCommand } from "../command";
import { WebXMessage } from "../message";

export interface WebXSerializer {

    serializeCommand(command: WebXCommand): any;

    deserializeMessage(data: any): Promise<WebXMessage>;
}