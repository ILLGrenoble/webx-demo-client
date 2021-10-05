import {WebXInstruction, WebXInstructionType, WebXMouseInstruction} from "../../instruction";
import { WebXInstructionHandler } from '../../tracer';

export class DemoBasicInstructionHandler extends WebXInstructionHandler {

  private _instructions: WebXInstruction[] = [];
  private _el: HTMLElement;
  private readonly _fragment: DocumentFragment;

  constructor() {
    super();
    this._el = document.getElementById('instructions');
    this._fragment = document.createDocumentFragment();
  }

  handle(instruction: WebXInstruction): void {
    this._instructions.push(instruction);
    if (this._instructions.length > 25) {
      this._instructions.shift();
    }
    const els = this._instructions.map((i) => this._createInstructionElement(i));
    this._fragment.append(...els);
    this._el.replaceChildren(this._fragment)
    this._el.scrollTop = this._el.scrollHeight;
  }

  private _createInstructionElement (instruction: WebXInstruction): HTMLElement {
    const el = document.createElement('tr');
    const details =  this._createInstructionText(instruction);
    el.innerHTML = `
        <td>${WebXInstructionType[instruction.type]}</td>
        <td>${details}</td>
    `;
    return el;
  }

  private _createInstructionText(instruction: WebXInstruction): string {
    if (instruction.type === WebXInstructionType.MOUSE) {
      const mouseInstruction = instruction as WebXMouseInstruction;
      return `x = ${mouseInstruction.x}, y = ${mouseInstruction.y}`;
    } else {
      return `No details`;
    }
  }

}
