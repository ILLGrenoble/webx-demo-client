
export class BinaryBuffer {

    private _messageTypeId: number;
    private _messageId: number;
    private _bufferLength: number;

    private _readOffset: number = 16;
    private _writeOffset: number = 16;

    private _encoder: TextDecoder = new TextDecoder("utf-8");


    public get messageTypeId(): number {
        return this._messageTypeId;
    }

    constructor(private _buffer: ArrayBuffer) {
        this._readOffset = 0;
        this._messageTypeId = this.getUint32();
        this._messageId = this.getUint32();
        this._bufferLength = this.getUint32();
        this._readOffset = 16;
    }

    public getInt32(): number {
        const offset = this.getNextReadOffset(4);

        var typedArray = new Int32Array(this._buffer, offset, 1);

        return typedArray[0];
    }

    public getUint32(): number {
        const offset = this.getNextReadOffset(4);

        var typedArray = new Uint32Array(this._buffer, offset, 1);

        return typedArray[0];
    }

    public getUint8Array(length: number): Uint8Array {
        var typedArray = new Uint8Array(this._buffer, this._readOffset, length);
        this._readOffset += length;

        return typedArray;
    }

    public getString(length: number) {
        var array = new Uint8Array(this._buffer, this._readOffset, length);
        this._readOffset += length;
        return this._encoder.decode(array);
    }

    private getNextWriteOffset(sizeOfData: number): number {
        // Ensure alignment
        const padding = (this._writeOffset % sizeOfData) > 0 ? sizeOfData - (this._writeOffset % sizeOfData) : 0;
        const position = this._writeOffset + padding;

        this._writeOffset += sizeOfData + padding;

        return position;
    }

    private getNextReadOffset(sizeOfData: number): number {
        // Ensure alignment
        const padding = (this._readOffset % sizeOfData) > 0 ? sizeOfData - (this._readOffset % sizeOfData) : 0;
        const position = this._readOffset + padding;

        this._readOffset += sizeOfData + padding;

        return position;
    }
}