import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXCursorInstruction extends WebXInstruction {
  constructor() {
    super(WebXInstructionType.CURSOR);
  }
}
