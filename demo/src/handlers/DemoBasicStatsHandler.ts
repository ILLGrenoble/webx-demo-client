import { WebXFileSize, WebXHandler, WebXStatsHandler } from 'webx-web/src';

export class DemoBasicStatsHandler extends WebXStatsHandler implements WebXHandler {

  private _el: HTMLElement;
  private _totalReceivedBytes: number = 0;
  private _totalSentBytes: number = 0;
  private _messagesReceived: number = 0;
  private _instructionsSent: number = 0;
  private readonly _renderInterval: number;
  private _messages: { received: number, sent: number, time: number }[] = [];
  private _networkElement: HTMLElement;
  private _statsElement: HTMLElement;

  constructor() {
    super();
    this._el = document.getElementById('devtools__stats__content');
    this._networkElement = document.getElementById('devtools__stats__network');
    this._statsElement = document.getElementById('devtools__stats__data');
    this._renderInterval = window.setInterval(() => {
      this._render();
      this._flushMessages();
    }, 100);
  }

  private _render(): void {
    this._renderNetwork();
    this._renderStats();
    // this._el.replaceChildren(this._fragment);
  }

  private _calculateReceivedBytesPerSecond(): number {
    return this._messages
      .filter(message => message.received > 0)
      .filter(message => {
        const delta = Date.now() - message.time;
        return delta <= 1000;
      }).map(message => message.received)
      .reduce((a, b) => a + b, 0);
  }

  private _calculateSentBytesPerSecond(): number {
    return this._messages
      .filter(message => message.sent > 0)
      .filter(message => {
        const delta = Date.now() - message.time;
        return delta <= 1000;
      }).map(message => message.sent)
      .reduce((a, b) => a + b, 0);
  }

  private _flushMessages(): void {
    this._messages = this._messages.filter(message => {
      const delta = Date.now() - message.time;
      return delta <= 3000;
    });
  }

  private _renderStats(): void {
    const el = document.createElement('tr');
    el.innerHTML = `
      <td>${this._messagesReceived}</td>
      <td>${this._instructionsSent}</td>
    `;
    this._statsElement.replaceChildren(el);
  }

  private _renderNetwork(): void {
    const el = document.createElement('tr');
    const totalReceivedBytesPerSecond = this._calculateReceivedBytesPerSecond();
    const totalSentBytesPerSecond = this._calculateSentBytesPerSecond();
    const humanTotalReceivedBytes = WebXFileSize.humanFileSize(this._totalReceivedBytes);
    const humanTotalSentBytes = WebXFileSize.humanFileSize(this._totalSentBytes);
    const humanTotalReceivedBytesPerSecond = WebXFileSize.humanFileSize(totalReceivedBytesPerSecond);
    const humanTotalSentBytesPerSecond = WebXFileSize.humanFileSize(totalSentBytesPerSecond);
    el.innerHTML = `
      <td>${humanTotalReceivedBytes} (${humanTotalReceivedBytesPerSecond}/s)</td>
      <td>${humanTotalSentBytes} (${humanTotalSentBytesPerSecond}/s)</td>
    `;
    this._networkElement.replaceChildren(el);
  }

  handle(stats: { received: number, sent: number }): void {
    const { received, sent } = stats;
    this._messages.push({ received, sent, time: Date.now() });
    this._totalReceivedBytes += received;
    this._totalSentBytes += sent;
    if (sent) {
      this._instructionsSent += 1;
    }
    if (received) {
      this._messagesReceived += 1;
    }
  }

  destroy(): void {
    window.clearInterval(this._renderInterval);
  }

}
