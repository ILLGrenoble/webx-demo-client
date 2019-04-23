import { WebXInstruction } from "../instruction";
import { WebXMessage } from "../message";

export interface WebXTunnel {

    connect(): Promise<Event>;

    disconnect(): void;

    sendInstruction(command: WebXInstruction): void;
    
    sendRequest(command: WebXInstruction): Promise<any>;

    handleMessage(message: WebXMessage): void;

    isConnected(): boolean;
}