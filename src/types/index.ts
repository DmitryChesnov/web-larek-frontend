// Типы данных API
export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	button?: string;
}

export interface IOrderForm {
	payment: string;
	address: string;
	email: string;
	phone: string;
}

export interface IOrder extends IOrderForm {
	items: string[];
	total: number;
}

export interface IContactsForm {
	email: string;
	phone: string;
}

export interface IOrder extends IOrderForm, IContactsForm {
	items: string[];
	total: number;
}

// Состояние приложения
export interface IAppState {
	catalog: IProduct[];
	basket: IProduct[];
	order: IOrder | null;
	preview: string | null;
}

export interface IFormErrors {
	payment?: string;
	address?: string;
	email?: string;
	phone?: string;
}

// События
export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IBasketCard {
	index: number;
	title: string;
	price: number;
}

export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ISuccessActions {
	onClick: () => void;
}

export interface IModalData {
	content: HTMLElement;
}

export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

// Компоненты
export interface ICard {
	title: string;
	category?: string;
	description?: string;
	image?: string;
	price: number | null;
	index?: number;
	buttonTitle?: string;
}

export interface IBasketView {
	items: HTMLElement[];
	total: number;
}
export interface IBasketUpdate {
	items: IProduct[];
	count: number;
	total: number;
}

export interface IFormState {
	valid: boolean;
	errors: string[];
}

export interface ISuccess {
	description?: string;
	total: number;
}
// API клиент
export interface ILarekAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	orderProducts: (order: IOrder) => Promise<IOrder>;
}

// Перечисление событий
export enum Events {
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
