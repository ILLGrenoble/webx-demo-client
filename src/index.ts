import './styles.scss';
import { WebXDisplay, WebXSubImage } from './display';
import { WebXClient } from './WebXClient';
import { WebXWebSocketTunnel } from './tunnel';
import { WebXWindowsInstruction } from './instruction';
import { WebXWindowsMessage, WebXScreenMessage } from './message';
import { WebXInstructionTracer, WebXMessageTracer } from './tracer';
import { WebXMouseState } from './input';
import * as screenfull from 'screenfull';
import { Screenfull } from 'screenfull';
import {DemoBasicInstructionHandler, DemoBasicMessageHandler} from "./demo/handlers";
import {DemoVisualMessageHandler} from "./demo/handlers/DemoVisualMessageHandler";

document.addEventListener('DOMContentLoaded', (event) => {

  const urlParams = new URLSearchParams(window.location.search);
  const tunnel = new WebXWebSocketTunnel(urlParams.get('url') || 'ws://localhost:8080');

  const client = new WebXClient(tunnel, {
    tracers: {
      message: new WebXMessageTracer(new DemoBasicMessageHandler()),
      instruction: new WebXInstructionTracer(new DemoBasicInstructionHandler())
    }
  });

  let display: WebXDisplay;
  client
    .connect()
    .then((screenMessage: WebXScreenMessage) => {
      const { width, height } = screenMessage.screenSize;
      const container = document.getElementById('display-container');

      display = new WebXDisplay(container, width, height);
      display.animate();

      client.tracers.message.addHandler(new DemoVisualMessageHandler(display));

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
      }

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

    })
    .catch(err => console.error(err));
});
