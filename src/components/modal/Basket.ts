import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { IProduct } from '../../types';

interface IBasketView {
	items: IProduct[];
	total: number;
}

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = container.querySelector('.basket__list');
		this._total = container.querySelector('.basket__price');
		this._button = container.querySelector('.button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}
	}

	render(data: IBasketView): HTMLElement {
		if (this._list) {
			this._list.innerHTML = '';
			data.items.forEach((item, index) => {
				const li = document.createElement('li');
				li.classList.add('basket__item');
				li.innerHTML = `
          <span>${index + 1}</span>
          <span>${item.title}</span>
          <span>${item.price} синапсов</span>
          <button class="basket__item-delete" aria-label="удалить"></button>
        `;
				li.querySelector('.basket__item-delete')?.addEventListener(
					'click',
					() => {
						this.events.emit('basket:remove', item.id);
					}
				);
				this._list.appendChild(li);
			});
		}

		if (this._total) {
			this._total.textContent = `${data.total} синапсов`;
		}

		return this.container;
	}
}
