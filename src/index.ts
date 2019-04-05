import "./styles.css";
import * as THREE from 'three';
import { WebXDisplay } from './display/WebXDisplay';
import { WebXWindow } from './display/WebXWindow';
import { WebXClient } from "./display/WebXClient";
import { WebXWebSocketTunnel } from "./tunnel";
import { WebXCommand } from "./command/WebXCommand";
import { WebXCommandType } from "./command/WebXCommandType";

document.addEventListener("DOMContentLoaded", function (event) {

    const tunnel = new WebXWebSocketTunnel('ws://cauntbookw.ill.fr:8080');
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