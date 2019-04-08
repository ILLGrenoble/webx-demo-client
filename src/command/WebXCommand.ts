import { WebXCommandType } from "./WebXCommandType";

export class WebXCommand {

    private static COMMAND_COUNTER = 0;
    private _id: number;

    public get id(): number {
        return this._id;
    }

    public get type(): WebXCommandType {
        return this._type;
    }

    public get numericPayload(): number {
        return this._numericPayload;
    }

    constructor(private _type: WebXCommandType, private _numericPayload?: number) {
        this._id = WebXCommand.COMMAND_COUNTER++;
    }
}