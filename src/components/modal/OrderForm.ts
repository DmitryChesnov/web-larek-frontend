import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { ensureElement } from '../../utils/utils';

interface IOrderFormData {
	payment: string;
	address: string;
	valid?: boolean;
	errors?: string;
}

export class OrderForm extends Component<IOrderFormData> {
	protected _buttons: HTMLButtonElement[];
	protected _address: HTMLInputElement;
	protected _errors: HTMLElement;
	protected _submit: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container);

		this._buttons = Array.from(container.querySelectorAll('.button_alt'));
		this._address = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', container);
		this._submit = ensureElement<HTMLButtonElement>(
			'button[type="submit"]',
			container
		);

		this._buttons.forEach((button) => {
			button.addEventListener('click', () => {
				this.payment = button.name;
				events.emit('order.payment:change', { payment: button.name });
				this.validate();
			});
		});

		this._address.addEventListener('input', () => {
			events.emit('order.address:change', { address: this._address.value });
			this.validate();
		});

		container.addEventListener('submit', (e) => {
			e.preventDefault();
			if (this._submit.disabled) return;
			events.emit('contacts:open');
		});
	}

	set payment(value: string) {
		this._buttons.forEach((button) => {
			button.classList.toggle('button_alt-active', button.name === value);
		});
	}

	set address(value: string) {
		this._address.value = value;
	}

	set errors(value: string) {
		this._errors.textContent = value;
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	render(data: IOrderFormData): HTMLElement {
		if (data.payment) this.payment = data.payment;
		if (data.address) this.address = data.address;
		if (data.errors) this.errors = data.errors;
		if (data.valid !== undefined) this.valid = data.valid;
		return this.container;
	}

	private validate() {
		const errors: string[] = [];

		if (!this._address.value.trim()) {
			errors.push('Укажите адрес доставки');
		}

		const paymentSelected = this._buttons.some((button) =>
			button.classList.contains('button_alt-active')
		);

		if (!paymentSelected) {
			errors.push('Выберите способ оплаты');
		}

		this.errors = errors.join('; ');
		this.valid = errors.length === 0;
	}
}
