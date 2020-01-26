import * as THREE from 'three';
import { Texture, LinearFilter } from 'three';

export class WebXCursor {
  private static _PLANE_GEOMETRY: THREE.Geometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);

  private _id: number;
  private _texture: THREE.Texture;
  private _material: THREE.MeshBasicMaterial;
  private _mesh: THREE.Mesh;

  private _x: number;
  private _y: number;
  private _xHot: number = 0;
  private _yHot: number = 0;
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

  public set x(value: number) {
    this._x = value;
    this._updatePosition();
  }

  public set y(value: number) {
    this._y = value;
    this._updatePosition();
  }

  constructor() {
    this._material = new THREE.MeshBasicMaterial({ transparent: true });
    this._material.side = THREE.BackSide;
    this._material.transparent = true;
    // this._material.visible = false;

    this._mesh = new THREE.Mesh(WebXCursor._PLANE_GEOMETRY, this._material);

    this._x = 0;
    this._y = 0;
    this._xHot = 0;
    this._yHot = 0;
    this._width = 16;
    this._height = 20;
    this._updateScale();
    this._updatePosition();
  }


  public setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;

    this._updatePosition();
  }

  public update(x: number, y: number, xHot: number, yHot: number, id: number, texture: Texture): void {
    this._x = x;
    this._y = y;
    this._xHot = xHot;
    this._yHot = yHot;
    this._id = id;

    if (texture != null && texture.image != null) {
      this._width = texture.image.width;
      this._height = texture.image.height;

      // TODO Dispose of previous texture?
      this._texture = texture;

      this._texture.minFilter = LinearFilter;
      this._texture.repeat.set(this._width / this._texture.image.width, this._height / this._texture.image.height);

      this._material.map = texture;
      this._material.visible = true;
      this._material.needsUpdate = true;
    }

    this._updateScale();
    this._updatePosition();
  }

  private _updateScale(): void {
    this._mesh.scale.set(this._width, this._height, 1);
  }

  private _updatePosition(): void {
    this._mesh.position.set(this._x - this._xHot + 0.5 * this._width, this._y - this._yHot + 0.5 * this._height, 999);
  }
}
