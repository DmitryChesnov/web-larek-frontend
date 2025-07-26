import { Component } from './base/Component';
import { EventEmitter } from './base/EventEmitter';
import { IProduct } from '../types';
import { ensureElement } from '../utils/utils';

export class Card extends Component<IProduct> {
	protected _category?: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _price: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _description?: HTMLElement;
	protected _index?: HTMLElement;
	protected _data: IProduct;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._image = container.querySelector('.card__image');
		this._button = container.querySelector('.button');
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._category = container.querySelector('.card__category');
		this._description = container.querySelector('.card__text');
		this._index = container.querySelector('.basket__item-index');

		if (this._button) {
			this._button.addEventListener('click', () => {
				if (this._button.textContent === 'В корзину') {
					events.emit('card:add', this._data);
				} else {
					events.emit('card:remove', this._data.id);
				}
			});
		}

		if (this._image) {
			this._image.addEventListener('click', () => {
				events.emit('card:select', this._data);
			});
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
	}

	set category(value: string) {
		if (this._category) {
			this.setText(this._category, value);
			this._category.className = `card__category card__category_${value}`;
		}
	}

	set image(value: string) {
		if (this._image) {
			this._image.src = value;
			this._image.alt = this.title;
		}
	}

	set description(value: string) {
		if (this._description) {
			this.setText(this._description, value);
		}
	}

	set button(value: string) {
		if (this._button) {
			this._button.textContent = value;
		}
	}

	set index(value: number) {
		if (this._index) {
			this.setText(this._index, value.toString());
		}
	}

	render(data: IProduct): HTMLElement {
		this._data = data;
		this.title = data.title;
		this.price = data.price;
		if (data.category) this.category = data.category;
		if (data.image) this.image = data.image;
		if (data.description) this.description = data.description;
		if (data.button) this.button = data.button;
		return this.container;
	}
}
