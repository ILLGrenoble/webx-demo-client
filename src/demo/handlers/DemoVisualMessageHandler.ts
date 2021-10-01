import {WebXTracerHandler} from "../../tracer/WebXTracerHandler";
import {WebXImageMessage, WebXMessage, WebXMessageType, WebXSubImagesMessage} from "../../message";
import {WebXDisplay} from "../../display";
import * as THREE from "three";
import {Object3D, Scene} from "three";
import {WebXColourGenerator} from "../../utils";
import * as TWEEN from "@tweenjs/tween.js";

export class DemoVisualMessageHandler implements WebXTracerHandler<WebXMessage> {

  private _scene: Scene;
  private _debugLayer: Object3D = new Object3D();
  private _currentZ = 0;

  constructor(private _display: WebXDisplay) {

    this._debugLayer.position.set(0, 0, 999);

    this._scene = this._display.scene;
    this._scene.add(this._debugLayer);
  }

  handle(message: WebXMessage): void {
    if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      const window = this._display.getWindow(imageMessage.windowId);
      const {width, height} = imageMessage.texture.image;

      this._createMesh(window.x, window.y, width, height);

    } else if (message.type === WebXMessageType.SUBIMAGES) {
      const subImageMessage = message as WebXSubImagesMessage;
      const window = this._display.getWindow(subImageMessage.windowId);

      subImageMessage.subImages.forEach(subImage => {
        this._createMesh(window.x + subImage.x, window.y + subImage.y, subImage.width, subImage.height);
      });
    }
  }

  private _createMesh(x: number, y: number, width: number, height: number): void {
    const colour = WebXColourGenerator.randomColour();

    const material = new THREE.MeshBasicMaterial({color: colour, opacity: 0.8, transparent: true});
    material.side = THREE.BackSide;

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 2, 2), material);
    mesh.position.set(x + width / 2, y + height / 2, this._currentZ);
    this._currentZ += 0.0001;
    this._debugLayer.add(mesh);

    const tween = new TWEEN.Tween(material)
      .to({opacity: 0.0}, 400)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => this._debugLayer.remove(mesh))
      .start();
  }

}
