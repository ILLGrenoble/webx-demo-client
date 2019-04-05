import "./styles.css";
import * as THREE from 'three';
import {WebXDisplay} from './display/WebXDisplay';
import {WebXWindow} from './display/WebXWindow';

document.addEventListener("DOMContentLoaded", function (event) {
    const display: WebXDisplay = new WebXDisplay(1024, 768);
    document.body.appendChild(display.renderer.domElement);

    const window: WebXWindow = new WebXWindow({
        id: 0, 
        x: 100, 
        y: 100, 
        width: 400, 
        height: 200});
    display.addWindow(window);

    const window2: WebXWindow = new WebXWindow({
        id: 1, 
        x: 300, 
        y: 250, 
        width: 300, 
        height: 300});
    display.addWindow(window2);

    display.animate();
});