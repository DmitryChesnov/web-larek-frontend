import { API_URL, CDN_URL } from '../utils/constants';
import { IProduct, IOrder } from '../types';

export class LarekAPI {
	constructor(
		private baseUrl: string = API_URL,
		private cdnUrl: string = CDN_URL
	) {}

	async getProductList(): Promise<IProduct[]> {
		try {
			const response = await fetch(`${this.baseUrl}/product`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			console.log('API response:', data);
			return data.items.map((item: any) => ({
				id: item.id,
				title: item.title,
				price: item.price,
				category: item.category,
				description: item.description,
				image: `${this.cdnUrl}/${item.image}`,
			}));
		} catch (error) {
			console.error('Error fetching products:', error);
			return [];
		}
	}

	async orderProducts(order: IOrder): Promise<{ id: string }> {
		try {
			const response = await fetch(`${this.baseUrl}/order`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...order,
					items: order.items.map((id) => ({ id })),
				}),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		} catch (error) {
			console.error('Error placing order:', error);
			throw error;
		}
	}
}
