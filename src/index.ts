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
		const modalContainer = ensureElement<HTMLElement>('#modal-container');
		const modal = new Modal(modalContainer, events);

		// Инициализация компонентов
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
			},
		});

		// Блокировка страницы при открытии модалки
		events.on('modal:open', () => {
			page.locked = true;
		});

		events.on('modal:close', () => {
			page.locked = false;
		});

		// Обработка изменений каталога
		events.on('catalog:changed', () => {
			page.catalog = appData.catalog.map((item) => {
				const card = new Card(
					cloneTemplate<HTMLElement>('#card-catalog'),
					events
				);
				const cardElement = card.render({
					...item,
					button: appData.basket.some((it) => it.id === item.id)
						? 'Убрать'
						: 'В корзину',
				});

				cardElement.addEventListener('click', () => {
					events.emit('card:select', item);
				});

				return cardElement;
			});
		});

		// Просмотр карточки товара
		events.on('card:select', (item: IProduct) => {
			const previewCard = new Card(
				cloneTemplate<HTMLElement>('#card-preview'),
				events
			);
			modal.render({
				content: previewCard.render({
					...item,
					button: appData.basket.some((it) => it.id === item.id)
						? 'Убрать'
						: 'В корзину',
				}),
			});
		});

		// Добавление/удаление товаров
		events.on('card:add', (item: IProduct) => {
			appData.addToBasket(item);
			modal.close();
		});

		events.on('card:remove', (id: string) => {
			appData.removeFromBasket(id);
		});

		// Работа с корзиной
		events.on('basket:changed', () => {
			page.counter = appData.basket.length;
			basket.render({
				items: appData.basket,
				total: appData.getTotal(),
			});
		});

		events.on('basket:open', () => {
			modal.render({
				content: basket.render({
					items: appData.basket,
					total: appData.getTotal(),
				}),
			});
		});

		// Оформление заказа
		events.on('order:open', () => {
			modal.render({
				content: orderForm.render({
					payment: appData.order.payment,
					address: appData.order.address,
					valid: !!appData.order.payment && !!appData.order.address,
					errors: '',
				}),
			});
		});

		events.on('contacts:open', () => {
			modal.render({
				content: contactsForm.render({
					email: appData.order.email,
					phone: appData.order.phone,
					valid: !!appData.order.email && !!appData.order.phone,
					errors: '',
				}),
			});
		});

		// Отправка заказа
		events.on('order:submit', () => {
			try {
				const order = appData.prepareOrder();
				api
					.orderProducts(order)
					.then((result) => {
						const successData = {
							description: `Списано ${order.total} синапсов`,
							total: order.total,
						};

						// Показываем окно успеха
						success.render(successData);
						modal.render({
							content: success.render(successData),
						});

						// Очищаем корзину и сбрасываем форму
						appData.clearBasket();
						appData.resetOrderForm();
					})
					.catch((err) => {
						console.error('Ошибка оформления заказа:', err);
						// Можно показать сообщение об ошибке
					});
			} catch (error) {
				console.error('Ошибка подготовки заказа:', error);
				// Показываем ошибки валидации
				events.emit('formErrors:change', {
					email: !appData.order.email ? 'Введите email' : undefined,
					phone: !appData.order.phone ? 'Введите телефон' : undefined,
				});
			}
		});
		// Валидация форм
		events.on(
			'formErrors:change',
			(errors: Partial<Record<string, string>>) => {
				const { payment, address, email, phone } = errors;

				if (payment || address) {
					orderForm.valid = !payment && !address;
					orderForm.errors = Object.values({ payment, address })
						.filter((i) => !!i)
						.join('; ');
				}

				if (email || phone) {
					contactsForm.valid = !email && !phone;
					contactsForm.errors = Object.values({ email, phone })
						.filter((i) => !!i)
						.join('; ');
				}
			}
		);

		// Открытие корзины по клику
		document.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (target.closest('.header__basket')) {
				events.emit('basket:open');
			}
		});

		// Загрузка данных
		api
			.getProductList()
			.then((items) => {
				appData.setCatalog(items);
			})
			.catch((err) => {
				console.error('Ошибка загрузки каталога:', err);
			});
	} catch (error) {
		console.error('Ошибка инициализации приложения:', error);
	}
}

document.addEventListener('DOMContentLoaded', initApp);
