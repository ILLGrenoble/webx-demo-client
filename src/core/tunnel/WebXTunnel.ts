import { WebXInstruction } from '../instruction';
import { WebXMessage } from '../message';
import { WebXBinarySerializer } from '../transport';

export interface WebXTunnel {
  connect(serializer: WebXBinarySerializer): Promise<Event>;

  disconnect(): void;

  sendInstruction(command: WebXInstruction): void;

  sendRequest(command: WebXInstruction): Promise<WebXMessage>;

  handleMessage(message: WebXMessage): void;

  handleReceivedBytes(data: ArrayBuffer): void;

  handleSentBytes(data: ArrayBuffer): void;

  send(data: ArrayBuffer): void;

  isConnected(): boolean;

  onClosed(): void;
}
