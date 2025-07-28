import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { ensureElement } from '../../utils/utils';

interface IContactsFormData {
	email: string;
	phone: string;
	valid?: boolean;
	errors?: string;
}

export class ContactsForm extends Component<IContactsFormData> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;
	protected _errors: HTMLElement;
	protected _submit: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container);

		this._email = ensureElement<HTMLInputElement>(
			'input[name="email"]',
			container
		);
		this._phone = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', container);
		this._submit = ensureElement<HTMLButtonElement>(
			'button[type="submit"]',
			container
		);

		this._email.addEventListener('input', () => {
			this.validate();
			events.emit('contacts.email:change', { email: this._email.value });
		});

		this._phone.addEventListener('input', () => {
			this.validate();
			events.emit('contacts.phone:change', { phone: this._phone.value });
		});

		container.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!this._submit.disabled) {
				events.emit('order:submit'); // Важно: именно здесь вызываем отправку
			}
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
		this._errors.textContent = value;
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	render(data: IContactsFormData): HTMLElement {
		if (data.email !== undefined) this.email = data.email;
		if (data.phone !== undefined) this.phone = data.phone;
		if (data.errors !== undefined) this.errors = data.errors;
		if (data.valid !== undefined) this.valid = data.valid;
		return this.container;
	}

	private validate() {
		const errors: string[] = [];

		if (!this._email.value.trim()) {
			errors.push('Укажите email');
		} else if (!this.validateEmail(this._email.value)) {
			errors.push('Некорректный email');
		}

		if (!this._phone.value.trim()) {
			errors.push('Укажите телефон');
		} else if (!this.validatePhone(this._phone.value)) {
			errors.push('Некорректный телефон');
		}

		this.errors = errors.join('; ');
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
}
