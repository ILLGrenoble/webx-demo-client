import { Login, AuthLoginConfig, SessionConnectConfig } from './Login';
import { WebXDemoDevTools } from './WebXDemoDevTools';
import { WebxRelayProvider } from './WebxRelayProvider';
import { WebXClient, WebXConnectionStatus, WebXDisplay, WebXKeyboardCombinationHandler, WebXWebSocketTunnel} from '@illgrenoble/webx-client';
import * as FileSaver from 'file-saver';

const createResizeListenerFunction = (callback: () => void, delay: number = 200): { start: () => void, stop: () => void, enabled: () => boolean } => {
  let timeoutId: any = null;
  let enabled: boolean = false;

  function onResize() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback();
    }, delay);
  }

  return {
    start() {
      if (enabled) {
        return;
      }
      enabled = true;
      window.addEventListener('resize', onResize);

      const resizeButton = document.getElementById('btn-auto-resize');
      resizeButton.innerHTML = 'Stop resizing';
      resizeButton.classList.add('warning');
    },

    stop() {
      if (!enabled) return;
      enabled = false;
      window.removeEventListener('resize', onResize);

      const resizeButton = document.getElementById('btn-auto-resize');
      resizeButton.innerHTML = 'Resize automatically';
      resizeButton.classList.remove('warning');

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },

    enabled() {
      return enabled;
    }
  };
}

export class Application {

  private readonly _url: string;
  private readonly _login = new Login();
  private _devTools: WebXDemoDevTools;

  private readonly _resizeHandler = this._handleResize.bind(this);
  private readonly _blurHandler = this._handleBlur.bind(this);
  private readonly _visibilityChangeHandler = this._handleVisibilityChange.bind(this);
  private readonly _fullscreenHandler = this._handleFullscreen.bind(this);
  private readonly _autoResizeHandler = this._handleAutomaticResize.bind(this);
  private readonly _screenshotHandler = this._handleScreenshot.bind(this);
  private readonly _keyboardSelectHandler = this._handleKeyboardSelect.bind(this);

  private readonly _disconnectHandler = this._handleDisconnect.bind(this);
  private readonly _disconnectedHandler = this._onDisconnected.bind(this);

  private _client: WebXClient;

  private _relayProvider = new WebxRelayProvider();

  private _canUseClipboard = true;
  private _currentClipboardContent: string = null;
  private _resizeListenerFunction = createResizeListenerFunction(() => {
    this._resizeScreen();
  }, 400)

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

      // this._client = new WebXClient(new WebXWebSocketTunnel(this._url, tunnelOptions), {display: {filter: {name: 'crt', params: {backgroundColor: '#000000', curvature: 8.0 }}}});
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

    const statusText = document.getElementById('status-text');
    statusText.innerHTML = 'Connecting...';

    this._client.initialise(container, {connectionStatusCallback: this._onConnectionStatusUpdate})
      .then((display: WebXDisplay) => {
        this._initialiseClipboardHandler();

        // Start animating the display once everything has been initialised
        display.animate();

        this._bindListeners();

        const headerElement = document.getElementById('header');
        headerElement.classList.add('show');

        const loaderElement = document.getElementById('loader');
        loaderElement.classList.remove('show');

        const resizeButton = document.getElementById('btn-auto-resize')
        if (this._client.canResizeScreen()) {
          resizeButton.style.display = 'block';
        } else {
          resizeButton.style.display = 'none';
        }

        const keyboardSelect = document.getElementById('select-keyboard') as HTMLSelectElement;
        if (this._client.canChangeKeyboardLayout()) {
          keyboardSelect.style.display = 'block';
          keyboardSelect.value = this._client.keyboardLayoutName;
          this._client.keyboardLayoutHandler = (keyboardLayoutName) => {
            keyboardSelect.value = keyboardLayoutName;
          }
        } else {
          keyboardSelect.style.display = 'none';
        }

        this._client.registerTracer('filter-toggle', new WebXKeyboardCombinationHandler([65362, 65362, 65362, 65364, 65364, 65364, 65361, 65363, 65361, 65363, 65293], () => {
          const display = this._client.display;
          if (display.filter) {
            display.filter = null;
          } else {
            display.filter = 'crt';
          }
        }));

        this._devTools = new WebXDemoDevTools(this._client);
      })
      .catch(err => {
        console.error(err.message);
        this._onDisconnected();
      });
  }

  private _onConnectionStatusUpdate(status: WebXConnectionStatus): void {
    if (status == WebXConnectionStatus.STARTING) {
      const statusText = document.getElementById('status-text');
      statusText.innerHTML = 'Session starting...';
    } else {
      const statusText = document.getElementById('status-text');
      statusText.innerHTML = 'Connected';
    }

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
      this._client.unregisterTracer('filter-toggle');
      this._client.disconnect();
      this._client = null;
    }

    if (this._resizeListenerFunction.enabled()) {
      this._resizeListenerFunction.stop();
    }

    this._login.show();
  }

  private _bindListeners(): void {
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('blur', this._blurHandler);
    document.addEventListener('visibilitychange', this._visibilityChangeHandler);

    document.getElementById('btn-fullscreen').addEventListener('click', this._fullscreenHandler);
    document.getElementById('btn-auto-resize').addEventListener('click', this._autoResizeHandler);
    document.getElementById('btn-screenshot').addEventListener('click', this._screenshotHandler);
    document.getElementById('select-keyboard').addEventListener('change', this._keyboardSelectHandler);
    document.getElementById('btn-disconnect').addEventListener('click', this._disconnectHandler);
  }

  private _unbindListeners(): void {
    window.removeEventListener('resize', this._resizeHandler);
    window.removeEventListener('blur', this._blurHandler);
    document.removeEventListener('visibilitychange', this._visibilityChangeHandler);

    document.getElementById('btn-fullscreen').removeEventListener('click', this._fullscreenHandler);
    document.getElementById('btn-auto-resize').removeEventListener('click', this._autoResizeHandler);
    document.getElementById('btn-screenshot').removeEventListener('click', this._screenshotHandler);
    document.getElementById('select-keyboard').removeEventListener('change', this._keyboardSelectHandler);
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
    if (document.hasFocus() && navigator.clipboard) {
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

  private _handleAutomaticResize(): void {
    if (this._resizeListenerFunction.enabled()) {
      this._resizeListenerFunction.stop();

    } else {
      this._resizeScreen();
      this._resizeListenerFunction.start();
    }
  }

  private _resizeScreen(): void {
    if (this._client.canResizeScreen()) {
      const displayElement = document.getElementById('display');
      const width = displayElement.clientWidth;
      const height = displayElement.clientHeight;
      this._client.resizeScreen(width, height);
    }
  }

  private _handleScreenshot(): void {
    this._client.createScreenshot('image/jpeg', 0.9).then((blob) => {
      if (blob) {
        FileSaver.saveAs(blob, `screenshot.jpg`);
      }
    });
  }

  private _handleResize(): void {
    if (this._client) {
      this._client.resizeDisplay();
    }
  }

  private _handleKeyboardSelect(data: any): void {
   const value = data.target.value;
   if (value) {
     this._client.setKeyboardLayout(value);
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
