import { Component } from './base/Component';
import { EventEmitter } from './base/EventEmitter';
import { ensureElement } from '../utils/utils';
import { IProduct } from '../types';

export class BasketItem extends Component<IProduct> {
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._button = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			container
		);

		this._button.addEventListener('click', (evt) => {
			evt.preventDefault();
			events.emit('card:remove', this.container.dataset.id);
		});
	}

	set index(value: number) {
		this.setText(this._index, String(value));
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number) {
		this.setText(this._price, `${value} синапсов`);
	}

	render(data: IProduct & { index: number }): HTMLElement {
		this.container.dataset.id = data.id;
		this.index = data.index;
		this.title = data.title;
		this.price = data.price || 0;
		return this.container;
	}
}
