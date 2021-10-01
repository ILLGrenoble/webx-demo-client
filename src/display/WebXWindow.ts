import * as THREE from 'three';
import { WebXTextureFactory } from './WebXTextureFactory';
import { Texture, LinearFilter } from 'three';
import {APP_CONFIG, WebXColourGenerator} from '../utils';

export class WebXWindow {
  private static _PLANE_GEOMETRY: THREE.Geometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);
  private static _COLOR_INDEX = 0;

  private _colorIndex: number;
  private _id: number;
  private _texture: THREE.Texture;
  private _material: THREE.MeshBasicMaterial;
  private _mesh: THREE.Mesh;
  private _depth: number;

  private _x: number;
  private _y: number;
  private _z: number;
  private _width: number = 1;
  private _height: number = 1;

  public get mesh(): THREE.Mesh {
    return this._mesh;
  }

  public get id(): number {
    return this._id;
  }

  public get texture(): Texture {
    return this._texture;
  }

  public get textureValid(): boolean {
    return this._texture != null && this._texture.image.width === this._width && this._texture.image.height === this._height;
  }

  public get depth(): number {
    return this._depth;
  }

  get x(): number {
    return this._x;
  }

  public set x(value: number) {
    this._x = value;
    this._updatePosition();
  }

  get y(): number {
    return this._y;
  }

  public set y(value: number) {
    this._y = value;
    this._updatePosition();
  }

  get z(): number {
    return this._z;
  }

  public set z(value: number) {
    this._z = value;
    this._updatePosition();
  }

  get width(): number {
    return this._width;
  }

  public set width(value: number) {
    this._width = value;
    this._updateScale();
    this._updatePosition();
  }

  get height(): number {
    return this._height;
  }

  public set height(value: number) {
    this._height = value;
    this._updateScale();
    this._updatePosition();
  }


  constructor(configuration: { id: number; x: number; y: number; z: number; width: number; height: number }) {
    this._colorIndex = WebXWindow._COLOR_INDEX++;

    // this._material = new THREE.MeshBasicMaterial( { color: WebXColourGenerator.indexedColour(this._colorIndex) } );
    this._material = new THREE.MeshBasicMaterial({ transparent: true });
    this._material.side = THREE.BackSide;
    this._material.visible = APP_CONFIG().showWindowsBeforeImage;

    const { id, x, y, z, width, height } = configuration;
    this._id = id;
    this._mesh = new THREE.Mesh(WebXWindow._PLANE_GEOMETRY, this._material);

    this._x = x;
    this._y = y;
    this._z = z;
    this._width = width;
    this._height = height;
    this._updateScale();
    this._updatePosition();

    WebXTextureFactory.instance().getWindowTexture(this._id).then(response => {
      this.updateTexture(response.depth, response.texture);
    });
  }

  public setRectangle(x: number, y: number, z: number, width: number, height: number): void {
    this._x = x;
    this._y = y;
    this._z = z;
    this._width = width;
    this._height = height;

    if (this._texture) {
      this._texture.repeat.set(this._width / this._texture.image.width, this._height / this._texture.image.height);
      if (this._texture.image.width !== this._width || this._texture.image.height !== this._height) {
        WebXTextureFactory.instance().getWindowTexture(this._id).then(response => {
          this.updateTexture(response.depth, response.texture);
        });
      }
    }

    this._updateScale();
    this._updatePosition();
  }

  public updateTexture(depth: number, texture: Texture): void {
    if (texture != null) {
      // TODO Dispose of previous texture?
      this._depth = depth;
      this._texture = texture;

      this._texture.minFilter = LinearFilter;
      this._texture.repeat.set(this._width / this._texture.image.width, this._height / this._texture.image.height);

      this._material.transparent = depth === 32;
      this._material.map = texture;
      this._material.visible = true;
      this._material.needsUpdate = true;
      // this._mesh.material = this._material;
    }
  }

  private _updateScale(): void {
    this._mesh.scale.set(this._width, this._height, 1);
  }

  private _updatePosition(): void {
    this._mesh.position.set(this._x + 0.5 * this._width, this._y + 0.5 * this._height, this._z);
  }
}
