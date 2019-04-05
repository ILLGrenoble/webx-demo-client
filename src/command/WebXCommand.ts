import { WebXCommandType } from "./WebXCommandType";

export class WebXCommand {

    constructor(private type: WebXCommandType) {

    }

    toJson() {
        return JSON.stringify({
            type: this.type
        });
    }
}