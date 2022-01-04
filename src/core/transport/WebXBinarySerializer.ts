import { WebXInstruction } from '../instruction';
import { WebXMessage } from '../message';
import { WebXInstructionEncoder, WebXMessageBuffer, WebXMessageDecoder } from '.';
import { WebXTextureFactory } from '../display';

export class WebXBinarySerializer {

  private readonly _instructionEncoder;
  private readonly _messageDecoder;

  constructor(textureFactory: WebXTextureFactory) {
    this._instructionEncoder = new WebXInstructionEncoder();
    this._messageDecoder = new WebXMessageDecoder(textureFactory);
  }

  serializeInstruction(instruction: WebXInstruction): ArrayBuffer {
    // return instruction.toJsonString();
    const encoded = this._instructionEncoder.encode(instruction);
    if (encoded) {
      return encoded;
    } else {
      console.warn('Could not serialize instruction: Unknown type');
      return null;
    }
  }

  deserializeMessage(data: any): Promise<WebXMessage> {
    const arrayBuffer = data as ArrayBuffer;
    if (arrayBuffer.byteLength === 0) {
      console.warn('Got a zero length message');
      return new Promise<WebXMessage>((resolve, reject) => {
        resolve(null);
      });
    }

    const buffer: WebXMessageBuffer = new WebXMessageBuffer(arrayBuffer);
    const { messageTypeId } = buffer;

    return this._messageDecoder.decode(messageTypeId, buffer);
  }


}
