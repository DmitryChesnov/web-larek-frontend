# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
### Сборка

```
npm run build
```

или

```
yarn build
```

#### Архитектура
Приложение использует паттерн MVP (Model-View-Presenter) с брокером событий.

##### Основные компоненты
Базовый код состоит из Центрального компонента - Обработчика событий (EventEmitter), Модели данных(Model), и Отображений (View). Модель данных получает изменения данных от Обработчика событий EventEmitter и отправляет свои изменения данных в EventEmitter. Всвою очередь, EventEmitter обрабатывает события в отображении View и отправляет их в Модель данных, а также получает данные из Модели данных и отправляет их в отображение.

Модель данных состоит из двух компонентов: данные о состоянии приложения (AppState) и обмен данными с сервером(LarekAPI).
1. **Model AppState** 
Содержит следующие данные о состоянии приложения:
class AppState {
// Каталог товаров  private _catalog: 
IProduct[
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;] = []; 

// Товары в корзине  private _basket: IProduct[Данные те же] = []; 

// Данные заказа  private _order: IOrder = { 
    payment: string,
    address: string,
    email: string,
    phone: string,
    items: string[],
    total: number
  };
// ID просматриваемого товара  private _preview: string | null = null; 

Cодержит следующие методы работы с корзиной:

//Добавить  addToBasket(product: IProduct): void {
    this._basket.push(product);
    this.updateBasket();
  }

//Удалить  removeFromBasket(id: string): void {
    this._basket = this._basket.filter(item => item.id !== id);
    this.updateBasket();
  }

//Очистить  clearBasket(): void {
    this._basket = [];
    this.updateBasket();
  }

// Методы работы с заказом
//Поле заказа  setOrderField(field: keyof IOrderForm, value: string): void {
    this._order[field] = value;
    this.validateOrder();
  }

//Поле контактов  setContactsField(field: keyof IContactsForm, value: string): void {
    this._order[field] = value;
    this.validateContacts();
  }

//Валидация
  private validateOrder(): boolean {
    /* ... */
  }
}

2. **Model LarekAPI**
Содержит следующие данные о взаимодействии с сервером:
class LarekAPI {
  constructor(
    private _baseUrl: string,
    private _cdnUrl: string // Добавляем CDN-адрес для изображений
  ) {}

  // Уточненный метод получения товаров
  async getProductList(): Promise<IApiProduct[]> {
    const response = await fetch(`${this._baseUrl}/product`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
  // Детализированный метод оформления заказа
  async orderProducts(order: IApiOrder): Promise<IApiOrderResult> {
    const response = await fetch(`${this._baseUrl}/order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this._token}` // Если требуется авторизация
      },
      body: JSON.stringify({
        ...order,
        items: order.items.map(id => ({ id })) // Форматирование под API
      })
    });
    if (!response.ok) throw new Error(`Order failed: ${response.statusText}`);
    return response.json();
  }
  // Новый метод для получения CDN-путей
  getImageUrl(path: string): string {
    return `${this._cdnUrl}/${path}`;
  }
}

**View** (Отображения). Данный Модуль состоит из отображений Страницы (Page), Карточки (Card), Модального окна (Modal), Корзины (Basket),  Формы Заказа (OrderForm), Формы контактов (ContactsForm), `Success` - сообщение об успешном заказе.

   - **Page** - главная страница содержит:
   class Page extends Component {
  // Элементы DOM
  private _counter: HTMLElement; // Счетчик корзины
  private _catalog: HTMLElement; // Контейнер каталога
  private _wrapper: HTMLElement; // Основной контейнер
  private _basket: HTMLElement; // Кнопка корзины

  constructor(
    container: HTMLElement,
    protected events: EventEmitter
  ) {
    super(container);
    // Инициализация элементов
    this._counter = container.querySelector('.header__basket-counter');
    this._catalog = container.querySelector('.gallery');
    this._wrapper = container.querySelector('.page__wrapper');
    this._basket = container.querySelector('.header__basket');

    // Обработчики событий
    this._basket.addEventListener('click', () => {
      events.emit(Events.BASKET_OPEN);
    });
  }

  // Методы обновления
  set counter(value: number) {
    this.setText(this._counter, String(value));
  }

  set catalog(items: HTMLElement[]) {
    this._catalog.replaceChildren(...items);
  }
}
   **Card** - компонент карточки товара содержит:
class Card extends Component<ICard> {
  // Элементы DOM
  private _title: HTMLElement;
  private _image?: HTMLImageElement;
  private _price: HTMLElement;
  private _button?: HTMLButtonElement;

  constructor(
    protected blockName: string,
    protected events: ICardActions
  ) {
    super('card');

    // Инициализация элементов
    this._title = this.container.querySelector(`.card__title`);
    this._image = this.container.querySelector(`.card__image`);
    this._price = this.container.querySelector(`.card__price`);
    this._button = this.container.querySelector(`.button`);

    // Настройка обработчиков
    if (this._button) {
      this._button.addEventListener('click', events.onClick);
    } else {
      this.container.addEventListener('click', events.onClick);
    }
  }

  // Методы рендеринга
  render(data: ICard): HTMLElement {
    this.title = data.title;
    this.price = data.price;
    /* ... */
    return this.container;
  }
}

   **Modal** - модальное окно содержит:
   class Modal extends Component {
  private _closeButton: HTMLButtonElement;
  private _content: HTMLElement;

  constructor(
    container: HTMLElement,
    protected events: EventEmitter
  ) {
    super(container);
    this._closeButton = container.querySelector('.modal__close');
    this._content = container.querySelector('.modal__content');

    this._closeButton.addEventListener('click', this.close.bind(this));
    this.container.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  private handleOutsideClick(e: MouseEvent): void {
    if (e.target === this.container) {
      this.close();
    }
  }

  render(data: IModalData): void {
    this._content.replaceChildren(data.content);
    this.toggleClass(this.container, 'modal_active', true);
  }
}
   **Basket** - компонент корзины содержит:
import { IBasketView, IProduct } from '../types';

class Basket {
  private items: HTMLElement[] = [];
  private total = 0;

  constructor(private container: HTMLElement) {}
//Инициализирует экземпляр корзины.
Принимает контейнер (DOM-элемент), куда будет рендериться корзина.
Сохраняет переданный контейнер в приватное поле класса для последующего использования.

  render(items: IProduct[]): HTMLElement {
    this.items = items.map((item, index) => this.createItemElement(item, index + 1));
    this.total = items.reduce((sum, item) => sum + (item.price || 0), 0);
//Создает и возвращает DOM-структуру корзины.
Преобразует массив товаров (items) в HTML-элементы (через createItemElement).
Рассчитывает общую сумму заказа.
Генерирует HTML-шаблон корзины с:
Списком товаров
Итоговой стоимостью
Возвращает готовый DOM-элемент для вставки в модальное окно.
    const basketTemplate = `
      <div class="basket">
        <h2 class="modal__title">Корзина</h2>
        <ul class="basket__list">${this.items.join('')}</ul>
        <div class="modal__actions">
          <span class="basket__price">${this.total} синапсов</span>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = basketTemplate;
    return wrapper.firstElementChild as HTMLElement;
  }
  private createItemElement(item: IProduct, index: number): string {
    return `
      <li class="basket__item">
        <span class="basket__item-index">${index}</span>
        <span class="card__title">${item.title}</span>
        <span class="card__price">${item.price} синапсов</span>
        <button class="basket__item-delete" data-id="${item.id}"></button>
      </li>
    `;
  }
}
export default Basket;

   **OrderForm** - форма заказа содержит:
import { IOrderForm, FormErrors } from '../types';

class OrderForm {
  private form: HTMLFormElement;
  private paymentButtons: HTMLButtonElement[] = [];
  private errors: HTMLElement;

  constructor(container: HTMLFormElement, protected events: EventEmitter) {
    this.form = container;
    this.paymentButtons = Array.from(container.querySelectorAll('.button_alt'));
    this.errors = container.querySelector('.form__errors') as HTMLElement;

    this.paymentButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.togglePayment(button);
        events.emit('order.payment:change', { button });
      });
    });

    this.form.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const field = target.name as keyof IOrderForm;
      const value = target.value;
      events.emit('order.input:change', { field, value });
    });
  }
//Инициализация формы заказа.
Конструктор 
- Получает DOM-элемент формы (container) и экземпляр EventEmitter для управления событиями.
- Находит все кнопки выбора способа оплаты (.button_alt) и сохраняет их в массив paymentButtons.
- Находит элемент для вывода ошибок (.form__errors).
Навешивает обработчики событий:
- Клик по кнопкам оплаты → вызывает togglePayment и генерирует событие order.payment:change.
- Ввод данных в поля формы → генерирует событие order.input:change с данными поля.
  togglePayment(button: HTMLButtonElement): void {
    this.paymentButtons.forEach(btn => {
      btn.classList.toggle('button_alt-active', btn === button);
    });
  }
//Переключает стиль выбранного способа оплаты.
Проходит по всем кнопкам оплаты (paymentButtons).
Добавляет/удаляет класс button_alt-active:
Добавляет к выбранной кнопке (button).
Удаляет у остальных.
Визуальный эффект: выделяет активный способ оплаты (например, меняет цвет).
  set errors(value: FormErrors) {
    this.errors.textContent = Object.values(value).join('; ');
  }

  render(state: IOrderForm & { valid: boolean }): void {
    const { payment, address, valid } = state;
    this.form.address.value = address || '';
    this.togglePayment(
      this.paymentButtons.find(btn => btn.name === payment) || this.paymentButtons[0]
    );
    (this.form.querySelector('button[type="submit"]') as HTMLButtonElement).disabled = !valid;
  }
}
Render Обновляет форму на основе текущего состояния.
Принимает объект state с:
payment — выбранный способ оплаты.
address — введенный адрес.
valid — флаг валидности формы.
Обновляет DOM:
Заполняет поле адреса (address).
Выделяет кнопку текущего способа оплаты (через togglePayment).
Блокирует/разблокирует кнопку отправки (если valid = false → кнопка неактивна).//

export default OrderForm;
1.Конструктор настраивает форму и обработчики.
2. При выборе оплаты togglePayment меняет UI, а события уходят в EventEmitter.
3. Метод render синхронизирует форму с актуальными данными (например, после валидации).

   **ContactsForm** - форма контактов содержит:
import { IContactsForm, FormErrors } from '../types';

class ContactsForm {
  private form: HTMLFormElement;
  private errors: HTMLElement;

  constructor(container: HTMLFormElement, protected events: EventEmitter) {
    this.form = container;
    this.errors = container.querySelector('.form__errors') as HTMLElement;

    this.form.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const field = target.name as keyof IContactsForm;
      const value = target.value;
      events.emit('contacts.input:change', { field, value });
    });
  }
//constructor Принимает:
- container — DOM-элемент формы (<form>).
- events — экземпляр EventEmitter для отправки событий.
Находит элементы:
Поле для вывода ошибок (.form__errors).
Навешивает обработчики:
На все поля ввода (input) → генерирует событие contacts.input:change с данными:

  set errors(value: FormErrors) {
    this.errors.textContent = Object.values(value).join('; ');
  }

  render(state: IContactsForm & { valid: boolean }): void {
    const { email, phone, valid } = state;
    this.form.email.value = email || '';
    this.form.phone.value = phone || '';
    (this.form.querySelector('button[type="submit"]') as HTMLButtonElement).disabled = !valid;
  }
}
//render Обновляет форму на основе текущих данных.
Принимает объект состояния:
email — введенная почта.
phone — введенный телефон.
valid — флаг валидности формы.
Обновляет DOM:
Заполняет поля email и phone переданными значениями.
Блокирует кнопку отправки, если valid = false

export default ContactsForm; 
   **Success** - сообщение об успешном заказе содержит:

import { ISuccess } from '../types';

class Success {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    const closeButton = container.querySelector('.order-success__close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.container.classList.remove('modal_active');
      });
    }
  }
//constructor осуществляет инициализацию компонента успешного заказа.
Принимает: container — DOM-элемент (например, <div id="success">), куда будет вставлено сообщение.
Находит кнопку закрытия (.order-success__close) и:
Добавляет обработчик клика → закрывает модальное окно (удаляет класс modal_active).

  render(data: ISuccess): void {
    const template = `
      <div class="order-success">
        <h2 class="order-success__title">Заказ оформлен</h2>
        <p class="order-success__description">Списано ${data.total} синапсов</p>
        <button class="button order-success__close">За новыми покупками!</button>
      </div>
    `;
        this.container.innerHTML = template;
  }
}
// render  показывает пользователю итоги заказа.
Принимает данные:
total (число) — итоговая сумма заказа.
Генерирует HTML:
Заголовок "Заказ оформлен".
Текст с суммой (например, "Списано 5000 синапсов").
Кнопка "За новыми покупками!".
Вставляет HTML в container.

export default Success;

 **EventEmitter**:
   - Брокер событий для связи между компонентами
   - Реализует паттерн Publisher/Subscriber
   - Центральный компонент, связывает все части приложения через события (Events.*)
   - Получает события от View и перенаправляет их Model
   - Уведомляет View об изменениях в Model
EventEmitter содержит:
type Handler<T = any> = (data?: T) => void;
//Типизация Т позволяет передавать типизированные данные между компонентами.

class EventEmitter {
  private events: Record<string, Handler[]> = {};
//Хранилище всех подписок на события. Каждое событие — ключ объекта, значением является массив функций-обработчиков.
  on<T>(event: string, callback: Handler<T>): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
//Метод on<T> Подписка на событие.
Получает имя события (event) и функцию-обработчик (callback).
Если для события нет подписчиков — создает пустой массив.
Добавляет callback в массив обработчиков этого события.
  emit<T>(event: string, data?: T): void {
    const handlers = this.events[event];
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
//Метод emit<T> Генерация события.
Ищет все обработчики для события event.
Если обработчики есть — вызывает каждый, передавая data.
Если данных нет (data === undefined), обработчики вызываются без аргументов

  off(event: string, callback: Handler): void {
    const handlers = this.events[event];
    if (handlers) {
      this.events[event] = handlers.filter(handler => handler !== callback);
    }
  }
}
//Метод off - Отписка от события.
Находит массив обработчиков для event.
Удаляет переданный callback из массива.
Если обработчиков не осталось — ничего не делает.

export default EventEmitter;

###### Типы данных
Все типы определены в `src/types/index.ts`:
// Типы данных API
interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

interface IOrderForm {
    payment: string;
    address: string;
}

interface IContactsForm {
    email: string;
    phone: string;
}

interface IOrder extends IOrderForm, IContactsForm {
    items: string[];
    total: number;
}

// Состояние приложения
interface IAppState {
    catalog: IProduct[];
    basket: IProduct[];
    order: IOrder | null;
    preview: string | null;
}

// События
FormErrors = Partial<Record<keyof IOrder, string>>;

IBasketCard {
    index: number;
    title: string;
    price: number;
}

ICardActions {
    onClick: (event: MouseEvent) => void;
}

ISuccessActions {
    onClick: () => void;
}

IModalData {
    content: HTMLElement;
}

IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

// Компоненты
interface ICard {
    title: string;
    category?: string;
    description?: string;
    image?: string;
    price: number | null;
    index?: number;
    buttonTitle?: string;
}

interface IBasketView {
    items: HTMLElement[];
    total: number;
}

interface IFormState {
    valid: boolean;
    errors: string[];
}

interface ISuccess {
    description: number;
}

// API клиент
interface ILarekAPI {
    getProductList: () => Promise<IProduct[]>;
    getProductItem: (id: string) => Promise<IProduct>;
    orderProducts: (order: IOrder) => Promise<IOrder>;
}

// Перечисление событий
enum Events {
    ITEMS_CHANGED = 'items:changed',
    CARD_SELECT = 'card:select',
    BASKET_OPEN = 'basket:open',
    ORDER_OPEN = 'order:open',
    CONTACTS_OPEN = 'contacts:open',
    ORDER_SUBMIT = 'order:submit',
    CONTACTS_SUBMIT = 'contacts:submit',
    FORM_ERRORS_CHANGE = 'formErrors:change',
    MODAL_OPEN = 'modal:open',
    MODAL_CLOSE = 'modal:close',
    SUCCESS_OPEN = 'success:open',
}

Поток данных: Пользователь → View → EventEmitter → Model → EventEmitter → View → Пользователь

###### UML-схема
C:\Users\User\Desktop\YANDEX_PRAKTIKUM\repo\web-larek-frontend\Arhitekture.png