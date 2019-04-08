import { WebXTunnel } from "../tunnel";
import { WebXCommand, WebXCommandType } from "../command";
import { Texture } from "three";
import { WebXImageMessage } from "../message";

export class WebXTextureFactory {

    private static _instance: WebXTextureFactory;

    private constructor(private _tunnel: WebXTunnel) {
    }

    public static initInstance(tunnel: WebXTunnel): WebXTextureFactory {
        if (WebXTextureFactory._instance == null) {
            WebXTextureFactory._instance = new WebXTextureFactory(tunnel);
        }
        return WebXTextureFactory._instance;
    }

    public static instance(): WebXTextureFactory {
        return WebXTextureFactory._instance;
    }

    public getTexture(windowId: number): Promise<Texture> {
        const promise: Promise<Texture> = new Promise<Texture>((resolve, reject) => {
            return this._tunnel.sendRequest(new WebXCommand(WebXCommandType.IMAGE, windowId))
                .then((response: WebXImageMessage) => {
                    resolve(response.texture)
                })
        });

        return promise;
    }
    
}