import * as SecureStore from 'expo-secure-store';
import { secureStorage } from './index';

jest.mock('expo-secure-store');

describe('storage/encryptedStorage (expo-secure-store)', () => {
	it('stores and retrieves primitives, arrays, and json', async () => {
		await secureStorage.setString('enc:string', 'hi');
		await secureStorage.setNumber('enc:number', 7);
		await secureStorage.setBoolean('enc:boolean', false);
		await secureStorage.setArray('enc:array', ['x', 'y']);
		await secureStorage.setJson('enc:json', { a: true });

		expect(await secureStorage.getString('enc:string')).toBe('hi');
		expect(await secureStorage.getNumber('enc:number')).toBe(7);
		expect(await secureStorage.getBoolean('enc:boolean')).toBe(false);
		expect(await secureStorage.getArray<string>('enc:array')).toEqual(['x', 'y']);
		expect(await secureStorage.getJson<{ a: boolean }>('enc:json')).toEqual({ a: true });
	});

	it('remove individual keys', async () => {
		await secureStorage.setString('enc:string', 'bye');
		expect(await secureStorage.getString('enc:string')).toBe('bye');
		await secureStorage.remove('enc:string');
		expect(await secureStorage.getString('enc:string')).toBeNull();
	});
});


