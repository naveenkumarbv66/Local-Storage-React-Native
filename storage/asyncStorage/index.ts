import AsyncStorage from '@react-native-async-storage/async-storage';

type Primitive = string | number | boolean;
type JsonObject = Record<string, unknown>;

function isPrimitive(value: unknown): value is Primitive {
	return (
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean'
	);
}

/**
 * Serialize supported values for storage. Arrays are stored as JSON.
 */
function serialize(value: Primitive | unknown[] | JsonObject): string {
	if (Array.isArray(value)) {
		return JSON.stringify({ __type: 'array', value });
	}
	if (value && typeof value === 'object') {
		return JSON.stringify({ __type: 'object', value });
	}
	if (isPrimitive(value)) {
		return String(value);
	}
	throw new Error('Unsupported value type. Only string, number, boolean, or arrays are allowed.');
}

/**
 * Attempt to parse JSON arrays; otherwise return raw string.
 */
function deserialize(raw: string | null): string | number | boolean | unknown[] | JsonObject | null {
	if (raw == null) return null;
	try {
		const parsed = JSON.parse(raw);
		if (parsed && parsed.__type === 'array') {
			return Array.isArray(parsed.value) ? parsed.value : [];
		}
		if (parsed && parsed.__type === 'object') {
			return parsed.value && typeof parsed.value === 'object' ? (parsed.value as JsonObject) : {};
		}
		// Not our wrapped JSON; try to coerce primitives
		if (raw === 'true') return true;
		if (raw === 'false') return false;
		const asNum = Number(raw);
		return Number.isNaN(asNum) ? raw : asNum;
	} catch {
		// raw wasn't JSON; coerce to primitive if applicable
		if (raw === 'true') return true;
		if (raw === 'false') return false;
		const asNum = Number(raw);
		return Number.isNaN(asNum) ? raw : asNum;
	}
}

export const storage = {
	/** Save a string */
	async setString(key: string, value: string): Promise<void> {
		await AsyncStorage.setItem(key, serialize(value));
	},
	/** Get a string (or null if absent/other type) */
	async getString(key: string): Promise<string | null> {
		const v = deserialize(await AsyncStorage.getItem(key));
		return typeof v === 'string' || v == null ? (v as string | null) : null;
	},

	/** Save a number */
	async setNumber(key: string, value: number): Promise<void> {
		await AsyncStorage.setItem(key, serialize(value));
	},
	/** Get a number (or null) */
	async getNumber(key: string): Promise<number | null> {
		const v = deserialize(await AsyncStorage.getItem(key));
		return typeof v === 'number' ? v : null;
	},

	/** Save a boolean */
	async setBoolean(key: string, value: boolean): Promise<void> {
		await AsyncStorage.setItem(key, serialize(value));
	},
	/** Get a boolean (or null) */
	async getBoolean(key: string): Promise<boolean | null> {
		const v = deserialize(await AsyncStorage.getItem(key));
		return typeof v === 'boolean' ? v : null;
	},

	/** Save an array (stores via JSON) */
	async setArray<T = unknown>(key: string, value: T[]): Promise<void> {
		await AsyncStorage.setItem(key, serialize(value));
	},
	/** Get an array (or null) */
	async getArray<T = unknown>(key: string): Promise<T[] | null> {
		const v = deserialize(await AsyncStorage.getItem(key));
		return Array.isArray(v) ? (v as T[]) : null;
	},

	/** Save a JSON object */
	async setJson<T extends JsonObject = JsonObject>(key: string, value: T): Promise<void> {
		await AsyncStorage.setItem(key, serialize(value));
	},
	/** Get a JSON object (or null) */
	async getJson<T extends JsonObject = JsonObject>(key: string): Promise<T | null> {
		const v = deserialize(await AsyncStorage.getItem(key));
		return v && typeof v === 'object' && !Array.isArray(v) ? (v as T) : null;
	},

	/** Remove a key */
	async remove(key: string): Promise<void> {
		await AsyncStorage.removeItem(key);
	},

	/** Clear all keys (app scope) */
	async clearAll(): Promise<void> {
		await AsyncStorage.clear();
	},
};

export type Storage = typeof storage;


