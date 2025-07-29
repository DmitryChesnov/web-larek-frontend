import { Component } from './base/Component';
import { EventEmitter } from './base/EventEmitter';

interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export class Page extends Component<IPage> {
    protected _counter: number = 0;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        // Добавляем обработчик сразу при создании
        this.events.on('basket:changed', () => {
            this.updateCounter();
        });
    }

    private updateCounter() {
        const counterElement = this.container.querySelector('.header__basket-counter');
        if (counterElement) {
            counterElement.textContent = String(this._counter);
        }
    }

    set counter(value: number) {
        this._counter = value;
        this.updateCounter(); // Обновляем отображение при изменении
    }

    set catalog(items: HTMLElement[]) {
        const gallery = this.container.querySelector('.gallery');
        if (gallery) {
            gallery.replaceChildren(...items);
        }
    }

    set locked(value: boolean) {
        this.container.classList.toggle('page__wrapper_locked', value);
    }

    render(data?: IPage): HTMLElement {
        if (data) {
            if (data.counter !== undefined) this.counter = data.counter;
            if (data.catalog !== undefined) this.catalog = data.catalog;
            if (data.locked !== undefined) this.locked = data.locked;
        }
        return this.container;
    }
}