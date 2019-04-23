import { WebXInstruction } from "../instruction";
import { WebXMessage } from "../message";

export interface WebXSerializer {

    serializeCommand(command: WebXInstruction): any;

    deserializeMessage(data: any): Promise<WebXMessage>;
}