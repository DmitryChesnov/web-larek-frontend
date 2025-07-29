import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';

interface IBasketView {
    items: IProduct[];
    total: number;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>(
            '.basket__button',
            container
        );

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }

        this._list.addEventListener('click', (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const button = target.closest('.basket__item-delete');
            if (button) {
                const item = button.closest('.basket__item');
                if (item) {
                    const id = item.getAttribute('data-id');
                    if (id) events.emit('card:remove', id);
                }
            }
        });
    }

    render(data: IBasketView): HTMLElement {
        if (data) {
            this._list.innerHTML = '';
            data.items.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'basket__item card card_compact';
                li.dataset.id = item.id;
                li.innerHTML = `
                    <span class="basket__item-index">${index + 1}</span>
                    <span class="card__title">${item.title}</span>
                    <span class="card__price">${item.price} синапсов</span>
                    <button class="basket__item-delete" aria-label="удалить"></button>
                `;
                this._list.appendChild(li);
            });
            this._total.textContent = `${data.total} синапсов`;
        }
        return this.container;
    }
}