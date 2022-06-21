import { Login } from './Login';
import { WebXClient, WebXDisplay, WebXWebSocketTunnel } from '../core';
import { WebXDemoDevTools } from './WebXDemoDevTools';
import { WebxRelayProvider } from './WebxRelayProvider';

export class Application {

  private readonly _url: string;
  private readonly _login = new Login();
  private _devTools: WebXDemoDevTools;

  private readonly _resizeHandler = this._handleResize.bind(this);
  private readonly _blurHandler = this._handleBlur.bind(this);
  private readonly _visibilityChangeHandler = this._handleVisibilityChange.bind(this);
  private readonly _fullscreenHandler = this._handleFullscreen.bind(this);

  private readonly _connectHandler = this._onConnected.bind(this);
  private readonly _disconnectHandler = this._handleDisconnect.bind(this);
  private readonly _disconnectedHandler = this._onDisconnected.bind(this);

  private _client: WebXClient;

  private _relayProvider = new WebxRelayProvider();


  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = '/relay/ws';
    const host = location.hostname;
    const port = location.port;
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

    this._url = urlParams.get('url') || `${protocol}//${host}:${port}${path}`;

    document.title = `WebX Demo (${host})`;
  }

  run(): void {
    this.getConfiguration()
      .then((configuration) => {
        this._login.configuration = configuration;
        this._login.show();
      })
      .catch(error => {
        console.error(`Failed to get relay configuration: ${error.message}`);
        this._login.show();
      })

    this._login.onLogin(this._onLogin.bind(this));
  }

  private async getConfiguration(): Promise<{standaloneHost: string, standalonePort: number}> {
    const { standaloneHost, standalonePort, error} = await this._relayProvider.getConfiguration();

    if (error) {
      throw new Error(error);
    } else {
      return { standaloneHost, standalonePort }
    }

  }

  private async _onLogin(config?: {host: string, port: number,  username: string, password: string, width: number, height: number, keyboard: string}): Promise<void> {
    if (!this._client) {

      // Get authentication token
      const { token, error } = config
        ? await this._relayProvider.getAuthenticationToken(config.username, config.password)
        : {token: null, error: null};

      if (error) {
        console.error(error);
        this._login.show();

      } else {
        const tunnelOptions = config ? {
          webxhost: config.host,
          webxport: config.port,
          token: token,
          width: config.width,
          height: config.height,
          keyboard: config.keyboard
        } : {};

        this._client = new WebXClient(new WebXWebSocketTunnel(this._url, tunnelOptions), {});

        const loaderElement = document.getElementById('loader');
        loaderElement.classList.add('show');

        this._client.connect(this._disconnectedHandler)
          .then(this._connectHandler)
          .catch(error => {
            console.error(error.message);
            this._onDisconnected();
          })
      }
    }
  }

  private _onConnected(): void {
    const container = document.getElementById('display-container');

    this._client.initialise(container)
      .then((display: WebXDisplay) => {
        // Start animating the display once everything has been initialised
        display.animate();

        this._bindListeners();

        const headerElement = document.getElementById('header');
        headerElement.classList.add('show');

        const loaderElement = document.getElementById('loader');
        loaderElement.classList.remove('show');

        this._devTools = new WebXDemoDevTools(this._client, display);
      })
      .catch(err => {
        console.error(err.message);
        this._onDisconnected();
      });
  }

  private _onDisconnected(): void {
    this._unbindListeners();

    const headerElement = document.getElementById('header');
    headerElement.classList.remove('show');

    if (this._devTools) {
      this._devTools.dispose();
      this._devTools = null;
    }

    if (this._client) {
      this._client.disconnect();
      this._client = null;
    }

    this._login.show();
  }

  private _bindListeners(): void {
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('blur', this._blurHandler);
    document.addEventListener('visibilitychange', this._visibilityChangeHandler);

    document.getElementById('btn-fullscreen').addEventListener('click', this._fullscreenHandler);
    document.getElementById('btn-disconnect').addEventListener('click', this._disconnectHandler);
  };

  private _unbindListeners(): void {
    window.removeEventListener('resize', this._resizeHandler);
    window.removeEventListener('blur', this._blurHandler);
    document.removeEventListener('visibilitychange', this._visibilityChangeHandler);

    document.getElementById('btn-fullscreen').removeEventListener('click', this._fullscreenHandler);
    document.getElementById('btn-disconnect').removeEventListener('click', this._disconnectHandler);
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
      this._client.resizeDisplay();
    }
  }

  private _handleBlur(): void {
    if (this._client) {
      this._client.resetInputs();
    }
  }

  private _handleDisconnect(): void {
    if (this._client) {
      this._client.disconnect();
    }
  }

  private _handleVisibilityChange(): void {
    if (this._client) {
      this._client.resetInputs();
    }
  }

}
