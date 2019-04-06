import { WebXTunnel } from "./tunnel";
import { WebXCommand, WebXCommandResponse, WebXCommandType } from "./command";

export class WebXClient {


    constructor(private tunnel: WebXTunnel) {
        tunnel.handleMessage = this.handleMessage.bind(this);
    }

    connect(): Promise<any> {
        return this.tunnel.connect()
            .then(data => {
                // When connect get configuration from server
                return this.sendRequest(new WebXCommand(WebXCommandType.CONNECT));
            });
    }

    sendCommand(command: WebXCommand): void {
        console.log(`Sending command: `, command);
        this.tunnel.sendCommand(command);
    }

    sendRequest(command: WebXCommand): Promise<any> {
        console.log(`Sending request: `, command);
        return this.tunnel.sendRequest(command);
    }

    handleMessage(message: any) {
        if (message.type === 'Windows') {
            const windows = message.windows;
            this.onWindows(windows);
        }
    }

    onWindows(windows: Array<{id: number, x: number, y: number, width: number, height: number}>):void {
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