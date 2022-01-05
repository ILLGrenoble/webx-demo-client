import { Login } from './Login';
import { WebXClient, WebXDisplay, WebXWebSocketTunnel } from '../core';
import { WebXDemoDevTools } from './WebXDemoDevTools';

export class Application {

  private readonly _url: string;
  private readonly _login = new Login();
  private _devTools: WebXDemoDevTools;

  private readonly _resizeHandler = this._handleResize.bind(this);
  private readonly _blurHandler = this._handleBlur.bind(this);
  private readonly _visibilityChangeHandler = this._handleVisibilityChange.bind(this);
  private readonly _fullscreenHandler = this._handleFullscreen.bind(this);

  private readonly _connectHandler = this._onConnected.bind(this);
  private readonly _disconnectHandler = this._onDisconnected.bind(this);

  private _client: WebXClient;


  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this._url = urlParams.get('url') || 'ws://localhost:8080';
  }

  run(): void {
    this._login.onLogin(this._onLogin.bind(this));
  }

  private _onLogin(remoteHost: string, username: string, password: string): void {
    const tunnelOptions = {
      webxhost: remoteHost,
      webxport: 5555,
      username: username,
      password: password
    }

    this._client = new WebXClient(new WebXWebSocketTunnel(this._url, tunnelOptions), {});
    this._client.connect(this._disconnectHandler)
      .then(this._connectHandler)
      .catch(error => {
        console.error(error);
        this._onDisconnected();
      })
  }

  private _onConnected(): void {
    const container = document.getElementById('display-container');

    this._client.initialise(container)
      .then((display: WebXDisplay) => {
        // Start animating the display once everything has been initialised
        display.animate();

        this._bindListeners();

        this._devTools = new WebXDemoDevTools(this._client, display);
      })
      .catch(err => {
        console.error(err);
        this._onDisconnected();
      });

  }

  private _onDisconnected(): void {
    this._unbindListeners();

    if (this._devTools) {
      this._devTools.dispose();
      this._devTools = null;
    }

    this._login.show();
  }

  private _bindListeners(): void {
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('blur', this._blurHandler);
    document.addEventListener('visibilitychange', this._visibilityChangeHandler);

    document.getElementById('btn-fullscreen').addEventListener('click', this._fullscreenHandler);
  };

  private _unbindListeners(): void {
    window.removeEventListener('resize', this._resizeHandler);
    window.removeEventListener('blur', this._blurHandler);
    document.removeEventListener('visibilitychange', this._visibilityChangeHandler);

    document.getElementById('btn-fullscreen').removeEventListener('click', this._fullscreenHandler);
  };

  private _handleFullscreen(): void {
    const display = this._client.display;
    display.containerElement.requestFullscreen().then(() => {
      // @ts-ignore
      if (navigator.keyboard) {
        // @ts-ignore
        navigator.keyboard.lock();
      }
      display.resize();
    });

  }

  private _handleResize(): void {
    if (this._client) {
      this._client.display.resize();
    }
  }

  private _handleBlur(): void {
    if (this._client) {
      this._client.mouse.reset();
      this._client.keyboard.reset();
    }
  }

  private _handleVisibilityChange(): void {
    if (this._client) {
      this._client.mouse.reset();
      this._client.keyboard.reset();
    }
  }

}
