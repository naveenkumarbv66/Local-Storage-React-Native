# Local Storage (AsyncStorage + Encrypted Storage) for React Native

This project includes:
- A global AsyncStorage wrapper (`storage/asyncStorage`) for string, number, boolean, array, JSON.
- A global Encrypted Storage wrapper (`storage/encryptedStorage`) for string, number, boolean, array, and JSON object.
- An MMKV example screen (`storage/mmkvRC/MMKVReactNativeStorage.tsx`) for string, number, boolean, array, JSON.
- A SQLite CRUD wrapper (`storage/sQLiteRNStorage`) with generic database operations.
- A Global Secure Storage screen using predefined keys.
Simple test UIs are provided and accessible from the home screen.

## Prerequisites

- Node.js and npm
- Expo CLI (project uses Expo SDK 54)

## Installation

```bash
npm install
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
npm install react-native-mmkv
npm install expo-sqlite
```

If you're using Expo, no native linking is required. For bare React Native, follow the library docs.

## Run the app

```bash
npm run start
# or
npm run ios      # opens in Expo Go
npm run android  # opens in Expo Go
```

## Run tests

```bash
npm test
```

The project uses Jest with `jest-expo`. Async and Encrypted storage are mocked for predictable unit testing.

## Using MMKV (requires Dev Client)

MMKV is a native module and will NOT work in Expo Go. You need a development client or a bare build.

- Local dev client (Expo Run):

```bash
# iOS (requires Xcode)
npm run ios:dev

# Android (requires Android SDK/Emulator)
npm run android:dev
```

- EAS development build:

```bash
# iOS dev build
eas build --profile development --platform ios

# Android dev build
eas build --profile development --platform android

# After installing the dev client on the device/emulator
expo start
# Then open the project with the installed development client
```

- If you must stay on Expo Go: Use the AsyncStorage or Encrypted Storage (expo-secure-store) demos. MMKV will show "MMKV not available. Use a Dev Client (not Expo Go)" until you run a dev client.

## Using SQLite (requires Dev Client)

SQLite is a native module and will NOT work in Expo Go. You need a development client or a bare build.

- Local dev client (Expo Run):

```bash
# iOS (requires Xcode)
npm run ios:dev

# Android (requires Android SDK/Emulator)
npm run android:dev
```

- EAS development build:

```bash
# iOS dev build
eas build --profile development --platform ios

# Android dev build
eas build --profile development --platform android

# After installing the dev client on the device/emulator
expo start
# Then open the project with the installed development client
```

- If you must stay on Expo Go: Use the AsyncStorage or Encrypted Storage (expo-secure-store) demos. SQLite will show "SQLite not available. Use a Dev Client (not Expo Go)" until you run a dev client.

## Scripts overview

- `npm run android` / `npm run ios`: Launch in Expo Go (works with AsyncStorage and Secure Store demos)
- `npm run android:dev` / `npm run ios:dev`: Build and launch a native development client (required for MMKV and SQLite)

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

## Storage API (SQLite)

The SQLite CRUD wrapper lives at `storage/sQLiteRNStorage/index.ts` and provides generic database operations:

- `SQLiteCRUD<T>.create(data: Omit<T, 'id'>): Promise<number>`
- `SQLiteCRUD<T>.read(id?: number): Promise<T[]>`
- `SQLiteCRUD<T>.update(id: number, data: Partial<Omit<T, 'id'>>): Promise<boolean>`
- `SQLiteCRUD<T>.delete(id: number): Promise<boolean>`
- `SQLiteCRUD<T>.deleteAll(): Promise<boolean>`

Global instance: `sqliteDB` (pre-configured for 'users' table)

Notes:
- Strings, numbers, and booleans are stored as strings internally. Arrays are stored as JSON with a small wrapper to distinguish them on read.
- `get*` methods coerce values back to the appropriate type; if the stored type doesn't match, they return `null`.
- SQLite operations are synchronous but wrapped in Promises for consistency.

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

// SQLite usage
import { sqliteDB } from './storage/sQLiteRNStorage';

const userId = await sqliteDB.create({
  name: 'John Doe',
  age: 30,
  address: '123 Main St',
  isMarried: true,
  aboutHim: { bio: 'Developer' },
  hisFamily: ['Alice', 'Bob'],
});

const users = await sqliteDB.read();
const updated = await sqliteDB.update(userId, { age: 31 });
const deleted = await sqliteDB.delete(userId);
```

## Test coverage (what we verify)

- AsyncStorage wrapper: set/get for string, number, boolean, array, JSON; remove; clearAll.
- Encrypted wrapper (expo-secure-store): set/get for primitives, array, JSON; remove keys; note: clearAll not supported.
- SQLite CRUD: create, read, update, delete, deleteAll operations with proper data serialization.

## Troubleshooting

- Using Expo Go: encrypted storage uses `expo-secure-store` (works in Go). If you switch to `react-native-encrypted-storage`, you must build a dev client or a bare app.
- SecureStore key rules: keys must be alphanumeric plus `. _ -`. The wrapper normalizes keys (e.g., `user:profile` becomes `user_profile`).

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

The SQLite demo uses a 'users' table with columns:
- id (auto-increment primary key)
- name, age, address, isMarried, aboutHim, hisFamily
- createdAt, updatedAt (timestamps)

## Project Structure

```
storage/
  asyncStorage/
    index.ts           # Typed helpers
  encryptedStorage/
    index.ts           # Encrypted typed helpers
    EncryptedStorageRN.tsx
  global/
    keys.ts            # Global key definitions
    GlobalLocalStorageScreen.tsx
  mmkvRC/
    MMKVReactNativeStorage.tsx # MMKV demo screen
  sQLiteRNStorage/
    index.ts           # Generic CRUD operations
    SQLiteRNStorage.tsx # SQLite demo screen
App.tsx                # Simple UI to test helpers
```

## Library Docs

- AsyncStorage: `https://github.com/react-native-async-storage/async-storage`
- Encrypted Storage (Expo Secure Store): `https://docs.expo.dev/versions/latest/sdk/securestore/`
- MMKV: `https://github.com/mrousavy/react-native-mmkv`
- SQLite (Expo): `https://docs.expo.dev/versions/latest/sdk/sqlite/`


