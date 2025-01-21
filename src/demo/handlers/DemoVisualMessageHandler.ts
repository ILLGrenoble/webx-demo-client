import {
  WebXDisplay,
  WebXHandler,
  WebXImageMessage,
  WebXMessage,
  WebXMessageHandler,
  WebXMessageType,
  WebXSubImagesMessage
} from '@illgrenoble/webx-client';
import * as THREE from 'three';
import { Object3D, Scene } from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import {ColorGenerator} from "../utils";

export class DemoVisualMessageHandler extends WebXMessageHandler implements WebXHandler {

  private static _PLANE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);

  private _scene: Scene;
  private _debugLayer: Object3D = new Object3D();
  private _currentZ = 0;

  constructor(private _display: WebXDisplay) {
    super();
    this._debugLayer.position.set(0, 0, 999);
    this._scene = this._display.scene;
    this._scene.add(this._debugLayer);
  }


  private _createMesh(x: number, y: number, width: number, height: number, colour: string): void {
    const material = new THREE.MeshBasicMaterial({ color: colour, opacity: 0.8, transparent: true });
    material.side = THREE.BackSide;

    const mesh = new THREE.Mesh(DemoVisualMessageHandler._PLANE_GEOMETRY, material);
    mesh.position.set(x + width / 2, y + height / 2, this._currentZ);
    mesh.scale.set(width, height, 1);
    this._currentZ += 0.0001;
    this._debugLayer.add(mesh);

    new TWEEN.Tween(material)
      .to({ opacity: 0.0 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => this._debugLayer.remove(mesh))
      .start();
  }

  handle(message: WebXMessage): void {

    if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      const window = this._display.getWindow(imageMessage.windowId);
      const { width, height } = imageMessage.colorMap.image;

      this._createMesh(window.x, window.y, width, height, ColorGenerator.indexedColour(window.colorIndex));

    } else if (message.type === WebXMessageType.SUBIMAGES) {
      const subImageMessage = message as WebXSubImagesMessage;
      const window = this._display.getWindow(subImageMessage.windowId);

      subImageMessage.subImages.forEach(subImage => {
        this._createMesh(window.x + subImage.x, window.y + subImage.y, subImage.width, subImage.height, ColorGenerator.indexedColour(window.colorIndex));
      });
    }
  }

  destroy(): void {
    // do nothing
  }

}
