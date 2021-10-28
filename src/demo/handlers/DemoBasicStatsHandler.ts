import { WebXFileSize, WebXHandler, WebXStatsHandler } from '../../core';

export class DemoBasicStatsHandler extends WebXStatsHandler implements WebXHandler{

  private _el: HTMLElement;
  private _totalReceivedBytes: number = 0;
  private _totalReceivedBytesPerSecond: number = 0;
  private _totalSentBytes: number = 0;
  private readonly _receivedBytesPerSecondInterval: number;
  private readonly _renderInterval: number;
  private readonly _fragment: DocumentFragment;

  constructor() {
    super();
    this._el = document.getElementById('stats');
    this._fragment = document.createDocumentFragment();
    this._receivedBytesPerSecondInterval = window.setInterval(() => this._totalReceivedBytesPerSecond = 0, 1000);
    this._renderInterval = window.setInterval(this._render.bind(this), 100);
  }

  private _render(): void {
    const element = this._createMessageElement();
    this._fragment.replaceChildren(element);
    this._el.replaceChildren(this._fragment);
  }

  private _createMessageElement(): HTMLElement {
    const el = document.createElement('tr');
    const humanTotalReceivedBytes = WebXFileSize.humanFileSize(this._totalReceivedBytes);
    const humanTotalSentBytes = WebXFileSize.humanFileSize(this._totalSentBytes);
    const humanTotalReceivedBytesPerSecond = WebXFileSize.humanFileSize(this._totalReceivedBytesPerSecond);
    el.innerHTML = `
            <td>${humanTotalReceivedBytes} (${humanTotalReceivedBytesPerSecond} p/s)</td>
            <td>${humanTotalSentBytes}</td>
    `;
    return el;
  }

  handle(stats: { received: number, sent: number }): void {
    this._totalReceivedBytes += stats.received;
    this._totalReceivedBytesPerSecond += stats.received;
    this._totalSentBytes += stats.sent;
  }

  destroy(): void {
    window.clearInterval(this._receivedBytesPerSecondInterval);
    window.clearInterval(this._renderInterval);
  }

}
