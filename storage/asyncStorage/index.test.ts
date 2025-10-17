import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from './index';

jest.mock('@react-native-async-storage/async-storage');

describe('storage/asyncStorage', () => {
	it('stores and retrieves string, number, boolean, array, json', async () => {
		await storage.setString('demo:string', 'hello');
		await storage.setNumber('demo:number', 42);
		await storage.setBoolean('demo:boolean', true);
		await storage.setArray('demo:array', ['a', 'b']);
		await storage.setJson('demo:json', { x: 1 });

		expect(await storage.getString('demo:string')).toBe('hello');
		expect(await storage.getNumber('demo:number')).toBe(42);
		expect(await storage.getBoolean('demo:boolean')).toBe(true);
		expect(await storage.getArray<string>('demo:array')).toEqual(['a', 'b']);
		expect(await storage.getJson<{ x: number }>('demo:json')).toEqual({ x: 1 });
	});

	it('remove and clear', async () => {
		await storage.setString('k', 'v');
		expect(await storage.getString('k')).toBe('v');
		await storage.remove('k');
		expect(await storage.getString('k')).toBeNull();
		await storage.setString('k1', 'v1');
		await storage.setString('k2', 'v2');
		await storage.clearAll();
		expect(await storage.getString('k1')).toBeNull();
		expect(await storage.getString('k2')).toBeNull();
	});
});


