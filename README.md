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

### SQLite Features:
- **Generic CRUD operations**: Create, Read, Update, Delete with type safety
- **Automatic table creation**: Tables are created automatically on first use
- **Data serialization**: JSON objects and arrays are automatically serialized/deserialized
- **Type safety**: Full TypeScript support with generic types
- **Error handling**: Graceful error handling with runtime availability checks
- **Expo Go compatibility**: Shows helpful error messages when not available

### SQLite Table Schema:
The default 'users' table includes:
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT NOT NULL)
- `age` (INTEGER)
- `address` (TEXT)
- `isMarried` (INTEGER DEFAULT 0)
- `aboutHim` (TEXT) - JSON serialized
- `hisFamily` (TEXT) - JSON serialized array
- `createdAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- `updatedAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### SQLite API Details:
- Uses `expo-sqlite` with synchronous operations (`openDatabaseSync`, `runSync`, `getAllSync`)
- Operations are wrapped in Promises for async/await compatibility
- Returns proper TypeScript types with automatic JSON parsing
- Boolean values are stored as integers (0/1) and converted back to booleans

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

- **AsyncStorage wrapper**: set/get for string, number, boolean, array, JSON; remove; clearAll.
- **Encrypted wrapper (expo-secure-store)**: set/get for primitives, array, JSON; remove keys; note: clearAll not supported.
- **MMKV wrapper**: set/get for string, number, boolean, array, JSON; remove; clearAll.
- **SQLite CRUD**: create, read, update, delete, deleteAll operations with proper data serialization.

### Test Details:
- **11 tests total** across 4 test suites
- All storage types have comprehensive unit tests
- Mocks are provided for all native modules
- Tests verify data serialization/deserialization
- Error handling and edge cases are covered

## Troubleshooting

### Expo Go Limitations:
- **AsyncStorage**: ✅ Works in Expo Go
- **Encrypted Storage (expo-secure-store)**: ✅ Works in Expo Go
- **MMKV**: ❌ Requires Dev Client - shows "MMKV not available. Use a Dev Client (not Expo Go)"
- **SQLite**: ❌ Requires Dev Client - shows "SQLite not available. Use a Dev Client (not Expo Go)"

### Common Issues:
- **SecureStore key rules**: keys must be alphanumeric plus `. _ -`. The wrapper normalizes keys (e.g., `user:profile` becomes `user_profile`).
- **Native module errors**: If you see "Runtime not ready" or "undefined" errors, you're likely in Expo Go. Use a Dev Client for MMKV and SQLite.
- **Android SDK errors**: For dev builds, ensure Android SDK is properly configured with `ANDROID_HOME` environment variable.

### Development Client Setup:
1. **For MMKV/SQLite**: Use `npm run android:dev` or `npm run ios:dev`
2. **For EAS builds**: Use `eas build --profile development`
3. **For Expo Go**: Stick to AsyncStorage and Encrypted Storage demos

## Demo UI

The app provides 6 different storage demos accessible from the home screen:

### 1. AsyncStorage Demo
- Enter values for string, number, boolean, array (comma separated), and JSON
- Write them to storage, read back values, remove keys, clear storage
- **Demo keys**: `demo:string`, `demo:number`, `demo:boolean`, `demo:array`, `demo:json`

### 2. Encrypted Storage Demo
- Secure storage using expo-secure-store
- Same data types as AsyncStorage but encrypted
- **Demo keys**: `enc:string`, `enc:number`, `enc:boolean`, `enc:array`, `enc:json`

### 3. MMKV Demo
- High-performance key-value storage
- Requires Dev Client (shows error message in Expo Go)
- Same data types with synchronous operations

### 4. Global Secure Storage Demo
- Uses predefined global keys from `storage/global/keys.ts`
- Stores user profile data (name, age, address, isMarried, aboutHim, hisFamily)
- Uses encrypted storage with global key management

### 5. SQLite Demo
- Full CRUD operations with a 'users' table
- Create, Read, Update, Delete users with complex data types
- **Table schema**: id, name, age, address, isMarried, aboutHim, hisFamily, createdAt, updatedAt
- Requires Dev Client (shows error message in Expo Go)

### 6. Navigation
- Simple navigation between all demo screens
- Back buttons to return to home screen
- Status messages for all operations

## Project Structure

```
storage/
  asyncStorage/
    index.ts                    # AsyncStorage typed helpers
    asyncStorageScreen.tsx      # AsyncStorage demo UI
    index.test.ts              # AsyncStorage unit tests
  encryptedStorage/
    index.ts                    # Encrypted storage helpers (expo-secure-store)
    EncryptedStorageRN.tsx      # Encrypted storage demo UI
    index.test.ts              # Encrypted storage unit tests
  global/
    keys.ts                     # Global key definitions (KEYS enum)
    GlobalLocalStorageScreen.tsx # Global secure storage demo UI
  mmkvRC/
    MMKVReactNativeStorage.tsx  # MMKV demo screen
    index.test.ts              # MMKV unit tests
  sQLiteRNStorage/
    index.ts                    # Generic SQLite CRUD operations
    SQLiteRNStorage.tsx         # SQLite demo screen
    index.test.ts              # SQLite unit tests
__mocks__/
  @react-native-async-storage/async-storage.ts  # AsyncStorage mock
  expo-secure-store.ts         # Secure store mock
  react-native-mmkv.ts         # MMKV mock
  expo-sqlite.ts              # SQLite mock
App.tsx                        # Main app with navigation
package.json                   # Dependencies and scripts
README.md                      # This documentation
```

## Library Docs

- AsyncStorage: `https://github.com/react-native-async-storage/async-storage`
- Encrypted Storage (Expo Secure Store): `https://docs.expo.dev/versions/latest/sdk/securestore/`
- MMKV: `https://github.com/mrousavy/react-native-mmkv`
- SQLite (Expo): `https://docs.expo.dev/versions/latest/sdk/sqlite/`


