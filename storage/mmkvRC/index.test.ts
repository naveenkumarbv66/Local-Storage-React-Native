import { MMKV } from 'react-native-mmkv';

jest.mock('react-native-mmkv', () => {
  const store: Record<string, any> = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key: string, value: any) => {
        store[key] = value;
      },
      getString: (key: string) => {
        const v = store[key];
        return typeof v === 'string' ? v : null;
      },
      getNumber: (key: string) => {
        const v = store[key];
        return typeof v === 'number' ? v : null;
      },
      getBoolean: (key: string) => {
        const v = store[key];
        return typeof v === 'boolean' ? v : null;
      },
      contains: (key: string) => Object.prototype.hasOwnProperty.call(store, key),
      delete: (key: string) => {
        delete store[key];
      },
      clearAll: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
    })),
  };
});

describe('MMKV storage', () => {
  it('stores and retrieves primitives, array (json-wrapped), and object', () => {
    const mmkv = new MMKV();
    mmkv.set('mmkv:string', 'hello');
    mmkv.set('mmkv:number', 11);
    mmkv.set('mmkv:boolean', true);
    mmkv.set('mmkv:array', JSON.stringify({ __type: 'array', value: ['a', 'b'] }));
    mmkv.set('mmkv:json', JSON.stringify({ __type: 'object', value: { z: 9 } }));

    expect(mmkv.getString('mmkv:string')).toBe('hello');
    expect(mmkv.getNumber('mmkv:number')).toBe(11);
    expect(mmkv.getBoolean('mmkv:boolean')).toBe(true);
    expect(mmkv.getString('mmkv:array')).toBe(JSON.stringify({ __type: 'array', value: ['a', 'b'] }));
    expect(mmkv.getString('mmkv:json')).toBe(JSON.stringify({ __type: 'object', value: { z: 9 } }));
  });

  it('remove and clear', () => {
    const mmkv = new MMKV();
    mmkv.set('k', 'v');
    expect(mmkv.getString('k')).toBe('v');
    mmkv.delete('k');
    expect(mmkv.getString('k')).toBeNull();
    mmkv.set('k1', 'v1');
    mmkv.set('k2', 'v2');
    mmkv.clearAll();
    expect(mmkv.getString('k1')).toBeNull();
    expect(mmkv.getString('k2')).toBeNull();
  });
});


