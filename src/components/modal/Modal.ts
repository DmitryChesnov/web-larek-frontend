import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { ensureElement } from '../../utils/utils';

interface IModalData {
    content: HTMLElement;
}

export class Modal extends Component<IModalData> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        this._closeButton.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (event: MouseEvent) => {
            if (event.target === this.container) {
                this.close();
            }
        });
        this._content.addEventListener('click', (event: MouseEvent) => event.stopPropagation());
    }

    set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }

    open(): void {
        this.container.classList.add('modal_active');
        document.addEventListener('keydown', this.handleKeyDown);
    }

    close(): void {
        this.container.classList.remove('modal_active');
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') this.close();
    };

    render(data: IModalData): HTMLElement {
        this.content = data.content;
        this.open();
        return this.container;
    }
}