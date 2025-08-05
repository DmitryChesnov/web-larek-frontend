import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { ensureElement } from '../../utils/utils';
import { IContactsForm, IFormErrors } from '../../types';

export class ContactsForm extends Component<IContactsForm> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;
	protected _errors: HTMLElement;
	protected _submit: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container);

		// Инициализация элементов формы
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

		// Обработчики изменений полей
		this._email.addEventListener('input', () => {
			events.emit('contacts.email:change', {
				email: this._email.value,
			});
		});

		this._phone.addEventListener('input', () => {
			events.emit('contacts.phone:change', {
				phone: this._phone.value,
			});
		});

		// Подписка на события валидации из модели
		events.on(
			'contacts:validation',
			(data: { valid: boolean; errors: IFormErrors }) => {
				this.errors = data.errors;
				this.valid = data.valid;
			}
		);

		// Обработчик отправки формы
		container.addEventListener('submit', (e) => {
			e.preventDefault();
			events.emit('contacts:submit');
		});
	}

	// Сеттеры для обновления состояния формы
	set email(value: string) {
		this._email.value = value;
	}

	set phone(value: string) {
		this._phone.value = value;
	}

	set errors(value: IFormErrors) {
		const errorMessages = [];
		if (value.email) errorMessages.push(value.email);
		if (value.phone) errorMessages.push(value.phone);
		this._errors.textContent = errorMessages.join('; ');
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	// Метод обновления представления
	render(
		data: Partial<IContactsForm> & {
			errors?: IFormErrors;
			valid?: boolean;
		}
	): HTMLElement {
		if (data.email !== undefined) this.email = data.email;
		if (data.phone !== undefined) this.phone = data.phone;
		if (data.errors !== undefined) this.errors = data.errors;
		if (data.valid !== undefined) this.valid = data.valid;
		return this.container;
	}
}
