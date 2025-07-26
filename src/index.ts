import './scss/styles.scss';
import { EventEmitter } from './components/base/EventEmitter';
import { LarekAPI } from './components/LarekAPI';
import { AppState } from './components/AppState';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { Modal } from './components/modal/Modal';
import { Basket } from './components/modal/Basket';
import { OrderForm } from './components/modal/OrderForm';
import { ContactsForm } from './components/modal/ContactsForm';
import { Success } from './components/modal/Success';
import { API_URL, CDN_URL } from './utils/constants';
import { IProduct, ISuccess } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';

function initApp() {
    try {
        const events = new EventEmitter();
        const api = new LarekAPI(API_URL, CDN_URL);
        const appData = new AppState(events);

        const page = new Page(document.body, events);
        const modalContainer = ensureElement<HTMLElement>('#modal-container');
        const modal = new Modal(modalContainer, events);

        // Инициализация компонентов с правильными типами
        const basket = new Basket(cloneTemplate<HTMLElement>('#basket'), events);
        
        // Исправление для OrderForm - явное приведение к HTMLFormElement
        const orderFormTemplate = cloneTemplate<HTMLFormElement>('#order');
        const orderForm = new OrderForm(orderFormTemplate, events);
        
        // Исправление для ContactsForm - явное приведение к HTMLFormElement
        const contactsFormTemplate = cloneTemplate<HTMLFormElement>('#contacts');
        const contactsForm = new ContactsForm(contactsFormTemplate, events);
        
        const success = new Success(cloneTemplate<HTMLElement>('#success'), {
            onClick: () => {
                modal.close();
                appData.clearBasket();
            }
        });

        // Блокировка страницы
        events.on('modal:open', () => page.locked = true);
        events.on('modal:close', () => page.locked = false);

        // Каталог товаров
        events.on('catalog:changed', () => {
            page.catalog = appData.catalog.map(item => {
                const card = new Card(cloneTemplate<HTMLElement>('#card-catalog'), events);
                const cardElement = card.render({
                    ...item,
                    button: appData.basket.some(it => it.id === item.id) 
                        ? 'Убрать' 
                        : 'В корзину'
                });

                cardElement.addEventListener('click', () => events.emit('card:select', item));
                return cardElement;
            });
        });

        // Просмотр товара
        events.on('card:select', (item: IProduct) => {
            const previewCard = new Card(cloneTemplate<HTMLElement>('#card-preview'), events);
            modal.render({
                content: previewCard.render({
                    ...item,
                    button: appData.basket.some(it => it.id === item.id) 
                        ? 'Убрать' 
                        : 'В корзину'
                })
            });
        });

        // Работа с корзиной
        events.on('card:add', (item: IProduct) => {
            appData.addToBasket(item);
            modal.close();
        });

        events.on('card:remove', (id: string) => {
            appData.removeFromBasket(id);
        });

        events.on('basket:changed', () => {
            page.counter = appData.basket.length;
            basket.render({
                items: appData.basket,
                total: appData.getTotal()
            });
        });

        events.on('basket:open', () => {
            modal.render({
                content: basket.render({
                    items: appData.basket,
                    total: appData.getTotal()
                })
            });
        });

        // Оформление заказа
        events.on('order:open', () => {
            modal.render({
                content: orderForm.render({
                    payment: appData.order.payment,
                    address: appData.order.address
                })
            });
        });

        events.on('contacts:open', () => {
            modal.render({
                content: contactsForm.render({
                    email: appData.order.email,
                    phone: appData.order.phone
                })
            });
        });

        events.on('order:submit', () => {
            api.orderProducts(appData.prepareOrder())
                .then(() => {
                    modal.render({
                        content: success.render({
                            description: appData.getTotal(),
                            total: appData.getTotal()
                        })
                    });
                })
                .catch(err => console.error(err));
        });

        // Валидация
        events.on('formErrors:change', (errors: Partial<Record<string, string>>) => {
            const { payment, address, email, phone } = errors;
            if (payment || address) {
                orderForm.valid = !payment && !address;
                orderForm.errors = [payment, address].filter(i => !!i).join('; ');
            }
            if (email || phone) {
                contactsForm.valid = !email && !phone;
                contactsForm.errors = [email, phone].filter(i => !!i).join('; ');
            }
        });

        // Обработчики кликов
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.header__basket')) {
                events.emit('basket:open');
            }
        });
        // Загрузка данных
        api.getProductList()
            .then(items => {
                appData.setCatalog(items);
                console.log('Catalog loaded:', items); // Добавьте для отладки
            })
            .catch(err => {
                console.error('Failed to load products:', err);
            });

    } catch (error) {
        console.error('App initialization failed:', error);
    }
}
document.addEventListener('DOMContentLoaded', initApp);