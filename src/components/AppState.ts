import { EventEmitter } from './base/EventEmitter';
import {
	IProduct,
	IOrderForm,
	IOrder,
	IFormErrors,
	IBasketUpdate,
} from '../types';
import { LarekAPI } from './LarekAPI';
import { API_URL, CDN_URL } from '../utils/constants';

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
	private _formErrors: IFormErrors = {};

	constructor(private events: EventEmitter) {
		this._basket = this.loadBasket();
		this.emitBasketUpdate();
		this.registerEventHandlers();
	}

	public addToBasket(item: IProduct): void {
		if (!this._basket.some((it) => it.id === item.id)) {
			this._basket.push(item);
			this.updateBasket();
		}
	}

	public removeFromBasket(id: string): void {
		this._basket = this._basket.filter((item) => item.id !== id);
		this.updateBasket();
	}

	public clearBasket(): void {
		this._basket = [];
		localStorage.removeItem('basket');
		this.emitBasketUpdate();
	}

	private loadBasket(): IProduct[] {
		try {
			const saved = localStorage.getItem('basket');
			return saved ? JSON.parse(saved) : [];
		} catch (e) {
			console.error('Ошибка загрузки корзины:', e);
			localStorage.removeItem('basket');
			return [];
		}
	}

	private saveBasket(): void {
		localStorage.setItem('basket', JSON.stringify(this._basket));
	}

	private emitBasketUpdate(): void {
		this.events.emit('basket:updated', {
			items: [...this._basket],
			count: this._basket.length,
			total: this.getTotal(),
		} as IBasketUpdate);
	}

	private registerEventHandlers(): void {
		this.events.on('card:add', (item: IProduct) => this.addToBasket(item));
		this.events.on('card:remove', (id: string) => this.removeFromBasket(id));
		this.events.on('order:submit', () => this.submitOrder());

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

	private async submitOrder(): Promise<void> {
		try {
			const order = this.prepareOrder();
			const api = new LarekAPI(API_URL, CDN_URL);
			await api.orderProducts(order);
			this.clearBasket();
			this.events.emit('order:success', { total: order.total });
		} catch (error) {
			console.error('Ошибка оформления заказа:', error);
			this.events.emit('formErrors:change', {
				order: 'Ошибка при оформлении заказа',
			});
		}
	}

	private validateOrder(): void {
		const errors: IFormErrors = {};

		if (!this._order.payment) errors.payment = 'Выберите способ оплаты';
		if (!this._order.address) errors.address = 'Введите адрес доставки';

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
		this.events.emit('formErrors:change', errors);
		    this.events.emit('contacts:validation', {
        valid: !errors.email && !errors.phone,
        errors
    });
	}

	private updateBasket(): void {
		this.saveBasket();
		this.emitBasketUpdate();
	}

	private validateEmail(email: string): boolean {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	private validatePhone(phone: string): boolean {
		const re = /^\+?[\d\s\-\(\)]{10,}$/;
		return re.test(phone);
	}

	public prepareOrder(): IOrder {
		if (!this._order.email || !this._order.phone) {
			throw new Error('Не заполнены контактные данные');
		}

		return {
			...this._order,
			items: this._basket.map((item) => item.id),
			total: this.getTotal(),
		};
	}

	public resetOrderForm(): void {
		this._order = {
			payment: '',
			address: '',
			email: '',
			phone: '',
		};
		this._formErrors = {};
		this.events.emit('formErrors:change', this._formErrors);
	}

	public getTotal(): number {
		return this._basket.reduce((total, item) => total + (item.price || 0), 0);
	}

	// Getters
	public get catalog(): IProduct[] {
		return this._catalog;
	}
	public get basket(): IProduct[] {
		return this._basket;
	}
	public get order(): IOrderForm {
		return this._order;
	}
	public get preview(): string | null {
		return this._preview;
	}
	public get formErrors(): IFormErrors {
		return this._formErrors;
	}

	// Setters
	public setCatalog(items: IProduct[]): void {
		this._catalog = items;
		this.events.emit('catalog:changed');
	}

	public setPreview(id: string): void {
		this._preview = id;
		const product = this._catalog.find((item) => item.id === id);
		if (product) this.events.emit('preview:changed', product);
	}
}
