import './styles.scss';
import { WebXSubImage } from './display';
import { WebXClient } from './WebXClient';
import { WebXWebSocketTunnel } from './tunnel';
import { WebXWindowsInstruction } from './instruction';
import { WebXScreenMessage, WebXWindowsMessage } from './message';
import { WebXMouseState } from './input';
import { WebXDemoDevTools } from './utils';

document.addEventListener('DOMContentLoaded', () => {

  const urlParams = new URLSearchParams(window.location.search);
  const tunnel = new WebXWebSocketTunnel(urlParams.get('url') || 'ws://localhost:8080');

  const client = new WebXClient(tunnel, {});

  client
    .connect()
    .then((screenMessage: WebXScreenMessage) => {
      const { width, height } = screenMessage.screenSize;
      const container = document.getElementById('display-container');

      const display = client.createDisplay(container, width, height);
      display.animate();

      client.sendRequest(new WebXWindowsInstruction()).then(response => {
        display.updateWindows((response as WebXWindowsMessage).windows);
      });

      const mouse = client.createMouse(container);

      mouse.onMouseMove = mouse.onMouseOut = (mouseState: WebXMouseState) => {
        const scale = display.scale;
        mouseState.x = mouseState.x / scale;
        mouseState.y = mouseState.y / scale;
        client.sendMouse(mouseState);
        display.updateMousePosition(mouseState.x, mouseState.y);
      };

      mouse.onMouseDown = mouse.onMouseUp = (mouseState: WebXMouseState) => {
        client.sendMouse(mouseState);
      };

      const keyboard = client.createKeyboard(document.body);

      keyboard.onKeyDown = key => {
        client.sendKeyDown(key);
      };

      keyboard.onKeyUp = key => {
        client.sendKeyUp(key);
      };

      client.onWindows = windows => {
        display.updateWindows(windows);
      };

      client.onImage = (windowId, depth, texture) => {
        // console.log(`Updating image ${windowId} [${texture.image.width}, ${texture.image.height}]\n`);
        display.updateImage(windowId, depth, texture);
      };

      client.onSubImages = (windowId: number, subImages: WebXSubImage[]) => {
        // console.log(`Updating sub images ${windowId}\n`);
        display.updateSubImages(windowId, subImages);
      };

      client.onMouse = (x: number, y: number, cursorId: number) => {
        display.updateMouse(x, y, cursorId);
      };

      // Resize the display when the window is resized
      window.addEventListener('resize', () => display.resize());

      document.addEventListener('visibilitychange', () => {
        mouse.reset();
      });

      // Enter into full screen mode
      document.getElementById('btn-fullscreen').addEventListener('click', (event) => {
        display.containerElement.requestFullscreen().then(() => {
          display.resize();
        });
      });

      new WebXDemoDevTools(client, display);

    })
    .catch(err => console.error(err));
});
