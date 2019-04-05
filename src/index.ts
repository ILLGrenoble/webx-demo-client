import "./styles.css";
import * as THREE from 'three';
import { WebXDisplay } from './display/WebXDisplay';
import { WebXClient } from "./WebXClient";
import { WebXWebSocketTunnel } from './tunnel';
import { WebXCommand, WebXCommandType } from './command';
import { WebXMouse } from "./input";

document.addEventListener("DOMContentLoaded", function (event) {

    const tunnel = new WebXWebSocketTunnel('ws://localhost:8080', {
        id: 123
    });
    const client = new WebXClient(tunnel);

    let display: WebXDisplay;
    client.connect()
        .then(data => {
            client.sendCommand(new WebXCommand(WebXCommandType.CONNECT));
        })
        .catch(error => console.error('Error: ', error))

    client.onMessage = (message) => {
        if (message.type === 'Connection') {
            const { width, height } = message.screenSize;

            display = new WebXDisplay(width, height);
            display.animate();
            client.sendCommand(new WebXCommand(WebXCommandType.WINDOWS));
            const container = document.getElementById('canvas-frame');
            container.appendChild(display.renderer.domElement);
            container.style.maxWidth = display.screenWidth + 'px';

            // Attach a mouse to the canvas container
            const mouse = new WebXMouse(container);

            mouse.handleMouseDown = mouse.handleMouseUp = mouse.handleMouseMove = (mouseState => {
                console.log('Mouse event', mouseState);
                // just as a reminder
                // get the current mouse state and scale of the display
                // calculate the scaled state
                // send it to the client client.sendMouseState(scaledState)
            });

        } else {
            display.updateWindows(message.windows.map((window: { id: number; rectangle: { x: number; y: number; width: number; height: number; }; }) => {
                return {
                    id: window.id,
                    x: window.rectangle.x,
                    y: window.rectangle.y,
                    width: window.rectangle.width,
                    height: window.rectangle.height
                };
            }));
        }
    }

});