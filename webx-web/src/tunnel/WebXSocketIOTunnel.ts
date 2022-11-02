import { WebXTunnel } from './WebXTunnel';
import { WebXBinarySerializer } from '../transport';
import { io, Socket } from 'socket.io-client'

export class WebXSocketIOTunnel extends WebXTunnel {
  private readonly _url: string;
  private readonly _eventChannel: string;

  private _socket: Socket;

  constructor(url: string, options: any = {}, eventChannel: string) {
    super();
    const parameters = new URLSearchParams(options);
    this._url = `${url}?${parameters}`;
    this._eventChannel = eventChannel;
    this._serializer = null;
  }

  send(data: ArrayBuffer): void {
    this._socket.emit(this._eventChannel, data);
    this.handleSentBytes(data);
  }

  connect(serializer: WebXBinarySerializer): Promise<Event> {
    this._serializer = serializer;
    return new Promise((resolve, reject) => {
      this._socket = io(this._url);

      this._socket.on('connect', () => resolve(null));
      this._socket.on('disconnect', this.handleClose.bind(this));
      this._socket.on('connect_error', (event) => reject(event));
      this._socket.on(this._eventChannel, (message: any) => this.onMessage(message.data));
    });
  }

  disconnect(): void {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
  }
}
