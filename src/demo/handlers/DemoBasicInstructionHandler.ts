import {
  WebXHandler,
  WebXInstruction,
  WebXInstructionHandler,
  WebXInstructionType,
  WebXKeyboardInstruction,
  WebXMouseInstruction
} from '../../core';

export class DemoBasicInstructionHandler extends WebXInstructionHandler implements WebXHandler {

  private _instructions: WebXInstruction[] = [];
  private _el: HTMLElement;
  private readonly _fragment: DocumentFragment;
  private readonly _filterEl: HTMLElement;
  private _filterBy: WebXInstructionType = null;

  constructor() {
    super();
    this._el = document.getElementById('instructions');
    this._filterEl = document.getElementById('instructions-filter');
    this._fragment = document.createDocumentFragment();
    this._filterEl.addEventListener('change', this._handleFilter.bind(this));
  }

  private _handleFilter(event: { target: HTMLSelectElement; }): void {
    const value = (<HTMLSelectElement>event.target).value;
    if (value === '') {
      this._filterBy = null;
    } else {
      this._filterBy = WebXInstructionType.fromString(value);
    }
  }

  private _createInstructionText(instruction: WebXInstruction): string {
    if (instruction.type === WebXInstructionType.MOUSE) {
      const mouseInstruction = instruction as WebXMouseInstruction;
      return `x = ${mouseInstruction.x}, y = ${mouseInstruction.y}`;
    } else if (instruction.type === WebXInstructionType.KEYBOARD) {
      const keyboardInstruction = instruction as WebXKeyboardInstruction;
      return `key = ${keyboardInstruction.key} (0x${keyboardInstruction.key.toString(16)}, '${String.fromCharCode(keyboardInstruction.key)}', pressed = ${keyboardInstruction.pressed}`;
    } else {
      return `No details`;
    }
  }

  handle(instruction: WebXInstruction): void {
    if ((instruction.type === this._filterBy) || this._filterBy === null) {
      this._instructions.push(instruction);
    }

    if (this._instructions.length > 25) {
      this._instructions.shift();
    }
    const els = this._instructions.map((i) => this._createInstructionElement(i));
    this._fragment.append(...els);
    this._el.replaceChildren(this._fragment);
    this._el.scrollTop = this._el.scrollHeight;
  }

  private _createInstructionElement(instruction: WebXInstruction): HTMLElement {
    const el = document.createElement('tr');
    const details = this._createInstructionText(instruction);
    el.innerHTML = `
        <td>${WebXInstructionType[instruction.type]}</td>
        <td>${details}</td>
    `;
    return el;
  }

  destroy(): void {
  }

}
