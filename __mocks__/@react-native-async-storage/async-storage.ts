const store: Record<string, string> = {};

export default {
	setItem: jest.fn(async (key: string, value: string) => {
		store[key] = String(value);
	}),
	getItem: jest.fn(async (key: string) => {
		return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
	}),
	removeItem: jest.fn(async (key: string) => {
		delete store[key];
	}),
	clear: jest.fn(async () => {
		for (const k of Object.keys(store)) delete store[k];
	}),
};


