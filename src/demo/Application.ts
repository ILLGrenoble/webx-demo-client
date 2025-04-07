import { Login, AuthLoginConfig, SessionConnectConfig } from './Login';
import { WebXDemoDevTools } from './WebXDemoDevTools';
import { WebxRelayProvider } from './WebxRelayProvider';
import { WebXClient, WebXDisplay, WebXWebSocketTunnel } from '@illgrenoble/webx-client';

export class Application {

  private readonly _url: string;
  private readonly _login = new Login();
  private _devTools: WebXDemoDevTools;

  private readonly _resizeHandler = this._handleResize.bind(this);
  private readonly _blurHandler = this._handleBlur.bind(this);
  private readonly _visibilityChangeHandler = this._handleVisibilityChange.bind(this);
  private readonly _fullscreenHandler = this._handleFullscreen.bind(this);

  private readonly _disconnectHandler = this._handleDisconnect.bind(this);
  private readonly _disconnectedHandler = this._onDisconnected.bind(this);

  private _client: WebXClient;

  private _relayProvider = new WebxRelayProvider();

  private _canUseClipboard = true;
  private _currentClipboardContent: string = null;

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

    // start animation control
    this._animate();
  }

  private async getConfiguration(): Promise<{standaloneHost: string, standalonePort: number}> {
    const { standaloneHost, standalonePort, error} = await this._relayProvider.getConfiguration();

    if (error) {
      throw new Error(error);
    } else {
      return { standaloneHost, standalonePort }
    }

  }

  private _animate(): void {
    requestAnimationFrame(() => {
      this._animate();
    });
  }

  private async _onLogin(config?: AuthLoginConfig | SessionConnectConfig ): Promise<void> {
    if (!this._client) {
      let tunnelOptions: any = {};
      if (config == null) {
        tunnelOptions = {};

      } else if ('sessionId' in config) {
        tunnelOptions = {
          webxhost: config.host,
          webxport: config.port,
          sessionid: config.sessionId,
        }

      } else {
        // Get authentication token
        const { token, error } = await this._relayProvider.getAuthenticationToken(config.username, config.password);

        if (error) {
          console.error(error);
          this._login.show();
          return;

        } else {
          tunnelOptions = {
            webxhost: config.host,
            webxport: config.port,
            token: token,
            width: config.width,
            height: config.height,
            keyboard: config.keyboard
          };
        }
      }

      this._client = new WebXClient(new WebXWebSocketTunnel(this._url, tunnelOptions));

      const loaderElement = document.getElementById('loader');
      loaderElement.classList.add('show');

      this._client.connect(this._disconnectedHandler, {})
        .then(() => this._onConnected())
        .catch(error => {
          console.error(error.message);
          this._onDisconnected();
        })


    }
  }

  private _onConnected(): void {
    const container = document.getElementById('display-container');

    this._client.initialise(container)
      .then((display: WebXDisplay) => {
        this._initialiseClipboardHandler();

        // Start animating the display once everything has been initialised
        display.animate();

        this._bindListeners();

        const headerElement = document.getElementById('header');
        headerElement.classList.add('show');

        const loaderElement = document.getElementById('loader');
        loaderElement.classList.remove('show');

        this._devTools = new WebXDemoDevTools(this._client);
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
  }

  private _unbindListeners(): void {
    window.removeEventListener('resize', this._resizeHandler);
    window.removeEventListener('blur', this._blurHandler);
    document.removeEventListener('visibilitychange', this._visibilityChangeHandler);

    document.getElementById('btn-fullscreen').removeEventListener('click', this._fullscreenHandler);
    document.getElementById('btn-disconnect').removeEventListener('click', this._disconnectHandler);
  }

  private _initialiseClipboardHandler(): void {
    this._canUseClipboard = true;
    this._client.clipboardHandler = (clipboardContent: string) => this._setNavigatorClipboardHandler(clipboardContent);
    this._startClipboardReadTimer();
  }

  private _startClipboardReadTimer(): void {
    if (this._canUseClipboard) {
      setTimeout(() => this._readClipboard(), 1000);
    }
  }

  private _readClipboard(): void {
    if (document.hasFocus()) {
      navigator.clipboard.readText()
        .then(clipboardContent => {
          if (this._client) {
            if (this._currentClipboardContent != clipboardContent) {
              this._currentClipboardContent = clipboardContent;
              this._client.sendClipboardContent(clipboardContent);
            }

            this._startClipboardReadTimer();
          }

        })
        .catch((error) => {
          console.error(error.message);
          // Failed to read local clipboard
          this._canUseClipboard = false;
        });

    } else {
      this._startClipboardReadTimer();
    }
  }

  private _setNavigatorClipboardHandler(clipboardContent: string): void {
    if (this._canUseClipboard) {
      navigator.clipboard.writeText(clipboardContent);
      this._currentClipboardContent = clipboardContent;
    }
  }

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
