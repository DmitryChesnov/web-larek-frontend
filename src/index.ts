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
import { IProduct } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';

function initApp() {
	try {
		const events = new EventEmitter();
		const api = new LarekAPI(API_URL, CDN_URL);

		const appData = new AppState(events);
		const page = new Page(document.body, events);
		page.counter = appData.basket.length;

		const modalContainer = ensureElement<HTMLElement>('#modal-container');
		const modal = new Modal(modalContainer, events);

		const basket = new Basket(cloneTemplate<HTMLElement>('#basket'), events);
		const orderForm = new OrderForm(
			cloneTemplate<HTMLFormElement>('#order'),
			events
		);
		const contactsForm = new ContactsForm(
			cloneTemplate<HTMLFormElement>('#contacts'),
			events
		);
		const success = new Success(cloneTemplate<HTMLElement>('#success'), {
			onClick: () => {
				modal.close();
				appData.clearBasket();
			},
		});

		// Обработчики событий
		events.on('modal:open', () => (page.locked = true));
		events.on('modal:close', () => (page.locked = false));

		events.on('catalog:changed', () => {
			page.catalog = appData.catalog.map((item) => {
				const card = new Card(
					cloneTemplate<HTMLElement>('#card-catalog'),
					events
				);
				return card.render({
					...item,
					button: appData.basket.some((it) => it.id === item.id)
						? 'Убрать'
						: 'В корзину',
				});
			});
		});

		events.on('card:select', (item: IProduct) => {
			const preview = new Card(
				cloneTemplate<HTMLElement>('#card-preview'),
				events
			).render({
				...item,
				button: appData.basket.some((it) => it.id === item.id)
					? 'Убрать'
					: 'В корзину',
			});
			modal.render({ content: preview });
		});

		events.on('basket:open', () => {
			modal.render({
				content: basket.render({
					items: appData.basket,
					total: appData.getTotal(),
				}),
			});
		});

		// Исправленные обработчики для работы с корзиной
		events.on('card:add', (item: IProduct) => appData.addToBasket(item));
		events.on('card:remove', (id: string) => appData.removeFromBasket(id));

		events.on('order:open', () => {
			modal.render({
				content: orderForm.render({
					payment: appData.order.payment,
					address: appData.order.address,
					valid: false,
					errors: {},
				}),
			});
		});

		events.on('contacts:open', () => {
			modal.render({
				content: contactsForm.render({
					email: appData.order.email,
					phone: appData.order.phone,
					valid: false,
					errors: {},
				}),
			});
		});

		events.on('order:success', (data: { total: number }) => {
			modal.render({
				content: success.render({
					total: data.total,
				}),
			});
		});

		// Загрузка данных
		api
			.getProductList()
			.then(appData.setCatalog.bind(appData))
			.catch(console.error);
	} catch (error) {
		console.error('Ошибка инициализации:', error);
	}
}

document.addEventListener('DOMContentLoaded', initApp);
