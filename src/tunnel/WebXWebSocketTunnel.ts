import { WebXTunnel } from "./WebXTunnel";
import { WebXCommand, WebXCommandResponse } from "../command";

export class WebXWebSocketTunnel implements WebXTunnel {

    private socket: WebSocket;
    private url: string;

    private requests: Map<number, WebXCommandResponse<any>> = new Map<number, WebXCommandResponse<any>>();

    constructor(url: string, options: any = {}) {
        const parameters = new URLSearchParams(options);
        this.url = `${url}?${parameters}`
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
        const message = JSON.parse(data);

        // Handle any blocking requests
        if (message.commandId != null && this.requests.get(message.commandId) != null) {
            const request = this.requests.get(message.commandId);
            this.requests.delete(message.commandId);
            request.resolve(message)

        } else {
            // Send async message
            this.handleMessage(message);
        }
    }

    handleMessage(message: any): void {
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
        const json = command.toJson();
        this.socket.send(json);
    }
    
    sendRequest(command: WebXCommand): Promise<any> {
        const response = new WebXCommandResponse<any>(command);
        this.requests.set(command.id, response);
        return new Promise((resolve, reject) => {
            const json = command.toJson();
            this.socket.send(json);

            response.then(message => {
                resolve(message);
            });
        });
    }

}