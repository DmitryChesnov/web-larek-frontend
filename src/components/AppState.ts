import { EventEmitter } from './base/EventEmitter';
import { IProduct, IOrderForm, IOrder } from '../types';

export class AppState {
	private _catalog: IProduct[] = [];
	private _basket: IProduct[] = [];
	private _order: IOrderForm = {
		payment: '',
		address: '',
		email: '',
		phone: '',
	};
	private _preview: string | null = null;
	private _formErrors: Partial<Record<keyof IOrderForm, string>> = {};

	constructor(private events: EventEmitter) {
		this.loadBasket();
		this.registerEventHandlers();
		this.events.emit('basket:changed');
	}

	private registerEventHandlers(): void {
		this.events.on('card:add', (item: IProduct) => this.addToBasket(item));
		this.events.on('card:remove', (id: string) => this.removeFromBasket(id));

		this.events.on('order.payment:change', (data: { payment: string }) => {
			this._order.payment = data.payment;
			this.validateOrder();
		});

		this.events.on('order.address:change', (data: { address: string }) => {
			this._order.address = data.address.trim();
			this.validateOrder();
		});

		this.events.on('contacts.email:change', (data: { email: string }) => {
			this._order.email = data.email.trim();
			this.validateOrder();
		});

		this.events.on('contacts.phone:change', (data: { phone: string }) => {
			this._order.phone = data.phone.trim();
			this.validateOrder();
		});
	}

	private validateOrder(): void {
		const errors: Partial<Record<keyof IOrderForm, string>> = {};

		if (!this._order.payment) {
			errors.payment = 'Выберите способ оплаты';
		}

		if (!this._order.address) {
			errors.address = 'Введите адрес доставки';
		}

		if (!this._order.email) {
			errors.email = 'Введите email';
		} else if (!this.validateEmail(this._order.email)) {
			errors.email = 'Некорректный email';
		}

		if (!this._order.phone) {
			errors.phone = 'Введите телефон';
		} else if (!this.validatePhone(this._order.phone)) {
			errors.phone = 'Некорректный телефон';
		}

		this._formErrors = errors;
		this.events.emit('formErrors:change', this._formErrors);
	}

	private loadBasket(): void {
		const saved = localStorage.getItem('basket');
		if (saved) {
			try {
				this._basket = JSON.parse(saved);
				this.events.emit('basket:changed');
			} catch (e) {
				console.error('Failed to parse saved basket', e);
				localStorage.removeItem('basket');
			}
		}
	}

	private saveBasket(): void {
		localStorage.setItem('basket', JSON.stringify(this._basket));
	}

	prepareOrder(): IOrder {
		if (!this._order.email || !this._order.phone) {
			throw new Error('Не заполнены контактные данные');
		}

		return {
			...this._order,
			items: this._basket.map((item) => item.id),
			total: this.getTotal(),
		};
	}

	resetOrderForm(): void {
		this._order = {
			payment: '',
			address: '',
			email: '',
			phone: '',
		};
		this._formErrors = {};
		this.events.emit('formErrors:change', this._formErrors);
	}

	get catalog(): IProduct[] {
		return this._catalog;
	}

	get basket(): IProduct[] {
		return this._basket;
	}

	get order(): IOrderForm {
		return this._order;
	}

	get preview(): string | null {
		return this._preview;
	}

	get formErrors(): Partial<Record<keyof IOrderForm, string>> {
		return this._formErrors;
	}

	setCatalog(items: IProduct[]): void {
		this._catalog = items;
		this.events.emit('catalog:changed');
	}

	setPreview(id: string): void {
		this._preview = id;
		const product = this._catalog.find((item) => item.id === id);
		if (product) {
			this.events.emit('preview:changed', product);
		}
	}

	addToBasket(item: IProduct): void {
		if (!this._basket.some((it) => it.id === item.id)) {
			this._basket.push(item);
			this.updateBasket();
		}
	}

	removeFromBasket(id: string): void {
		this._basket = this._basket.filter((item) => item.id !== id);
		this.updateBasket();
	}

	clearBasket(): void {
		this._basket = [];
		this.updateBasket();
		localStorage.removeItem('basket');
	}

	private updateBasket(): void {
		this.events.emit('basket:changed');
		this.validateOrder();
		this.saveBasket();
	}

	getTotal(): number {
		return this._basket.reduce((total, item) => total + (item.price || 0), 0);
	}

	private validateEmail(email: string): boolean {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	private validatePhone(phone: string): boolean {
		const re = /^\+?[\d\s\-\(\)]{10,}$/;
		return re.test(phone);
	}
}
