

export type AuthLoginConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  width: number;
  height: number;
  keyboard: string;
}

export type SessionConnectConfig = {
  host: string;
  port: number;
  sessionId: string;
}

export class Login {

  private static DEFAULT_PORT = 5555;

  private _configuration: {standaloneHost: string, standalonePort: number};

  private _isStandalone = false;
  private _connectWithSessionId = false;
  private _host: string;
  private _port: number = 5555;
  private _username: string;
  private _password: string = '';
  private _sessionId: string = '';
  private _resolution: {width: number, height: number} = null;
  private _keyboardLayout: string = null;
  private _callback: (config?: AuthLoginConfig | {host: string, port: number, sessionId: string}) => void;

  private _loginHandler = this._handleLogin.bind(this);
  private _loginOnEnterKeyHandler = this._handleLoginOnEnterKey.bind(this);

  public _resolutions = [{
      label: '',
      width: null,
      height: null,
    },{
      label: 'WXGA (1280 x 720) 16:9',
      width: 1280,
      height: 720,
    }, {
      label: 'WXGA (1280 x 800) 16:10',
      width: 1280,
      height: 800,
    }, {
      label: 'SXGA (1280 x 1024) 5:4',
      width: 1280,
      height: 1024,
    }, {
      label: 'WXGA+ (1440 x 900) 16:10',
      width: 1440,
      height: 900,
    }, {
      label: 'HD+ (1600 x 900) 16:9',
      width: 1600,
      height: 900,
    }, {
      label: 'WSXGA+ (1680 x 1050) 16:10',
      width: 1680,
      height: 1050,
    }, {
      label: 'FHD (1920 x 1080) 16:9',
      width: 1920,
      height: 1080,
    }, {
      label: 'WUXGA (1920 x 1200) 16:10',
      width: 1920,
      height: 1200,
    }, {
      label: 'QHD (2560 x 1440) 16:9',
      width: 2560,
      height: 1440,
    }, {
      label: '4K UHD (3840 x 2160) 16:9',
      width: 3840,
      height: 2160,
    }];

  private _keyboardLayouts = [
    {
      layout: "gb",
      name: "English (UK) keyboard",
    },
    {
      layout: "us",
      name: "English (US) keyboard",
    },
    {
      layout: "fr",
      name: "French keyboard (azerty)",
    },
    {
      layout: "de",
      name: "German keyboard (qwertz)",
    }];

  set configuration(configuration: {standaloneHost: string, standalonePort: number}) {
    this._configuration = configuration;
    this._onConfiguration();
  }

  constructor() {
    this._initialise();
  }

  onLogin(callback: (config?: AuthLoginConfig | SessionConnectConfig) => void): void {
    this._callback = callback;
  }

  show(): void {
    this._showPanel();
  }

  hide(): void {
    this._closePanel();
  }

  private _initialise(): void {
    this._initialiseHost();
    this._initialisePort();
    this._initialiseUsername();
    this._initialisePassword();
    this._initialiseResolution();
    this._initialiseKeyboard();
    this._bind();
  }

  private _bind(): void {
    this._element('login-remote-host').addEventListener('change', (e: any) => this._handleHostChange(e.target.value));
    this._element('login-remote-port').addEventListener('change', (e: any) => this._handlePortChange(e.target.value));
    this._element('login-username').addEventListener('change', (e: any) => this._handleUsernameChange(e.target.value));
    this._element('login-session-id').addEventListener('change', (e: any) => this._handleSessionIdChange(e.target.value));
    this._element('login-password').addEventListener('change', (e: any) => this._handlePasswordChange(e.target.value));
    this._element('login-resolution').addEventListener('change', (e: any) => this._handleResolutionChange(e.target.value));
    this._element('login-keyboard').addEventListener('change', (e: any) => this._handleKeyboardChange(e.target.value));
    this._element('login-session-id-check').addEventListener('change', (e: any) => this._handleSessionIdCheck(e.target.checked));
  }

  private _bindInputEvents(): void {
    this._element('btn-login').addEventListener('click', this._loginHandler);
    this._element('login-password').addEventListener('keyup', this._loginOnEnterKeyHandler);
  }

  private _unbindInputEvents(): void {
    this._element('btn-login').removeEventListener('click', this._loginHandler);
    this._element('login-password').removeEventListener('keyup', this._loginOnEnterKeyHandler);
  }

  private _element(id: string): HTMLElement {
    return document.getElementById(id);
  }

  private _onConfiguration() {
    this._isStandalone = this._configuration.standaloneHost != null && this._configuration.standalonePort != null;
    if (this._isStandalone) {
      const elements = document.getElementsByClassName('not_standalone');
      for (let i = 0; i < elements.length; i++) {
        (elements[i] as HTMLElement).style.display = 'none';
      }

      this._setStandaloneHost(this._configuration.standaloneHost);
      this._setStandalonePort(this._configuration.standalonePort);
      this._element('btn-login').textContent = 'Connect';
    } else {
      const element = this._element('login-standalone-text') as HTMLInputElement;
      element.style.display = 'none';

      const sessionIdConnect = document.getElementById('session_id_connect');
      sessionIdConnect.style.display = 'none'
    }
  }

  private _initialiseHost(): void {
    let host = localStorage.getItem('login.remote-host');
    if (host == null) {
      host = location.hostname;
    }
    const element = this._element('login-remote-host') as HTMLInputElement;
    element.value = host;
    this._host = host;
  }

  private _initialisePort(): void {
    const portString = localStorage.getItem('login.remote-port');
    let port = parseInt(portString);
    if (isNaN(port)) {
      port = Login.DEFAULT_PORT;
    }
    const element = this._element('login-remote-port') as HTMLInputElement;
    element.value = `${port}`;
    this._port = port;
  }

  private _initialiseUsername(): void {
    const username = localStorage.getItem('login.username');
    const element = this._element('login-username') as HTMLInputElement;
    element.value = username;
    this._username = username;
  }

  private _initialisePassword(): void {
    const element = this._element('login-password') as HTMLInputElement;
    element.value = '';
    this._password = '';
  }

  private _initialiseResolution(): void {
    const element = this._element('login-resolution') as HTMLSelectElement;

    const width = window.screen.width;
    const height = window.screen.height;

    this._resolutions[0] = {
      width: width,
      height: height,
      label: `Current (${width}x${height})`
    };

    this._resolutions.forEach(({label}, index) => {
      const option = document.createElement("option");
      option.value = `${index}`;
      option.text = label;
      element.add(option);
    });

    const currentIndex = localStorage.getItem('login.resolution') == null ? 0 : +localStorage.getItem('login.resolution');
    element.selectedIndex = currentIndex;
    this._resolution = this._resolutions[currentIndex];
  }

  private _initialiseKeyboard(): void {
    const element = this._element('login-keyboard') as HTMLSelectElement;

    this._keyboardLayouts.forEach(({name}, index) => {
      const option = document.createElement("option");
      option.value = `${index}`;
      option.text = name;
      element.add(option);
    });

    const currentIndex = localStorage.getItem('login.keyboard') == null ? 0 : +localStorage.getItem('login.keyboard');
    element.selectedIndex = currentIndex;
    this._keyboardLayout = this._keyboardLayouts[currentIndex].layout;
  }

  private _handleHostChange(value: string): void {
    this._host = value;
    localStorage.setItem('login.remote-host', value);
  }

  private _handlePortChange(value: string): void {
    const port = parseInt(value);
    if (!isNaN(port)) {
      this._port = port;
      localStorage.setItem('login.remote-port', value);
    }
  }

  private _handleSessionIdChange(value: string): void {
    this._sessionId = value;
  }

  private _handleUsernameChange(value: string): void {
    this._username = value;
    localStorage.setItem('login.username', value);
  }

  private _handlePasswordChange(value: string): void {
    this._password = value;
  }

  private _handleResolutionChange(value: string): void {
    const index = +value;
    this._resolution = this._resolutions[index];
    localStorage.setItem('login.resolution', value);
  }

  private _handleKeyboardChange(value: string): void {
    const index = +value;
    const keyboard = this._keyboardLayouts[index];
    this._keyboardLayout = keyboard.layout;
    localStorage.setItem('login.keyboard', value);
  }

  private _handleSessionIdCheck(value: boolean): void {
    this._connectWithSessionId = value;

    if (this._connectWithSessionId) {
      const elements = document.getElementsByClassName('create_session');
      for (let i = 0; i < elements.length; i++) {
        (elements[i] as HTMLElement).style.display = 'none';
      }
      const sessionIdConnect = document.getElementById('session_id_connect');
      sessionIdConnect.style.display = '';

    } else {
      const elements = document.getElementsByClassName('create_session');
      for (let i = 0; i < elements.length; i++) {
        (elements[i] as HTMLElement).style.display = '';
      }
      const sessionIdConnect = document.getElementById('session_id_connect');
      sessionIdConnect.style.display = 'none';
    }
  }

  private _handleLogin(): void {
    if (this._callback) {
      this._closePanel();
      this._callback(this._getLoginConfig());
    }
  }

  private _handleLoginOnEnterKey(event: any): void {
    event.preventDefault();
    if (event.keyCode === 13) {
      if (this._callback) {
        this._closePanel();
        this._callback(this._getLoginConfig());
      }
    }
  }

  private _getLoginConfig(): AuthLoginConfig | SessionConnectConfig {
    if (this._isStandalone) {
      return null;

    } else if (this._connectWithSessionId) {

      return {
        host: this._host,
        port: this._port != null ? this._port : 5555,
        sessionId: this._sessionId,
      }

    } else {
      return {
        host: this._host,
        port: this._port != null ? this._port : 5555,
        username: this._username,
        password: this._password,
        width: this._resolution.width,
        height: this._resolution.height,
        keyboard: this._keyboardLayout,
      }
    }
  }

  private _showPanel(): void {
    this._bindInputEvents();
    this._initialisePassword();
    const el = this._element('login-panel');
    el.classList.add('show');
  }

  private _closePanel(): void {
    this._unbindInputEvents();
    const el = this._element('login-panel');
    el.classList.remove('show');
  }


  private _setStandaloneHost(value: string): void {
    localStorage.setItem('login.remote-host', value);
    const element = this._element('login-remote-host') as HTMLInputElement;
    element.value = value;
    element.disabled = true;
    this._host = value;
  }

  private _setStandalonePort(value: number): void {
    localStorage.setItem('login.remote-port', value.toString());
    const element = this._element('login-remote-port') as HTMLInputElement;
    element.value = value.toString();
    element.disabled = true;
    this._port = value;
  }
}
