import * as THREE from 'three';
import {WebXWindow} from './WebXWindow';
import { Vector3 } from 'three';

export class WebXDisplay {
    private _scene: THREE.Scene;
    private _camera: THREE.OrthographicCamera;
    private _renderer: THREE.WebGLRenderer;

    private _windowGeometry: THREE.Geometry;

    private _windows: WebXWindow[] = [];

    public get renderer(): THREE.WebGLRenderer {
        return this._renderer;
    }

    constructor(screenWidth: number, screenHeight: number) {
        this._scene = new THREE.Scene();
        // this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 100);
        this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 10000);
        this._camera.position.z = 10;
        this._camera.lookAt(new Vector3(0, 0 ,0));

        this._windowGeometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(screenWidth, screenHeight);
    }

    animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        this._renderer.render(this._scene, this._camera);
    }

    addWindow(window: WebXWindow): void {
        if (this._windows.find(existingWindow => existingWindow.id === window.id) == null) {
            this._windows.push(window);
            this._scene.add(window.mesh);
        }
    }

    removeWindow(window: WebXWindow): void {
        if (this._windows.find(existingWindow => existingWindow.id === window.id) != null) {
            this._windows = this._windows.filter(existingWindow => existingWindow.id !== window.id);
            this._scene.remove(window.mesh);
        }
    }

    updateWindows(windows: [{id: number, x: number, y: number, width: number, height: number}]): void {
        windows.forEach(window => {
            let webXWindow = this.getWindow(window.id);
            if (webXWindow == null) {
               webXWindow = new WebXWindow({
                id: window.id, 
                x: window.x, 
                y: window.y, 
                width: window.width, 
                height: window.height}); 

                this.addWindow(webXWindow);

            } else {
                webXWindow.setRectangle(window.x, window.y, window.width, window.height);
            }
        });

        // TODO the order of windows changes

        // TODO Delete any windows that no longer exist
    }

    getWindow(id: number): WebXWindow {
        return this._windows.find(window => window.id === id);
    }

}