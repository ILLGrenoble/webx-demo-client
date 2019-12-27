import { WebXInstruction } from '../instruction';
import { WebXMessage } from '../message';

export interface WebXSerializer {
  serializeInstruction(command: WebXInstruction): any;

  deserializeMessage(data: any): Promise<WebXMessage>;
}
