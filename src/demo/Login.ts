export class Login {

  private _remoteHost: string;
  private _username: string;
  private _password: string;
  private _callback: (remoteHost: string, username: string, password: string) => void;

  constructor() {
    this._initialise();
  }

  onLogin(callback: (remoteHost: string, username: string, password: string) => void) {
    this._callback = callback;
  }

  show(): void {
    this._showPanel();
  }

  private _initialise(): void {
    this._initialiseRemoteHost();
    this._initialiseUsername();
    this._bind();
    this._showPanel();
  }

  private _bind(): void {
    this._element('btn-login').addEventListener('click', this._handleLogin.bind(this));
    this._element('login-remote-host').addEventListener('change', (e: any) => this._handleRemoteHostChange(e.target.value));
    this._element('login-username').addEventListener('change', (e: any) => this._handleUsernameChange(e.target.value));
  }

  private _element(id: string): HTMLElement {
    return document.getElementById(id);
  }

  private _initialiseRemoteHost(): void {
    const remoteHost = localStorage.getItem('login.remote-host');
    const element = this._element('login-remote-host') as HTMLInputElement;
    element.value = remoteHost;
    this._remoteHost = remoteHost;
  }

  private _initialiseUsername(): void {
    const username = localStorage.getItem('login.username');
    const element = this._element('login-username') as HTMLInputElement;
    element.value = username;
    this._username = username;
  }

  private _handleRemoteHostChange(value: string): void {
    this._remoteHost = value;
    localStorage.setItem('login.remote-host', value);
  }

  private _handleUsernameChange(value: string): void {
    this._username = value;
    localStorage.setItem('login.username', value);
  }

  private _handleLogin(): void {
    if (this._callback) {
      this._closePanel();
      this._callback(this._remoteHost, this._username, this._password);
    }
  }

  private _showPanel(): void {
    const el = this._element('login-panel');
    el.classList.add('show');
  }

  private _closePanel(): void {
    const el = this._element('login-panel');
    el.classList.remove('show');
  }

}
