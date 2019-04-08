import { WebXTunnel } from "./WebXTunnel";
import { WebXCommand, WebXCommandResponse } from "../command";
import { Serializer } from "./Serializer";
import { JsonSerializer } from "./JsonSerializer";
import { WebXMessage } from "../message";

export class WebXWebSocketTunnel implements WebXTunnel {

    private socket: WebSocket;
    private url: string;
    private serializer: Serializer;

    private commandResponses: Map<number, WebXCommandResponse<any>> = new Map<number, WebXCommandResponse<any>>();

    constructor(url: string, options: any = {}) {
        const parameters = new URLSearchParams(options);
        this.url = `${url}?${parameters}`
        this.serializer = new JsonSerializer();
    }

    connect(): Promise<Event> {
        const url = this.url;
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(url);
            this.socket.onopen = (event: Event) => resolve(event);
            this.socket.onerror = (event: Event) => reject(event);
            this.socket.onclose = this.handleClose.bind(this);
            this.socket.onmessage = (message: any) => this.onMessage(message.data);
        });
    }

    onMessage(data: any): void {
        this.serializer.deserializeMessage(data).then((message: WebXMessage) => {
            // Handle any blocking requests
            if (message.commandId != null && this.commandResponses.get(message.commandId) != null) {
                const commandResponse = this.commandResponses.get(message.commandId);
                this.commandResponses.delete(message.commandId);
                commandResponse.resolve(message)

            } else {
                // Send async message
                this.handleMessage(message);
            }
        });
    }

    handleMessage(message: WebXMessage): void {
        throw new Error("Method not implemented.");
    }

    handleClose(event: CloseEvent) {
        console.log(`Websocket closed`);
    }

    isConnected(): boolean {
        throw new Error("Method not implemented.");
    }

    disconnect(): void {
        throw new Error("Method not implemented.");
    }

    sendCommand(command: WebXCommand): void {
        const message = this.serializer.serializeCommand(command);
        this.socket.send(message);
    }
    
    sendRequest(command: WebXCommand): Promise<WebXMessage> {
        const response = new WebXCommandResponse<WebXMessage>(command);
        this.commandResponses.set(command.id, response);
        return new Promise((resolve, reject) => {
            const message = this.serializer.serializeCommand(command);
            this.socket.send(message);

            response
                .then(message => resolve(message))
                .timeout(5000, () => {
                    this.commandResponses.delete(command.id);
                    reject('Request failed due to timeout');
                });
        });
    }

}