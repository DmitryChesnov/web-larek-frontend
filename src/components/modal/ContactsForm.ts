import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { IContactsForm } from '../../types';

interface IContactsFormView extends IContactsForm {
	valid: boolean;
	errors: string;
}

export class ContactsForm extends Component<IContactsFormView> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;
	protected _errors: HTMLElement;
	protected _submit: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container);

		if (!container) {
			throw new Error('Form container not found');
		}

		this._email = container.querySelector(
			'input[name="email"]'
		) as HTMLInputElement;
		this._phone = container.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;
		this._errors = container.querySelector('.form__errors') as HTMLElement;
		this._submit = container.querySelector(
			'button[type="submit"]'
		) as HTMLButtonElement;

		if (!this._email || !this._phone || !this._submit) {
			throw new Error('Required form elements not found');
		}

		// Обработчик изменений в полях формы
		container.addEventListener('input', () => {
			this.events.emit('contacts:input', {
				email: this._email.value,
				phone: this._phone.value,
			});
		});

		// Обработчик отправки формы
		container.addEventListener('submit', (e) => {
			e.preventDefault();
			this.events.emit('contacts:submit');
		});
	}

	set email(value: string) {
		this._email.value = value;
		this.validate();
	}

	set phone(value: string) {
		this._phone.value = value;
		this.validate();
	}

	set errors(value: string) {
		if (this._errors) {
			this._errors.textContent = value;
		}
	}

	set valid(value: boolean) {
		if (this._submit) {
			this._submit.disabled = !value;
		}
	}

	private validate() {
		const errors: string[] = [];

		if (!this._email.value) {
			errors.push('Укажите email');
		} else if (!this.validateEmail(this._email.value)) {
			errors.push('Некорректный email');
		}

		if (!this._phone.value) {
			errors.push('Укажите телефон');
		} else if (!this.validatePhone(this._phone.value)) {
			errors.push('Некорректный телефон');
		}

		this.errors = errors.join(', ');
		this.valid = errors.length === 0;
	}

	private validateEmail(email: string): boolean {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	private validatePhone(phone: string): boolean {
		const re = /^\+?[\d\s\-\(\)]{10,}$/;
		return re.test(phone);
	}

	render(data: Partial<IContactsFormView>): HTMLElement {
		if (data.email !== undefined) {
			this.email = data.email;
		}
		if (data.phone !== undefined) {
			this.phone = data.phone;
		}
		if (data.valid !== undefined) {
			this.valid = data.valid;
		}
		if (data.errors !== undefined) {
			this.errors = data.errors;
		}
		return this.container;
	}
}
