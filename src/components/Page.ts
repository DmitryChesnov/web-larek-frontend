import { Component } from './base/Component';
import { EventEmitter } from './base/EventEmitter';

interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export class Page extends Component<IPage> {
	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);
	}

	set counter(value: number) {
		const element = this.container.querySelector('.header__basket-counter');
		if (element) element.textContent = String(value);
	}

	set catalog(items: HTMLElement[]) {
		const gallery = this.container.querySelector('.gallery');
		if (gallery) gallery.replaceChildren(...items);
	}

	set locked(value: boolean) {
		this.container.classList.toggle('page__wrapper_locked', value);
	}

	render(): HTMLElement {
		return this.container;
	}
}
