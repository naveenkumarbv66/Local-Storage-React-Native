# Local Storage (AsyncStorage + Encrypted Storage) for React Native

This project includes:
- A global AsyncStorage wrapper (`storage/asyncStorage`) for string, number, boolean, array.
- A global Encrypted Storage wrapper (`storage/encryptedStorage`) for string, number, boolean, array, and JSON object.
Simple test UIs are provided and accessible from the home screen.

## Prerequisites

- Node.js and npm
- Expo CLI (project uses Expo SDK 54)

## Installation

```bash
npm install
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
```

If you're using Expo, no native linking is required. For bare React Native, follow the library docs.

## Run the app

```bash
npm run start
# or
npm run ios
npm run android
```

## Storage API (Async)

The global storage helpers live at `storage/asyncStorage/index.ts` and are accessible anywhere in the app:

- `storage.setString(key: string, value: string): Promise<void>`
- `storage.getString(key: string): Promise<string | null>`
- `storage.setNumber(key: string, value: number): Promise<void>`
- `storage.getNumber(key: string): Promise<number | null>`
- `storage.setBoolean(key: string, value: boolean): Promise<void>`
- `storage.getBoolean(key: string): Promise<boolean | null>`
- `storage.setArray<T>(key: string, value: T[]): Promise<void>`
- `storage.getArray<T>(key: string): Promise<T[] | null>`
- `storage.setJson<T extends object>(key: string, value: T): Promise<void>`
- `storage.getJson<T extends object>(key: string): Promise<T | null>`
- `storage.remove(key: string): Promise<void>`
- `storage.clearAll(): Promise<void>`

## Storage API (Encrypted)

The encrypted storage helpers live at `storage/encryptedStorage/index.ts` and are backed by `expo-secure-store` (compatible with Expo Go):

- `secureStorage.setString(key: string, value: string): Promise<void>`
- `secureStorage.getString(key: string): Promise<string | null>`
- `secureStorage.setNumber(key: string, value: number): Promise<void>`
- `secureStorage.getNumber(key: string): Promise<number | null>`
- `secureStorage.setBoolean(key: string, value: boolean): Promise<void>`
- `secureStorage.getBoolean(key: string): Promise<boolean | null>`
- `secureStorage.setArray<T>(key: string, value: T[]): Promise<void>`
- `secureStorage.getArray<T>(key: string): Promise<T[] | null>`
- `secureStorage.setJson<T extends object>(key: string, value: T): Promise<void>`
- `secureStorage.getJson<T extends object>(key: string): Promise<T | null>`
- `secureStorage.remove(key: string): Promise<void>`
- `secureStorage.clearAll(): Promise<void>` (not supported by expo-secure-store; remove keys individually; calling will throw)

Notes:
- Strings, numbers, and booleans are stored as strings internally. Arrays are stored as JSON with a small wrapper to distinguish them on read.
- `get*` methods coerce values back to the appropriate type; if the stored type doesn't match, they return `null`.

## Usage Example

```ts
import { storage } from './storage/asyncStorage';
import { secureStorage } from './storage/encryptedStorage';

await storage.setString('user:name', 'Alice');
await storage.setNumber('user:age', 30);
await storage.setBoolean('flags:subscribed', true);
await storage.setArray('list:items', ['a', 'b', 'c']);
await storage.setJson('prefs:ui', { theme: 'dark' });

const name = await storage.getString('user:name');
const age = await storage.getNumber('user:age');
const subscribed = await storage.getBoolean('flags:subscribed');
const items = await storage.getArray<string>('list:items');
const prefs = await storage.getJson<{ theme: string }>('prefs:ui');

await secureStorage.setJson('user:profile', { id: 1, name: 'Alice' });
const profile = await secureStorage.getJson<{ id: number; name: string }>('user:profile');
```

## Demo UI

Open the app screen to:
- Enter values for string, number, boolean, and an array (comma separated)
- Write them to storage
- Read back the values
- Remove just the demo keys
- Clear the entire storage

The AsyncStorage demo uses the following keys:
- `demo:string`
- `demo:number`
- `demo:boolean`
- `demo:array`
- `demo:json`

The Encrypted Storage demo uses the following keys:
- `enc:string`
- `enc:number`
- `enc:boolean`
- `enc:array`
- `enc:json`

## Project Structure

```
storage/
  asyncStorage/
    index.ts           # Typed helpers
  encryptedStorage/
    index.ts           # Encrypted typed helpers
    EncryptedStorageRN.tsx
App.tsx                # Simple UI to test helpers
```

## Library Docs

- AsyncStorage: `https://github.com/react-native-async-storage/async-storage`
- Encrypted Storage (Expo Secure Store): `https://docs.expo.dev/versions/latest/sdk/securestore/`


