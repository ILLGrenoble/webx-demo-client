import './styles.css';
import { WebXDisplay, WebXSubImage } from './display';
import { WebXClient } from './WebXClient';
import { WebXWebSocketTunnel } from './tunnel';
import { WebXWindowsInstruction } from './instruction';
import { WebXWindowsMessage } from './message';
import { Texture } from 'three';

document.addEventListener('DOMContentLoaded', function(event) {

  const tunnel = new WebXWebSocketTunnel('ws://localhost:8080');
  const client = new WebXClient(tunnel);

  let display: WebXDisplay;
  client
    .connect()
    .then(screenMessage => {
      const { width, height } = screenMessage.screenSize;

      display = new WebXDisplay(width, height);
      display.animate();

      const container = document.getElementById('canvas-frame');
      container.appendChild(display.renderer.domElement);
      container.style.maxWidth = display.screenWidth + 'px';

      client.sendRequest(new WebXWindowsInstruction()).then(response => {
        display.updateWindows((response as WebXWindowsMessage).windows);
      });

      const mouse = client.createMouse(container);

      mouse.onMouseDown = mouse.onMouseUp = mouse.onMouseMove = mouse.onMouseOut = mouseState => {
        const scale = display.getScale();
        mouseState.x = mouseState.x / scale;
        mouseState.y = mouseState.y / scale;
        client.sendMouse(mouseState);
        display.updateMousePosition(mouseState.x, mouseState.y);
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

      client.onMouseCursor = (x: number, y: number, xHot: number, yHot: number, name: string, texture: Texture) => {
        display.updateMouseCursor(x, y, xHot, yHot, name, texture);
      };
    })
    .catch(err => console.error(err));
});
