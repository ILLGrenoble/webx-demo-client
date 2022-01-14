export class Login {

  private _host: string;
  private _port: number = 5555;
  private _username: string;
  private _password: string = '';
  private _callback: (host: string, port: number,  username: string, password: string) => void;

  private _loginHandler = this._handleLogin.bind(this);
  private _loginOnEnterKeyHandler = this._handleLoginOnEnterKey.bind(this);

  constructor() {
    this._initialise();
  }

  onLogin(callback: (host: string, port: number, username: string, password: string) => void) {
    this._callback = callback;
  }

  show(): void {
    this._showPanel();
  }

  private _initialise(): void {
    this._initialiseHost();
    this._initialisePort();
    this._initialiseUsername();
    this._initialisePassword();
    this._bind();
    this._showPanel();
  }

  private _bind(): void {
    this._element('login-remote-host').addEventListener('change', (e: any) => this._handleHostChange(e.target.value));
    this._element('login-remote-port').addEventListener('change', (e: any) => this._handlePortChange(e.target.value));
    this._element('login-username').addEventListener('change', (e: any) => this._handleUsernameChange(e.target.value));
    this._element('login-password').addEventListener('change', (e: any) => this._handlePasswordChange(e.target.value));
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

  private _initialiseHost(): void {
    const host = localStorage.getItem('login.remote-host');
    const element = this._element('login-remote-host') as HTMLInputElement;
    element.value = host;
    this._host = host;
  }

  private _initialisePort(): void {
    const portString = localStorage.getItem('login.remote-port');
    const port = parseInt(portString);
    if (!isNaN(port)) {
      const element = this._element('login-remote-port') as HTMLInputElement;
      element.value = `${port}`;
      this._port = port;
    }
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

  private _handleUsernameChange(value: string): void {
    this._username = value;
    localStorage.setItem('login.username', value);
  }

  private _handlePasswordChange(value: string): void {
    this._password = value;
  }

  private _handleLogin(): void {
    if (this._callback) {
      this._closePanel();
      this._callback(this._host, this._port != null ? this._port : 5555, this._username, this._password);
    }
  }

  private _handleLoginOnEnterKey(event: any): void {
    event.preventDefault();
    if (event.keyCode === 13) {
      if (this._callback) {
        this._closePanel();
        this._callback(this._host, this._port != null ? this._port : 5555, this._username, this._password);
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

}
