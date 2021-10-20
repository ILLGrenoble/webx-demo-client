import { WebXTunnel } from './WebXTunnel';
import { WebXConnectInstruction, WebXInstruction, WebXInstructionResponse } from '../instruction';
import { WebXMessage } from '../message';
import { WebXDataSerializer } from '../transport';

export class WebXWebSocketTunnel implements WebXTunnel {
  private readonly _url: string;
  private _socket: WebSocket;
  private _serializer: WebXDataSerializer;

  private _instructionResponses: Map<number, WebXInstructionResponse<any>> = new Map<number, WebXInstructionResponse<any>>();

  constructor(url: string, options: any = {}) {
    const parameters = new URLSearchParams(options);
    this._url = `${url}?${parameters}`;
    this._serializer = null;
  }

  connect(): Promise<Event> {
    const url = this._url;
    return new Promise((resolve, reject) => {
      this._serializer = new WebXDataSerializer();
      this._socket = new WebSocket(url);
      this._socket.binaryType = 'arraybuffer';
      this._socket.onopen = (event: Event) => {
        const instruction = new WebXConnectInstruction();
        const encodedInstruction = this._serializer.serializeInstruction(instruction);
        this._socket.send(encodedInstruction);
      };
      this._socket.onerror = (event: Event) => reject(event);
      this._socket.onclose = this.handleClose.bind(this);
      this._socket.onmessage = (aMessage: any) => this.onMessage(aMessage.data);
      resolve(null);
    });
  }

  onMessage(data: any): void {
    this._serializer.deserializeMessage(data).then((message: WebXMessage) => {
      if (message != null) {
        // Handle any blocking requests
        if (message.commandId != null && this._instructionResponses.get(message.commandId) != null) {
          const instructionResponse = this._instructionResponses.get(message.commandId);
          this._instructionResponses.delete(message.commandId);
          instructionResponse.resolve(message);

        } else {
          // Send async message
          this.handleMessage(message);
        }
      }
    });
  }

  handleMessage(message: WebXMessage): void {
    throw new Error('Method not implemented.');
  }

  handleClose(event: CloseEvent): void{
    console.log(`Websocket closed`);
  }

  isConnected(): boolean {
    throw new Error('Method not implemented.');
  }

  disconnect(): void {
    throw new Error('Method not implemented.');
  }

  sendInstruction(command: WebXInstruction): void {
    // console.log(`Sending command: `, command);
    const message = this._serializer.serializeInstruction(command);
    this._socket.send(message);
  }

  sendRequest(command: WebXInstruction): Promise<WebXMessage> {
    // console.log(`Sending request: `, command);
    command.synchronous = true;
    const response = new WebXInstructionResponse<WebXMessage>(command);
    this._instructionResponses.set(command.id, response);
    return new Promise((resolve, reject) => {
      const message = this._serializer.serializeInstruction(command);
      this._socket.send(message);

      response
        .then(aMessage => resolve(aMessage))
        .timeout(5000, () => {
          this._instructionResponses.delete(command.id);
          reject('Request failed due to timeout');
        });
    });
  }
}
