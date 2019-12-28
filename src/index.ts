import './styles.css';
import { WebXDisplay } from './display/WebXDisplay';
import { WebXClient } from './WebXClient';
import { WebXWebSocketTunnel } from './tunnel';
import { WebXWindowsInstruction, WebXMouseInstruction, WebXKeyboardInstruction } from './instruction';
import { WebXMouse, WebXKeyboard } from './input';
import { WebXWindowsMessage } from './message';
import { WebXSubImage } from './display';
import { Texture } from 'three';

document.addEventListener('DOMContentLoaded', function(event) {
  const tunnel = new WebXWebSocketTunnel('ws://miro.local:8080', {
    id: 123
  });
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

      // Attach a mouse to the canvas container
      const mouse = new WebXMouse(container);

      mouse.onMouseDown = mouse.onMouseUp = mouse.onMouseMove = mouse.onMouseOut = mouse.onKeyDown = mouseState => {
        const scale = display.getScale();
        mouseState.x = mouseState.x / scale;
        mouseState.y = mouseState.y / scale;
        client.sendInstruction(new WebXMouseInstruction(mouseState.x, mouseState.y, mouseState.getButtonMask()));
      };

      // Attach a keyboard to the canvas container
      const keyboard = new WebXKeyboard(document.body);
      keyboard.onKeyDown = key => {
        client.sendInstruction(new WebXKeyboardInstruction(key, true));
      };

      keyboard.onKeyUp = key => {
        client.sendInstruction(new WebXKeyboardInstruction(key, false));
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

      client.onMouseCursor = (x: number, y: number, name: string, texture: Texture) => {
        display.updateMouseCursor(x, y, name, texture);
      };
    })
    .catch(err => console.error(err));
});
