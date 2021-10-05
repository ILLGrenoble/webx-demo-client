import './styles.scss';
import { WebXSubImage } from './display';
import { WebXClient } from './WebXClient';
import { WebXWebSocketTunnel } from './tunnel';
import { WebXWindowsInstruction } from './instruction';
import { WebXScreenMessage, WebXWindowsMessage } from './message';
import { WebXMouseState } from './input';
import { DemoBasicInstructionHandler, DemoBasicMessageHandler } from './demo/handlers';
import { DemoVisualMessageHandler } from './demo/handlers/DemoVisualMessageHandler';
import * as screenfull from 'screenfull';
import { Screenfull } from 'screenfull';


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
      document.getElementById('btn-fullscreen').addEventListener('click', () => {
        (screenfull as Screenfull).request(display.containerElement);
        display.resize();
      });

      document.getElementById('btn-dev-tools').addEventListener('click', () => {
        const el = document.getElementById('devtools-panel');
        el.classList.add('show');
      });

      document.getElementById('btn-dev-tools-close').addEventListener('click', () => {
        const el = document.getElementById('devtools-panel');
        el.classList.remove('show');
      });

      document.getElementById('toggle-messages-debugger').addEventListener('click', (e: any) => {
        if (e.target.checked) {
          client.registerTracer('message', new DemoBasicMessageHandler());
        } else {
          client.unregisterTracer('message');
        }
      });

      document.getElementById('toggle-instructions-debugger').addEventListener('click', (e: any) => {
        if (e.target.checked) {
          client.registerTracer('instruction', new DemoBasicInstructionHandler());
        } else {
          client.unregisterTracer('instruction');
        }
      });

      document.getElementById('toggle-visual-debugger').addEventListener('click', (e: any) => {
        if (e.target.checked) {
          client.registerTracer('visual', new DemoVisualMessageHandler(display));
        } else {
          client.unregisterTracer('visual');
        }
      });

    })
    .catch(err => console.error(err));
});
