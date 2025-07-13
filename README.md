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
1. **Model (AppState + LarekAPI)**:
    AppState хранит: 
    - IProduct[] (каталог товаров)
    - IProduct[] (товары в корзине)
    - IOrder (данные заказа)
    LarekAPI работает с:
    - IProduct (загрузка товаров)
    - IOrder (оформление заказа)

2. **View**:
   - `Page` - главная страница
   - `Card` - компонент карточки товара
   - `Modal` - модальное окно
   - `Basket` - компонент корзины
   - `OrderForm` - форма заказа
   - `ContactsForm` - форма контактов
   - `Success` - сообщение об успешном заказе

3. **Presenter**:
   - Координирует взаимодействие между Model и View
   - Обрабатывает пользовательские события
   - Управляет состоянием приложения

4. **EventEmitter**:
   - Брокер событий для связи между компонентами
   - Реализует паттерн Publisher/Subscriber
   - Центральный компонент, связывает все части приложения через события (Events.*)
   - Получает события от View и перенаправляет их Model
   - Уведомляет View об изменениях в Model

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