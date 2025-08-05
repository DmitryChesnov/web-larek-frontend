import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';

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

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}

		this._list.addEventListener('click', (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const button = target.closest('.basket__item-delete');
			if (button) {
				const item = button.closest('.basket__item');
				if (item) {
					const id = item.getAttribute('data-id');
					if (id) {
						events.emit('card:remove', id);
						// Немедленно обновляем отображение корзины
						item.remove();
						this.updateTotal();
					}
				}
			}
		});
	}

	render(data: IBasketView): HTMLElement {
		if (data) {
			this._list.innerHTML = '';
			data.items.forEach((item, index) => {
				const itemElement = this.createBasketItem(item, index);
				this._list.appendChild(itemElement);
			});
			this._total.textContent = `${data.total} синапсов`;
		}
		return this.container;
	}

	private createBasketItem(item: IProduct, index: number): HTMLElement {
		const element = this._itemTemplate.content.cloneNode(
			true
		) as DocumentFragment;
		const basketItem = element.querySelector('.basket__item') as HTMLElement;

		basketItem.dataset.id = item.id;
		basketItem.querySelector('.basket__item-index').textContent = String(
			index + 1
		);
		basketItem.querySelector('.card__title').textContent = item.title;
		basketItem.querySelector(
			'.card__price'
		).textContent = `${item.price} синапсов`;

		return basketItem;
	}

	private updateTotal(): void {
		const items = Array.from(this._list.children);
		const total = items.reduce((sum, item) => {
			const priceElement = item.querySelector('.card__price');
			const price = priceElement ? parseInt(priceElement.textContent) || 0 : 0;
			return sum + price;
		}, 0);
		this._total.textContent = `${total} синапсов`;
	}
}
