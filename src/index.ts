import "./styles.css";
import * as THREE from 'three';
import {WebXDisplay} from './display/WebXDisplay';
import {WebXWindow} from './display/WebXWindow';

document.addEventListener("DOMContentLoaded", function (event) {
    const display: WebXDisplay = new WebXDisplay(1024, 768);
    document.body.appendChild(display.renderer.domElement);

    display.updateWindows([{
        id: 0, 
        x: 100, 
        y: 100, 
        width: 400, 
        height: 200
    }, {
        id: 1, 
        x: 300, 
        y: 250, 
        width: 300, 
        height: 300
    }]);

    setTimeout(() => {
        display.updateWindows([{
            id: 2, 
            x: 250, 
            y: 200, 
            width: 400, 
            height: 500
        }, {
            id: 1, 
            x: 400, 
            y: 250, 
            width: 300, 
            height: 300
        }]);
        setTimeout(() => {
            display.updateWindows([{
                id: 1, 
                x: 400, 
                y: 250, 
                width: 300, 
                height: 300
            }, {
                id: 2, 
                x: 250, 
                y: 200, 
                width: 400, 
                height: 500
            }]);
        }, 1000);
    }, 1000);


    display.animate();
});