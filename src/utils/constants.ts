export const API_URL = process.env.API_ORIGIN + '/api/weblarek';
export const CDN_URL = process.env.API_ORIGIN + '/content/weblarek';

export const settings = {
	categoryClasses: {
		'софт-скил': 'soft',
		другое: 'other',
		дополнительное: 'additional',
		кнопка: 'button',
		'хард-скил': 'hard',
	} as Record<string, string>,

	paymentMethods: {
		card: 'online',
		cash: 'upon receipt',
	} as Record<string, string>,
};
