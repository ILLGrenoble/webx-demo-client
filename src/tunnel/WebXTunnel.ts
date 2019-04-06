import { WebXCommand } from "../command";

export interface WebXTunnel {

    connect(): Promise<Event>;

    disconnect(): void;

    sendCommand(command: WebXCommand): void;
    
    sendRequest(command: WebXCommand): Promise<any>;

    handleMessage(message: any): void;

    isConnected(): boolean;
}