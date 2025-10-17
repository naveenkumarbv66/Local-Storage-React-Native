const store: Record<string, string> = {};

export const setItemAsync = jest.fn(async (key: string, value: string) => {
	store[key] = value;
});

export const getItemAsync = jest.fn(async (key: string) => {
	return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
});

export const deleteItemAsync = jest.fn(async (key: string) => {
	delete store[key];
});


