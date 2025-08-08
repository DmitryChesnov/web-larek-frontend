import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';
import { BasketItem } from '../BasketItem';

interface IBasketView {
	items: IProduct[];
	total: number;
}

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;
	protected _itemTemplate: HTMLTemplateElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', container);
		this._total = ensureElement<HTMLElement>('.basket__price', container);
		this._button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);
		this._itemTemplate = document.querySelector('#card-basket');

		this._button.addEventListener('click', () => {
			events.emit('order:open');
		});

		events.on('basket:updated', () => {
			this.render({
				items: [],
				total: 0,
			});
		});
	}

	render(data: IBasketView): HTMLElement {
		if (!data) return this.container;

		this._list.innerHTML = '';

		data.items.forEach((item, index) => {
			const element = this._itemTemplate.content.cloneNode(
				true
			) as DocumentFragment;
			const basketItem = new BasketItem(
				element.querySelector('.basket__item') as HTMLElement,
				this.events
			);
			this._list.appendChild(basketItem.render({ ...item, index: index + 1 }));
		});

		this._total.textContent = `${data.total} синапсов`;
		return this.container;
	}
}
