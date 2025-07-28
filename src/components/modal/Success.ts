import { Component } from '../base/Component';
import { ISuccess } from '../../types';
import { ensureElement } from '../../utils/utils';

interface ISuccessActions {
	onClick: () => void;
}

export class Success extends Component<ISuccess> {
	protected _close: HTMLButtonElement;
	protected _description: HTMLElement;

	constructor(container: HTMLElement, actions?: ISuccessActions) {
		super(container);

		this._close = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			container
		);
		this._description = ensureElement<HTMLElement>(
			'.order-success__description',
			container
		);

		if (actions?.onClick) {
			this._close.addEventListener('click', actions.onClick);
		}
	}

	render(data: ISuccess): HTMLElement {
		this.setText(
			this._description,
			data.description || `Списано ${data.total} синапсов`
		);
		return this.container;
	}
}
