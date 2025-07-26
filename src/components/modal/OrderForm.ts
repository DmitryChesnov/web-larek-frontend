import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { IOrderForm } from '../../types';

export class OrderForm extends Component<IOrderForm> {
	protected _buttons: HTMLButtonElement[];
	protected _address: HTMLInputElement;
	protected _errors: HTMLElement;
	protected _submit: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container);

		this._buttons = Array.from(container.querySelectorAll('.button_alt'));
		this._address = container.querySelector(
			'input[name="address"]'
		) as HTMLInputElement;
		this._errors = container.querySelector('.form__errors') as HTMLElement;
		this._submit = container.querySelector(
			'button[type="submit"]'
		) as HTMLButtonElement;

		if (this._buttons) {
			this._buttons.forEach((button) => {
				button.addEventListener('click', () => {
					this.payment = button.name;
					this.events.emit('order.payment:change', { payment: button.name });
				});
			});
		}

		if (this._address) {
			this._address.addEventListener('input', () => {
				this.events.emit('order.address:change', {
					address: this._address.value,
				});
			});
		}

		if (this.container) {
			this.container.addEventListener('submit', (e) => {
				e.preventDefault();
				this.events.emit('contacts:open');
			});
		}
	}

	set payment(value: string) {
		this._buttons.forEach((button) => {
			button.classList.toggle('button_alt-active', button.name === value);
		});
		this.validate();
	}

	set address(value: string) {
		this._address.value = value;
		this.validate();
	}

	set errors(value: string) {
		this._errors.textContent = value;
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	private validate() {
		const errors: string[] = [];
		if (!this._address.value) errors.push('Укажите адрес доставки');
		if (
			!this._buttons.some((button) =>
				button.classList.contains('button_alt-active')
			)
		) {
			errors.push('Выберите способ оплаты');
		}
		this.errors = errors.join(', ');
		this.valid = errors.length === 0;
	}

	render(data: Partial<IOrderForm>): HTMLElement {
		this.payment = data.payment || '';
		this.address = data.address || '';
		return this.container;
	}
}
