export interface WebXTunnel {

    connect(): Promise<Event>;

    disconnect(): void;

    sendCommand(command: any): void;

    handleMessage(message: any): void;

    isConnected(): boolean;
}