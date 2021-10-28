import { WebXFileSize, WebXHandler, WebXStatsHandler } from '../../core';

export class DemoBasicStatsHandler extends WebXStatsHandler implements WebXHandler {

  private _el: HTMLElement;
  private _totalReceivedBytes: number = 0;
  private _totalSentBytes: number = 0;
  private _messagesReceived: number = 0;
  private _instructionsSent: number = 0;
  private readonly _renderInterval: number;
  private readonly _fragment: DocumentFragment;
  private _messages: { received: number, sent: number, time: number }[] = [];

  constructor() {
    super();
    this._el = document.getElementById('devtools__stats__content');
    this._fragment = document.createDocumentFragment();
    this._renderInterval = window.setInterval(() => {
      this._render();
      this._flushMessages();
    }, 100);
  }

  private _render(): void {
    const element = this._createMessageElement();
    this._fragment.replaceChildren(element);
    this._el.replaceChildren(this._fragment);
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

  private _createMessageElement(): HTMLElement {
    const el = document.createElement('div');
    const totalReceivedBytesPerSecond = this._calculateReceivedBytesPerSecond();
    const totalSentBytesPerSecond = this._calculateSentBytesPerSecond();
    const humanTotalReceivedBytes = WebXFileSize.humanFileSize(this._totalReceivedBytes);
    const humanTotalSentBytes = WebXFileSize.humanFileSize(this._totalSentBytes);
    const humanTotalReceivedBytesPerSecond = WebXFileSize.humanFileSize(totalReceivedBytesPerSecond);
    const humanTotalSentBytesPerSecond = WebXFileSize.humanFileSize(totalSentBytesPerSecond);
    el.innerHTML = `
         <table class='devtools__stats__table'>
            <thead>
              <tr>
                  <th>Data received</th>
                  <th>Data sent</th>
              </tr>
            </thead>
            <tbody>
                <td>${humanTotalReceivedBytes} (${humanTotalReceivedBytesPerSecond}/s)</td>
                <td>${humanTotalSentBytes} (${humanTotalSentBytesPerSecond}/s)</td>
            </tbody>
          </table>
          <table class='devtools__stats__table'>
            <thead>
              <tr>
                <th>Messages received</th>
                <th>Instructions sent</th>
              </tr>
            </thead>
            <tbody id='stats'>
              <td>${this._messagesReceived}</td>
              <td>${this._instructionsSent}</td>
            </tbody>
          </table>


    `;
    return el;
  }

  handle(stats: { received: number, sent: number }): void {
    const { received, sent } = stats;
    this._messages.push({ received, sent, time: Date.now() });
    this._totalReceivedBytes += received;
    this._totalSentBytes += sent;
    if(sent) {
      this._instructionsSent += 1;
    }
    if(received) {
      this._messagesReceived += 1;
    }
  }

  destroy(): void {
    window.clearInterval(this._renderInterval);
  }

}
