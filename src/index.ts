import './styles.scss';
import { WebXDisplay, WebXSubImage } from './display';
import { WebXClient } from './WebXClient';
import { WebXWebSocketTunnel } from './tunnel';
import { WebXWindowsInstruction, WebXInstruction, WebXInstructionType } from './instruction';
import { WebXWindowsMessage, WebXMessage, WebXScreenMessage, WebXMessageType } from './message';
import { Texture } from 'three';
import { WebXInstructionTracer, WebXMessageTracer } from './tracer';
import { WebXMouseState } from './input';

document.addEventListener('DOMContentLoaded', (event) => {

  const createMessageElement = (type: string, clazz: string, content: string) => {
    const el = document.createElement(type);
    el.classList.add(clazz);
    el.innerHTML = content;
    return el;
  };

  const renderMessage = async (message: WebXMessage) => {
    const el = document.getElementById("messages");
    if(el.childElementCount >= 50) {
      el.removeChild(el.childNodes[0])
    }
    const messageEl = createMessageElement('div', 'events__message', WebXMessageType[message.type]);
    el.appendChild(messageEl);
    el.scrollTop = el.scrollHeight;
  }

  const renderInstruction = async (instruction: WebXInstruction) => {
    const el = document.getElementById("instructions");
    if(el.childElementCount >= 50) {
      el.removeChild(el.childNodes[0])
    }
    const messageEl = createMessageElement('div', 'events__message', WebXInstructionType[instruction.type]);
    el.appendChild(messageEl);
    el.scrollTop = el.scrollHeight;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tunnel = new WebXWebSocketTunnel(urlParams.get('url') || 'ws://localhost:8080');

  const client = new WebXClient(tunnel, {
    tracers: {
      message: new WebXMessageTracer(renderMessage),
      instruction: new WebXInstructionTracer((instruction: WebXInstruction) => renderInstruction(instruction))
    }
  });

  let display: WebXDisplay;
  client
    .connect()
    .then((screenMessage: WebXScreenMessage) => {
      const { width, height } = screenMessage.screenSize;

      display = new WebXDisplay(width, height);
      display.animate();

      const container = document.getElementById('display-container');
      container.appendChild(display.renderer.domElement);
      container.style.maxWidth = display.screenWidth + 'px';

      client.sendRequest(new WebXWindowsInstruction()).then(response => {
        display.updateWindows((response as WebXWindowsMessage).windows);
      });

      const mouse = client.createMouse(container);

      mouse.onMouseDown = mouse.onMouseUp = mouse.onMouseMove = mouse.onMouseOut = (mouseState: WebXMouseState) => {
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
