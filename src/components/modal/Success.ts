import { Component } from "../base/Component";
import { ISuccess } from "../../types";

interface ISuccessActions {
  onClick: () => void;
}

export class Success extends Component<ISuccess> {
  protected _close: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ISuccessActions) {
    super(container);

    this._close = container.querySelector('.order-success__close');
    if (actions?.onClick) {
      this._close.addEventListener('click', actions.onClick);
    }
  }

  render(data: ISuccess) {
    const totalElement = this.container.querySelector('.order-success__description');
    if (totalElement) {
      totalElement.textContent = `Списано ${data.total} синапсов`;
    }
    return this.container;
  }
}