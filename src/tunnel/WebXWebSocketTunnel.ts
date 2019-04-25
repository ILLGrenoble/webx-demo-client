import { WebXTunnel } from "./WebXTunnel";
import { WebXInstruction, WebXInstructionResponse } from "../instruction";
import { WebXSerializer } from "./WebXSerializer";
import { WebXJsonSerializer } from "./WebXJsonSerializer";
import { WebXMessage } from "../message";
import { WebXBinarySerializer } from "./WebXBinarySerializer";

export class WebXWebSocketTunnel implements WebXTunnel {

    private socket: WebSocket;
    private url: string;
    private serializer: WebXSerializer;

    private instructionResponses: Map<number, WebXInstructionResponse<any>> = new Map<number, WebXInstructionResponse<any>>();

    constructor(url: string, options: any = {}) {
        const parameters = new URLSearchParams(options);
        this.url = `${url}?${parameters}`
        this.serializer = new WebXJsonSerializer();
    }

    connect(): Promise<Event> {
        const url = this.url;
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(url);
            this.socket.onopen = (event: Event) => {
                this.socket.send("comm");
                resolve(event);
            }
            this.socket.onerror = (event: Event) => reject(event);
            this.socket.onclose = this.handleClose.bind(this);
            this.socket.onmessage = (message: any) => {
                if (message.data == "json") {
                    this.serializer = new WebXJsonSerializer();

                } else if (message.data == "binary") {
                    this.serializer = new WebXBinarySerializer();
                    this.socket.binaryType = 'arraybuffer';

                }
                this.socket.onmessage = (message: any) => this.onMessage(message.data);
            }
        });
    }

    onMessage(data: any): void {
        this.serializer.deserializeMessage(data).then((message: WebXMessage) => {
            if (message != null) {
                // Handle any blocking requests
                if (message.commandId != null && this.instructionResponses.get(message.commandId) != null) {
                    const instructionResponse = this.instructionResponses.get(message.commandId);
                    this.instructionResponses.delete(message.commandId);
                    instructionResponse.resolve(message)

                } else {
                    // Send async message
                    this.handleMessage(message);
                }
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

    sendInstruction(command: WebXInstruction): void {
        console.log(`Sending command: `, command);
        const message = this.serializer.serializeInstruction(command);
        this.socket.send(message);
    }
    
    sendRequest(command: WebXInstruction): Promise<WebXMessage> {
        console.log(`Sending request: `, command);
        command.synchronous = true;
        const response = new WebXInstructionResponse<WebXMessage>(command);
        this.instructionResponses.set(command.id, response);
        return new Promise((resolve, reject) => {
            const message = this.serializer.serializeInstruction(command);
            this.socket.send(message);

            response
                .then(message => resolve(message))
                .timeout(5000, () => {
                    this.instructionResponses.delete(command.id);
                    reject('Request failed due to timeout');
                });
        });
    }

}