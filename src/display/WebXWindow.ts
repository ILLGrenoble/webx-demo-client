import * as THREE from 'three';
import { WebXTextureFactory } from './WebXTextureFactory';
import { MeshBasicMaterial, Texture } from 'three';

export class WebXWindow {

    private static _colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
          '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
          

    private static COLOR_INDEX = 0;
    private _colorIndex: number;
    private _id: number;
    private _geometry: THREE.Geometry;
    private _texture: THREE.Texture;
    private _material: THREE.MeshBasicMaterial;
    private _mesh: THREE.Mesh;

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

    public set x(value: number) {
        this._x = value;
        this.updatePosition();
    }

    public set y(value: number) {
        this._y = value;
        this.updatePosition();
    }

    public set z(value: number) {
        this._z = value;
        this.updatePosition();
    }

    public set width(value: number) {
        this._width = value;
        this.updateScale();
        this.updatePosition();
    }

    public set height(value: number) {
        this._height = value;
        this.updateScale();
        this.updatePosition();
    }

    private static PLANE_GEOMETRY: THREE.Geometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);

    constructor(configuration: {id: number, x: number, y: number, width: number, z: number, height: number}) {
        this._colorIndex = WebXWindow.COLOR_INDEX++;
        if (this._colorIndex == WebXWindow._colorArray.length) {
            WebXWindow.COLOR_INDEX = 0;
        }

        // this._material = new THREE.MeshBasicMaterial( { color: WebXWindow._colorArray[this._colorIndex] } );
        this._material = new THREE.MeshBasicMaterial( {transparent: true} );
        this._material.side = THREE.BackSide;

        const {id, x, y, z, width, height} = configuration;
        this._id = id;
        this._mesh = new THREE.Mesh(WebXWindow.PLANE_GEOMETRY, this._material);

        this._x = x;
        this._y = y;
        this._z = z;
        this._width = width;
        this._height = height;
        this.updateScale();
        this.updatePosition();

        WebXTextureFactory.instance().getTexture(this._id).then(texture => this.updateTexture(texture));
    }

    public setRectangle(x: number, y: number, z: number, width: number, height: number): void {
        this._x = x;
        this._y = y;
        this._z = z;
        this._width = width;
        this._height = height;
        
        this.updateScale();
        this.updatePosition();
    }

    public updateTexture(texture: Texture): void {
        // TODO Dispose of previous texture?
        this._material.map = texture;
        this._material.needsUpdate = true;
        this._mesh.material = this._material;
    }

    private updateScale(): void {
        this._mesh.scale.set(this._width, this._height, 1);
    }

    private updatePosition(): void {
        this._mesh.position.set(this._x + 0.5 * this._width, this._y + 0.5* this._height, this._z);
    }
}