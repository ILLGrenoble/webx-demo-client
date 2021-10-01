import {WebXTracerHandler} from "../../tracer/WebXTracerHandler";
import {WebXInstruction, WebXInstructionType} from "../../instruction";
import {WebXMessageType} from "../../message";

export class DemoBasicInstructionHandler implements WebXTracerHandler<WebXInstruction> {

  private _instructions: WebXInstruction[] = [];
  private _el: HTMLElement;
  private readonly _fragment: DocumentFragment;

  constructor() {
    this._el = document.getElementById('instructions');
    this._fragment = document.createDocumentFragment();
  }

  handle(instruction: WebXInstruction): void {
    this._instructions.push(instruction);
    if (this._instructions.length > 25) {
      this._instructions.shift();
    }
    const els = this._instructions.map((instruction) => this.createInstructionElement(WebXInstructionType[instruction.type]))
    this._fragment.append(...els);
    this._el.replaceChildren(this._fragment)
    this._el.scrollTop = this._el.scrollHeight;
  }

  private createInstructionElement (html: string): HTMLElement {
    const el = document.createElement('div');
    el.classList.add('events__message');
    el.innerHTML = html;
    return el;
  }
}
