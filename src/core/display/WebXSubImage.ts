import { Texture } from 'three';

export class WebXSubImage {
  public x: number;
  public y: number;
  public width: number = 1;
  public height: number = 1;
  public depth: number = 32;
  public texture: Texture;
  public alphaTexture: Texture;

  constructor(configuration: { x: number; y: number; width: number; height: number; depth: number; texture: Texture, alphaTexture: Texture }) {
    const { x, y, width, height, depth, texture } = configuration;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.texture = texture;
    this.alphaTexture = texture;
  }
}
