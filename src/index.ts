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
    client.connect().then(configuration => {
        const {width, height} = configuration.screenSize;

        display = new WebXDisplay(width, height);
        display.animate();

        const container = document.getElementById('canvas-frame');
        container.appendChild(display.renderer.domElement);
        container.style.maxWidth = display.screenWidth + 'px';

        client.sendRequest(new WebXCommand(WebXCommandType.WINDOWS))
            .then(response => {
                display.updateWindows(response.windows);
            });

        // Attach a mouse to the canvas container
        const mouse = new WebXMouse(container);

        mouse.handleMouseDown = mouse.handleMouseUp = mouse.handleMouseMove = (mouseState => {
            console.log('Mouse event', mouseState);
            // just as a reminder
            // get the current mouse state and scale of the display
            // calculate the scaled state
            // send it to the client client.sendMouseState(scaledState)
        });
    })

    client.onWindows = (windows) => {
        display.updateWindows(windows);
    }

});