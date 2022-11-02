import { WebXTunnel } from './WebXTunnel';
import { WebXBinarySerializer } from '../transport';

export class WebXWebSocketTunnel extends WebXTunnel {
  private readonly _url: string;
  private _socket: WebSocket;

  constructor(url: string, options: any = {}) {
    super();
    const parameters = new URLSearchParams(options);
    this._url = `${url}?${parameters}`;
  }

  send(data: ArrayBuffer): void {
    this._socket.send(data);
    this.handleSentBytes(data);
  }

  connect(serializer: WebXBinarySerializer): Promise<Event> {
    this._serializer = serializer;
    return new Promise((resolve, reject) => {
      this._socket = new WebSocket(this._url);
      this._socket.binaryType = 'arraybuffer';
      this._socket.onopen = (event: Event) => {
        resolve(null);
      };
      this._socket.onerror = (event: Event) => reject(event);
      this._socket.onclose = this.handleClose.bind(this);
      this._socket.onmessage = (aMessage: any) => this.onMessage(aMessage.data);
    });
  }

  disconnect(): void {
    if (this._socket) {
      this._socket.close()
    }
  }

}
