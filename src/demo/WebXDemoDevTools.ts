import {
  DemoBasicInstructionHandler,
  DemoBasicMessageHandler,
  DemoBasicStatsHandler,
  DemoVisualMessageHandler
} from './handlers';
import { WebXClient, WebXDisplay } from '../core';

export class WebXDemoDevTools {

  private readonly _client: WebXClient;
  private readonly _display: WebXDisplay;

  private readonly _showPanelHandler = this._handleShowPanel.bind(this);
  private readonly _closePanelHandler = this._handleClosePanel.bind(this);
  private readonly _messagesDebuggerHandler = ((e:any) => { this._handleMessagesDebugger(e.target.checked) }).bind(this);
  private readonly _instructionsDebuggerHandler = ((e:any) => { this._handleInstructionsDebugger(e.target.checked) }).bind(this);
  private readonly _visualDebuggerHandler = ((e:any) => { this._handleVisualDebugger(e.target.checked) }).bind(this);
  private readonly _statsDebuggerHandler = ((e:any) => { this._handleStatsDebugger(e.target.checked) }).bind(this);
  private readonly _qualitySliderHandler = ((e:any) => { this._handleQualitySlider(e.target.value) }).bind(this);

  constructor(client: WebXClient, display: WebXDisplay) {
    this._display = display;
    this._client = client;
    this._initialise();
    this._bind();
  }

  dispose() {
    this._handleClosePanel();
    this._unbind();
    this._client.unregisterTracer('message');
    this._client.unregisterTracer('instruction');
    this._client.unregisterTracer('visual');
    this._client.unregisterTracer('stats');
  }

  private _initialise(): void {
    this._initialiseMessageDebugger();
    this._initialiseInstructionsDebugger();
    this._initialiseVisualDebugger();
    this._initialiseStatsDebugger();
  }

  private _bind(): void {
    this._element('btn-dev-tools').addEventListener('click', this._showPanelHandler);
    this._element('btn-dev-tools-close').addEventListener('click', this._closePanelHandler);
    this._element('toggle-messages-debugger').addEventListener('change', this._messagesDebuggerHandler);
    this._element('toggle-instructions-debugger').addEventListener('change', this._instructionsDebuggerHandler);
    this._element('toggle-visual-debugger').addEventListener('change',this._visualDebuggerHandler);
    this._element('toggle-stats-debugger').addEventListener('change', this._statsDebuggerHandler);
    this._element('quality-slider').addEventListener('input', this._qualitySliderHandler);
  }

  private _unbind(): void {
    this._element('btn-dev-tools').removeEventListener('click', this._showPanelHandler);
    this._element('btn-dev-tools-close').removeEventListener('click', this._closePanelHandler);
    this._element('toggle-messages-debugger').removeEventListener('change', this._messagesDebuggerHandler);
    this._element('toggle-instructions-debugger').removeEventListener('change', this._instructionsDebuggerHandler);
    this._element('toggle-visual-debugger').removeEventListener('change',this._visualDebuggerHandler);
    this._element('toggle-stats-debugger').removeEventListener('change', this._statsDebuggerHandler);
    this._element('quality-slider').removeEventListener('input', this._qualitySliderHandler);
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

  private _initialiseStatsDebugger(): void {
    const enabled = localStorage.getItem('devtools.debugger.stats.enabled') === 'true';
    const element = this._element('toggle-stats-debugger') as HTMLInputElement;
    element.checked = enabled;
    this._handleStatsDebugger(enabled);
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

  private _handleStatsDebugger(enabled: boolean): void {
    localStorage.setItem('devtools.debugger.stats.enabled', enabled ? 'true' : 'false');
    if (enabled) {
      this._client.registerTracer('stats', new DemoBasicStatsHandler());
    } else {
      this._client.unregisterTracer('stats');
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

  private _handleQualitySlider(value: number): void {
    this._client.setQualityIndex(value);
  }

}
