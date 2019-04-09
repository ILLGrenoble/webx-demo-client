import "./styles.css";
import { WebXDisplay } from './display/WebXDisplay';
import { WebXClient } from "./WebXClient";
import { WebXWebSocketTunnel } from './tunnel';
import { WebXCommand, WebXCommandType } from './command';
import { WebXMouse, WebXKeyboard } from "./input";
import { WebXWindowsMessage } from "./message";

document.addEventListener("DOMContentLoaded", function (event) {

    const tunnel = new WebXWebSocketTunnel('ws://localhost:8080', {
        id: 123
    });
    const client = new WebXClient(tunnel);

    let display: WebXDisplay;
    client.connect().then(connectionMessage => {
        const { width, height } = connectionMessage.screenSize;

        display = new WebXDisplay(width, height);
        display.animate();

        const container = document.getElementById('canvas-frame');
        container.appendChild(display.renderer.domElement);
        container.style.maxWidth = display.screenWidth + 'px';

        client.sendRequest(new WebXCommand(WebXCommandType.WINDOWS))
            .then(response => {
                display.updateWindows((response as WebXWindowsMessage).windows);
            });

        // Attach a mouse to the canvas container
        const mouse = new WebXMouse(container);

        mouse.onMouseDown = mouse.onMouseUp = mouse.onMouseMove = mouse.onMouseOut = (mouseState => {
            const scale = display.getScale();
            mouseState.x = mouseState.x / scale;
            mouseState.y = mouseState.y / scale;
            console.log(JSON.stringify(mouseState));
        });

        // Attach a keyboard to the canvas container
        const keyboard = new WebXKeyboard(document.body)
        keyboard.onKeyDown = (key => {
            console.log('On keydown', JSON.stringify(key));
        });

    }).catch(err => console.error(err));

    client.onWindows = (windows) => {
        display.updateWindows(windows);
    }

    client.onImage = (windowId, texture) => {
        display.updateImage(windowId, texture);
    }

});