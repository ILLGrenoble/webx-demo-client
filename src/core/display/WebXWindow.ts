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

  public get visible(): boolean {
    return this._material.visible;
  }

  public get colorMap(): Texture {
    return this._material.map;
  }

  private set colorMap(colorMap: Texture) {
    this._material.map = colorMap;
  }

  get alphaMap(): Texture {
    return this._material.alphaMap;
  }

  private set alphaMap(alphaMap: Texture) {
    this._material.alphaMap = alphaMap;
  }

  public get colorMapValid(): boolean {
    return this.colorMap != null && this.colorMap.image.width === this._width && this.colorMap.image.height === this._height;
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

    if (this.colorMap) {
      this.colorMap.repeat.set(this._width / this.colorMap.image.width, this._height / this.colorMap.image.height);

      if (this.alphaMap) {
        this.alphaMap.repeat.set(this._width / this.alphaMap.image.width, this._height / this.alphaMap.image.height);
      }

      // Force reload of image of dimensions differ
      if (this.colorMap.image.width !== this._width || this.colorMap.image.height !== this._height) {
        WebXTextureFactory.instance().getWindowTexture(this._id).then(response => {
          this.updateTexture(response.depth, response.colorMap, response.alphaMap);
        });
      }
    }

    this._updateScale();
    this._updatePosition();
  }

  public updateTexture(depth: number, colorMap: Texture, alphaMap: Texture): void {
    this._depth = depth;

    // Dispose of previous texture
    this._disposeColorMap();
    this.colorMap = colorMap;

    if (colorMap) {
      colorMap.minFilter = LinearFilter;
      this.colorMap.repeat.set(this._width / this.colorMap.image.width, this._height / this.colorMap.image.height);
      this._material.visible = true;
      this._material.needsUpdate = true;
    }

    // Only update alpha if it has been sent
    if (alphaMap) {
      this._disposeAlphaMap();
      this.alphaMap = alphaMap;
      this.alphaMap.minFilter = LinearFilter;
      this.alphaMap.repeat.set(this._width / this.alphaMap.image.width, this._height / this.alphaMap.image.height);
      this._material.needsUpdate = true;

    } else if (depth == 24) {
      this._disposeAlphaMap();
    }

    this._material.transparent = (this.alphaMap != null || depth === 32);
  }

  private _updateScale(): void {
    this._mesh.scale.set(this._width, this._height, 1);
  }

  private _updatePosition(): void {
    this._mesh.position.set(this._x + 0.5 * this._width, this._y + 0.5 * this._height, this._z);
  }

  private _disposeColorMap(): void {
    if (this.colorMap) {
      this.colorMap.dispose();
      this.colorMap = null;
    }
  }

  private _disposeAlphaMap(): void {
    if (this.alphaMap) {
      this.alphaMap.dispose();
      this.alphaMap = null;
    }
  }
}