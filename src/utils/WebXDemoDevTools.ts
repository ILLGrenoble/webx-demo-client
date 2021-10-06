import { DemoBasicInstructionHandler, DemoBasicMessageHandler } from '../demo/handlers';
import { DemoVisualMessageHandler } from '../demo/handlers/DemoVisualMessageHandler';
import { WebXClient } from '../WebXClient';
import { WebXDisplay } from '../display';

export class WebXDemoDevTools {

  private readonly _client: WebXClient;
  private readonly _display: WebXDisplay;

  constructor(client: WebXClient, display: WebXDisplay) {
    this._display = display;
    this._client = client;
    this._initialise();
    this._bind();
  }

  private _initialise(): void {
    this._initialiseMessageDebugger();
    this._initialiseInstructionsDebugger();
    this._initialiseVisualDebugger();
  }

  private _bind(): void {
    this._element('btn-dev-tools').addEventListener('click', this._handleShowPanel.bind(this));
    this._element('btn-dev-tools-close').addEventListener('click', this._handleClosePanel.bind(this));
    this._element('toggle-messages-debugger').addEventListener('change', (e: any) => this._handleMessagesDebugger(e.target.checked));
    this._element('toggle-instructions-debugger').addEventListener('change', (e: any) => this._handleInstructionsDebugger(e.target.checked));
    this._element('toggle-visual-debugger').addEventListener('change', (e: any) => this._handleVisualDebugger(e.target.checked));
  }

  private _initialiseMessageDebugger(): void {
    const enabled = localStorage.getItem('devtools.debugger.messages.enabled') === 'true';
    const element = this._element('toggle-messages-debugger') as HTMLInputElement;
    element.checked = enabled;
    this._handleMessagesDebugger(enabled);
  }

  private _initialiseInstructionsDebugger(): void {
    const enabled = localStorage.getItem('devtools.debugger.instructions.enabled') === 'true';
    const element = this._element('toggle-instructions-debugger') as HTMLInputElement;
    element.checked = enabled;
    this._handleInstructionsDebugger(enabled);
  }

  private _initialiseVisualDebugger(): void {
    const enabled = localStorage.getItem('devtools.debugger.visual.enabled') === 'true';
    const element = this._element('toggle-visual-debugger') as HTMLInputElement;
    element.checked = enabled;
    this._handleVisualDebugger(enabled);
  }

  private _element(id: string): HTMLElement {
    return document.getElementById(id);
  }

  private _handleShowPanel(): void {
    const el = this._element('devtools-panel');
    el.classList.add('show');
  }

  private _handleClosePanel(): void {
    const el = this._element('devtools-panel');
    el.classList.remove('show');
  }

  private _handleMessagesDebugger(enabled: boolean): void {
    localStorage.setItem('devtools.debugger.messages.enabled', enabled ? 'true' : 'false');
    if (enabled) {
      this._client.registerTracer('message', new DemoBasicMessageHandler());
    } else {
      this._client.unregisterTracer('message');
    }
  }

  private _handleInstructionsDebugger(enabled: boolean): void {
    localStorage.setItem('devtools.debugger.instructions.enabled', enabled ? 'true' : 'false');
    if (enabled) {
      this._client.registerTracer('instruction', new DemoBasicInstructionHandler());
    } else {
      this._client.unregisterTracer('instruction');
    }
  }

  private _handleVisualDebugger(enabled: boolean): void {
    localStorage.setItem('devtools.debugger.visual.enabled', enabled ? 'true' : 'false');
    if (enabled) {
      this._client.registerTracer('visual', new DemoVisualMessageHandler(this._display));
    } else {
      this._client.unregisterTracer('visual');
    }
  }

}
