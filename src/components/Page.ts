import { Component } from './base/Component';
import { EventEmitter } from './base/EventEmitter';
import { ensureElement } from '../utils/utils';

interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export class Page extends Component<IPage> {
	protected _counterElement: HTMLElement;
	protected _gallery: HTMLElement;
	protected _basketButton: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._counterElement = ensureElement<HTMLElement>(
			'.header__basket-counter',
			container
		);
		this._gallery = ensureElement<HTMLElement>('.gallery', container);
		this._basketButton = ensureElement<HTMLElement>(
			'.header__basket',
			container
		);

		this.events.on('basket:updated', (data: { count: number }) => {
			this.counter = data.count;
		});

		this._basketButton.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	set counter(value: number) {
		this.setText(this._counterElement, String(value));
	}

	set catalog(items: HTMLElement[]) {
		this._gallery.replaceChildren(...items);
	}

	set locked(value: boolean) {
		if (value) {
			this.container.classList.add('page__wrapper_locked');
		} else {
			this.container.classList.remove('page__wrapper_locked');
		}
	}

	render(data?: Partial<IPage>): HTMLElement {
		if (data?.counter !== undefined) this.counter = data.counter;
		if (data?.catalog !== undefined) this.catalog = data.catalog;
		if (data?.locked !== undefined) this.locked = data.locked;
		return this.container;
	}
}
