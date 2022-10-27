import { WebXTunnel } from './WebXTunnel';
import { WebXInstruction, WebXInstructionResponse } from '../instruction';
import { WebXMessage } from '../message';
import { WebXBinarySerializer, WebXMessageBuffer } from '../transport';
import { WebXQoSHandler } from './WebXQoSHandler';
import { WebXDefaultQoSHandler } from './WebXDefaultQoSHandler';

export class WebXWebSocketTunnel implements WebXTunnel {
  private readonly _url: string;
  private _socket: WebSocket;
  private _serializer: WebXBinarySerializer;
  private _qosHandler: WebXQoSHandler = new WebXDefaultQoSHandler(this);

  private _instructionResponses: Map<number, WebXInstructionResponse<any>> = new Map<number, WebXInstructionResponse<any>>();

  constructor(url: string, options: any = {}) {
    const parameters = new URLSearchParams(options);
    this._url = `${url}?${parameters}`;
    this._serializer = null;
  }

  send(data: ArrayBuffer): void {
    this._socket.send(data);
    this.handleSentBytes(data);
  }

  connect(serializer: WebXBinarySerializer): Promise<Event> {
    this._serializer = serializer;
    const url = this._url;
    return new Promise((resolve, reject) => {
      this._socket = new WebSocket(url);
      this._socket.binaryType = 'arraybuffer';
      this._socket.onopen = (event: Event) => {
        resolve(null);
      };
      this._socket.onerror = (event: Event) => reject(event);
      this._socket.onclose = this.handleClose.bind(this);
      this._socket.onmessage = (aMessage: any) => this.onMessage(aMessage.data);
    });
  }

  async onMessage(data: ArrayBuffer): Promise<void> {
    this.handleReceivedBytes(data);

    if (data.byteLength === 0) {
      console.warn('Got a zero length message');
      return null;
    } else if (data.byteLength < 32) {
      console.warn('Message does not contain a valid header');
      return null;
    }

    const buffer = new WebXMessageBuffer(data);
    this._qosHandler.handle(buffer.messageQueueLength);

    const message = await this._serializer.deserializeMessage(buffer);
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
  }

  handleMessage(message: WebXMessage): void {
    throw new Error('Method not implemented.');
  }

  handleReceivedBytes(data: ArrayBuffer): void {
    throw new Error('Method not implemented.');
  }

  handleSentBytes(data: ArrayBuffer): void {
    throw new Error('Method not implemented');
  }

  handleClose(event: CloseEvent): void {
    // Clear all pending instruction responses
    this._instructionResponses.forEach((response: WebXInstructionResponse<WebXMessage>, id: number) => {
      response.reject('Socket closed');
    });
    this.onClosed();
  }

  onClosed(): void {
    console.log(`Websocket closed`);
  }

  isConnected(): boolean {
    throw new Error('Method not implemented.');
  }

  disconnect(): void {
    if (this._socket) {
      this._socket.close()
    }
  }

  sendInstruction(command: WebXInstruction): void {
    // console.log(`Sending command: `, command);
    const message = this._serializer.serializeInstruction(command);
    this.send(message);
  }

  sendRequest(command: WebXInstruction, timeout?: number): Promise<WebXMessage> {
    // console.log(`Sending request: `, command);
    command.synchronous = true;
    timeout = timeout || 10000;
    const response = new WebXInstructionResponse<WebXMessage>(command, timeout);
    this._instructionResponses.set(command.id, response);
    return new Promise((resolve, reject) => {
      const message = this._serializer.serializeInstruction(command);
      this.send(message);
      response
        .then(resolve)
        .catch((error: Error) => {
          this._instructionResponses.delete(command.id);
          reject(error);
        });
    });
  }

  setQoSHandler(qosHandler: WebXQoSHandler): void {
    this._qosHandler = qosHandler;
  }

  getQoSHandler(): WebXQoSHandler {
    return this._qosHandler;
  }

}
