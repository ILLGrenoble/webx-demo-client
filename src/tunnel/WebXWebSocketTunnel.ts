import { WebXTunnel } from "./WebXTunnel";

export class WebXWebSocketTunnel implements WebXTunnel {

    private socket: WebSocket;
    private url: string;

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
            this.socket.onmessage = (message: any) => this.handleMessage(message.data);
        });
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

    sendCommand(command: any): void {
        this.socket.send(command);
    }

}