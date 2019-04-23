import { WebXInstructionType } from "./WebXInstructionType";

export class WebXInstruction {

    private static INSTRUCTION_COUNTER = 0;
    private _id: number;

    public get id(): number {
        return this._id;
    }

    public get type(): WebXInstructionType {
        return this._type;
    }


    constructor(private _type: WebXInstructionType) {
        this._id = WebXInstruction.INSTRUCTION_COUNTER++;
    }

    toJsonString(): string {
        let json = JSON.stringify(this);
        Object.keys(this).filter(key => key[0] === "_").forEach(key => {
            json = json.replace(key, key.substring(1));
        });

        return json;
    }
}