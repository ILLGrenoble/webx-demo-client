import * as THREE from 'three';
import {WebXWindow} from './WebXWindow';
import { Vector3 } from 'three';
import { WebXWindowProperties } from './WebXWindowProperties';

export class WebXDisplay {
    private _scene: THREE.Scene;
    private _camera: THREE.OrthographicCamera;
    private _renderer: THREE.WebGLRenderer;

    private _screenWidth = 10;
    private _screenHeight = 10;

    private _windows: WebXWindow[] = [];

    public get renderer(): THREE.WebGLRenderer {
        return this._renderer;
    }

    public get screenWidth(): number {
        return this._screenWidth;
    }

    public get screenHeight(): number {
        return this._screenHeight;
    }

    constructor(screenWidth: number, screenHeight: number) {
        this._screenWidth = screenWidth;
        this._screenHeight = screenHeight;

        this._scene = new THREE.Scene();
        // this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 100);
        this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 10000);
        this._camera.position.z = 10;
        this._camera.lookAt(new Vector3(0, 0 ,0));

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(screenWidth, screenHeight, false);
    }

    animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        this._renderer.render(this._scene, this._camera);
    }

    addWindow(window: WebXWindow): void {
        if (this._windows.find(existingWindow => existingWindow.id === window.id) == null) {
            // console.log("Adding window ", window.id)
            this._windows.push(window);
            this._scene.add(window.mesh);
        }
    }

    removeWindow(window: WebXWindow): void {
        if (this._windows.find(existingWindow => existingWindow.id === window.id) != null) {
            // console.log("Removing window ", window.id)
            this._windows = this._windows.filter(existingWindow => existingWindow.id !== window.id);
            this._scene.remove(window.mesh);
        }
    }

    updateWindows(windows: Array<WebXWindowProperties>): void {
        // Get windows to remove
        const deadWindows = this._windows.filter(existingWindow => windows.find(window => window.id === existingWindow.id) == null);

        // Remove windows that no longer exist
        deadWindows.forEach(deadWindow => this.removeWindow(deadWindow));

        // Update and add windows
        windows.forEach((window, index) => {
            let webXWindow = this.getWindow(window.id);
            if (webXWindow == null) {
                // Add a new window
                webXWindow = new WebXWindow({
                    id: window.id, 
                    x: window.x, 
                    y: window.y,
                    z: index,
                    width: window.width, 
                    height: window.height}); 

                this.addWindow(webXWindow);

            } else {
                // Update window
                webXWindow.setRectangle(window.x, window.y, index, window.width, window.height);
            }
        });
    }

    getWindow(id: number): WebXWindow {
        return this._windows.find(window => window.id === id);
    }

}