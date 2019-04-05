import { WebXTunnel } from "./tunnel";
import { WebXCommand } from "./command/WebXCommand";

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
        throw new Error('Method not implemented');
    }


    /**
     * Sends a mouse event having the properties provided by the given mouse state
     * @param mouseState the state of the mouse to send in the mouse event
     */
    sendMouseState(mouseState: any): void {
        throw new Error('Method not implemented');
    }

    /**
     * Sends a key event
     * @param pressed {Boolean} Whether the key is pressed (true) or released (false)
     * @param key {number} the key to send
     */
    sendKeyEvent(pressed: boolean, key: number): void {
        throw new Error('Method not implemented');
    }



}