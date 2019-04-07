import { WebXCommand } from "../command";
import { WebXMessage } from "../message";

export interface WebXTunnel {

    connect(): Promise<Event>;

    disconnect(): void;

    sendCommand(command: WebXCommand): void;
    
    sendRequest(command: WebXCommand): Promise<any>;

    handleMessage(message: WebXMessage): void;

    isConnected(): boolean;
}