import * as SecureStore from 'expo-secure-store';

type StorablePrimitive = string | number | boolean;
type JsonObject = Record<string, unknown>;

function wrap(value: unknown): string {
	return JSON.stringify({ __wrapped: true, value });
}

function unwrap<T = unknown>(raw: string | null): T | null {
	if (raw == null) return null;
	try {
		const parsed = JSON.parse(raw);
		if (parsed && parsed.__wrapped) {
			return parsed.value as T;
		}
		// Fallback for plain strings
		return raw as unknown as T;
	} catch {
		return raw as unknown as T;
	}
}

/**
 * expo-secure-store requires keys to be non-empty and only include
 * alphanumeric characters, period, underscore, or hyphen.
 * This function normalizes any provided key to a safe format.
 */
function normalizeKey(key: string): string {
	const normalized = key.replace(/[^A-Za-z0-9._-]/g, '_');
	if (!normalized) {
		throw new Error('Invalid key: becomes empty after normalization');
	}
	return normalized;
}

export const secureStorage = {
	// strings
	async setString(key: string, value: string): Promise<void> {
		await SecureStore.setItemAsync(normalizeKey(key), wrap(value));
	},
	async getString(key: string): Promise<string | null> {
		const v = unwrap<string>(await SecureStore.getItemAsync(normalizeKey(key)));
		return typeof v === 'string' || v == null ? v : null;
	},

	// numbers
	async setNumber(key: string, value: number): Promise<void> {
		await SecureStore.setItemAsync(normalizeKey(key), wrap(value));
	},
	async getNumber(key: string): Promise<number | null> {
		const v = unwrap<number>(await SecureStore.getItemAsync(normalizeKey(key)));
		return typeof v === 'number' ? v : null;
	},

	// booleans
	async setBoolean(key: string, value: boolean): Promise<void> {
		await SecureStore.setItemAsync(normalizeKey(key), wrap(value));
	},
	async getBoolean(key: string): Promise<boolean | null> {
		const v = unwrap<boolean>(await SecureStore.getItemAsync(normalizeKey(key)));
		return typeof v === 'boolean' ? v : null;
	},

	// arrays
	async setArray<T = unknown>(key: string, value: T[]): Promise<void> {
		await SecureStore.setItemAsync(normalizeKey(key), wrap(value));
	},
	async getArray<T = unknown>(key: string): Promise<T[] | null> {
		const v = unwrap<T[] | null>(await SecureStore.getItemAsync(normalizeKey(key)));
		return Array.isArray(v) ? v : null;
	},

	// JSON object
	async setJson<T extends JsonObject = JsonObject>(key: string, value: T): Promise<void> {
		await SecureStore.setItemAsync(normalizeKey(key), wrap(value));
	},
	async getJson<T extends JsonObject = JsonObject>(key: string): Promise<T | null> {
		const v = unwrap<T | null>(await SecureStore.getItemAsync(normalizeKey(key)));
		return v && typeof v === 'object' && !Array.isArray(v) ? (v as T) : null;
	},

	async remove(key: string): Promise<void> {
		await SecureStore.deleteItemAsync(normalizeKey(key));
	},

	async clearAll(): Promise<void> {
		// expo-secure-store has no clear-all API; track keys if needed.
		throw new Error('clearAll is not supported by expo-secure-store. Remove keys individually.');
	},
};

export type SecureStorage = typeof secureStorage;


