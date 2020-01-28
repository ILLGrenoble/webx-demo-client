import './styles.scss';
import { WebXDisplay, WebXSubImage } from './display';
import { WebXClient } from './WebXClient';
import { WebXWebSocketTunnel } from './tunnel';
import { WebXWindowsInstruction, WebXInstruction, WebXInstructionType } from './instruction';
import { WebXWindowsMessage, WebXMessage, WebXScreenMessage, WebXMessageType } from './message';
import { Texture } from 'three';
import { WebXInstructionTracer, WebXMessageTracer } from './tracer';
import { WebXMouseState } from './input';
import * as screenfull from 'screenfull';
import { Screenfull } from 'screenfull';
import { WebXCursorInstruction } from './instruction/WebXCursorInstruction';
import { WebXMouseCursorMessage } from './message/WebXMouseCursorMessage';

document.addEventListener('DOMContentLoaded', (event) => {

  const createMessageElement = (type: string, clazz: string, html: string) => {
    const el = document.createElement(type);
    el.classList.add(clazz);
    el.innerHTML = html;
    return el;
  };

  let messages: WebXMessage[] = [];
  let instructions: WebXInstruction[] = [];

  const renderMessage = (message: WebXMessage) => {
    messages.push(message);
    if (messages.length > 25) {
      messages.shift();
    }
    const fragment = document.createDocumentFragment();
    messages.forEach(message => {
      const messageEl = createMessageElement('div', 'events__message', WebXMessageType[message.type]);
      fragment.appendChild(messageEl);
    });
    const el = document.getElementById('messages');
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    el.appendChild(fragment);
    el.scrollTop = el.scrollHeight;
  }

  const renderInstruction = (instruction: WebXInstruction) => {
    instructions.push(instruction);
    if (instructions.length > 25) {
      instructions.shift();
    }
    const fragment = document.createDocumentFragment();
    instructions.forEach(instruction => {
      const messageEl = createMessageElement('div', 'events__message', WebXInstructionType[instruction.type]);
      fragment.appendChild(messageEl);
    });
    const el = document.getElementById('instructions');
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    el.appendChild(fragment);
    el.scrollTop = el.scrollHeight;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tunnel = new WebXWebSocketTunnel(urlParams.get('url') || 'ws://localhost:8080');

  const client = new WebXClient(tunnel, {
    tracers: {
      message: new WebXMessageTracer(renderMessage),
      instruction: new WebXInstructionTracer(renderInstruction)
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

      client.sendRequest(new WebXWindowsInstruction()).then(response => {
        display.updateWindows((response as WebXWindowsMessage).windows);
      });

      const mouse = client.createMouse(container);
      client.sendRequest(new WebXCursorInstruction()).then(response => {
        const mouseCursorMessage = response as WebXMouseCursorMessage;
        display.updateMouseCursor(mouseCursorMessage.x, mouseCursorMessage.y, mouseCursorMessage.xHot, mouseCursorMessage.yHot, mouseCursorMessage.id, mouseCursorMessage.texture);
      });

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

      client.onMouseCursor = (x: number, y: number, xHot: number, yHot: number, id: number, texture: Texture) => {
        display.updateMouseCursor(x, y, xHot, yHot, id, texture);
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
