import * as THREE from 'three';
import { WebXTextureFactory } from './WebXTextureFactory';
import { Texture, LinearFilter } from 'three';
import {APP_CONFIG} from '../utils';

export class WebXWindow {
  private static _PLANE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);
  private static _COLOR_INDEX = 0;

  private readonly _colorIndex: number;
  private readonly _id: number;
  private readonly _material: THREE.MeshBasicMaterial;
  private readonly _mesh: THREE.Mesh;
  private _colorMap: THREE.Texture;
  private _alphaMap: THREE.Texture;
  private _depth: number;

  private _x: number;
  private _y: number;
  private _z: number;
  private _width: number = 1;
  private _height: number = 1;

  public get mesh(): THREE.Mesh {
    return this._mesh;
  }

  get colorIndex(): number {
    return this._colorIndex;
  }

  public get id(): number {
    return this._id;
  }

  public get colorMap(): Texture {
    return this._colorMap;
  }

  get alphaMap(): Texture {
    return this._alphaMap;
  }

  public get colorMapValid(): boolean {
    return this._colorMap != null && this._colorMap.image.width === this._width && this._colorMap.image.height === this._height;
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
      this.updateTexture(response.depth, response.colorMap, response.alphaMap);
    });
  }

  public setRectangle(x: number, y: number, z: number, width: number, height: number): void {
    this._x = x;
    this._y = y;
    this._z = z;
    this._width = width;
    this._height = height;

    if (this._colorMap) {
      this._colorMap.repeat.set(this._width / this._colorMap.image.width, this._height / this._colorMap.image.height);

      if (this._alphaMap) {
        this._alphaMap.repeat.set(this._width / this._alphaMap.image.width, this._height / this._alphaMap.image.height);
      }

      // Force reload of image of dimensions differ
      if (this._colorMap.image.width !== this._width || this._colorMap.image.height !== this._height) {
        WebXTextureFactory.instance().getWindowTexture(this._id).then(response => {
          this.updateTexture(response.depth, response.colorMap, response.alphaMap);
        });
      }
    }

    this._updateScale();
    this._updatePosition();
  }

  public updateTexture(depth: number, colorMap: Texture, alphaMap: Texture): void {
    // TODO Dispose of previous textures?
    this._depth = depth;
    this._colorMap = colorMap;
    this._material.map = colorMap;

    if (this._colorMap) {
      this._colorMap.minFilter = LinearFilter;
      this._colorMap.repeat.set(this._width / this._colorMap.image.width, this._height / this._colorMap.image.height);
      this._material.visible = true;
      this._material.needsUpdate = true;
    }

    // Only update alpha if it has been sent
    if (alphaMap) {
      this._alphaMap = alphaMap;
      this._material.alphaMap = alphaMap;
      this._alphaMap.minFilter = LinearFilter;
      this._alphaMap.repeat.set(this._width / this._alphaMap.image.width, this._height / this._alphaMap.image.height);
      this._material.needsUpdate = true;
    }

    this._material.transparent = (this._alphaMap != null || depth === 32);
  }

  private _updateScale(): void {
    this._mesh.scale.set(this._width, this._height, 1);
  }

  private _updatePosition(): void {
    this._mesh.position.set(this._x + 0.5 * this._width, this._y + 0.5 * this._height, this._z);
  }
}
