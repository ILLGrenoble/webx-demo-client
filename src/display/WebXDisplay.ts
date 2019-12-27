import * as THREE from 'three';
import { Texture } from 'three';
import { Vector3 } from 'three';
import { WebXWindow } from './WebXWindow';
import { WebXWindowProperties } from './WebXWindowProperties';
import { WebXSubImage } from './WebXSubImage';
import { WebXWebGLRenderer } from '../utils/WebXWebGLRenderer';

export class WebXDisplay {
  private _scene: THREE.Scene;
  private _camera: THREE.OrthographicCamera;
  private _renderer: WebXWebGLRenderer;

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
    this._camera.lookAt(new Vector3(0, 0, 0));

    this._renderer = new THREE.WebGLRenderer() as WebXWebGLRenderer;
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
          height: window.height
        });

        this.addWindow(webXWindow);

      } else {
        // Update window
        webXWindow.setRectangle(window.x, window.y, index, window.width, window.height);
      }
    });
  }

  updateImage(windowId: number, depth: number, texture: Texture): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && texture != null) {
      window.updateTexture(depth, texture);
    }
  }

  updateSubImages(windowId: number, subImages: WebXSubImage[]): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null) {
      const windowTexture = window.texture;
      if (windowTexture != null) {
        subImages.forEach(subImage => {
          this._renderer.copyTextureToTexture(new THREE.Vector2(subImage.x, subImage.y), subImage.texture, windowTexture);
        });
        window.updateTexture(window.depth, windowTexture);
      }
    }
  }

  /**
   * Update the mouse cursor
   * @param x the x coordinate
   * @param y the y coordinate
   * @param image the cursor image
   */
  updateMouseCursor(x: number, y: number, image: Texture) {
    // Add the image cursor to the canvas...
  }

  getWindow(id: number): WebXWindow {
    return this._windows.find(window => window.id === id);
  }

  getScale(): number {
    const scale = (1.0 * this._renderer.domElement.offsetWidth) / this._screenWidth;
    return scale;
  }
}
