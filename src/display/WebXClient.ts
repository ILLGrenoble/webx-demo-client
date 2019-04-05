import { WebXTunnel } from "../tunnel";
import { WebXCommand } from "../command/WebXCommand";

export class WebXClient {


    constructor(private tunnel: WebXTunnel) {
        tunnel.handleMessage = this.handleMessage.bind(this);
    }

    connect(): Promise<Event> {
        return this.tunnel.connect();
    }

    sendCommand(command: WebXCommand): void {
        console.log(`Sending command: `, command);
        const json = command.toJson();
        this.tunnel.sendCommand(json);
    }

    handleMessage(data: any) {
        this.onMessage(JSON.parse(data));

    }

    onMessage(data: any) {
        throw new Error("Method not implemented.");

    }



}