# Local Storage (AsyncStorage) for React Native

This project includes a global asynchronous key-value storage wrapper built on `@react-native-async-storage/async-storage` that supports string, number, boolean, and array values. A simple UI is provided in `App.tsx` to test reading and writing values.

## Prerequisites

- Node.js and npm
- Expo CLI (project uses Expo SDK 54)

## Installation

```bash
npm install
npm install @react-native-async-storage/async-storage
```

If you're using Expo, no native linking is required. For bare React Native, follow the library docs.

## Run the app

```bash
npm run start
# or
npm run ios
npm run android
```

## Storage API

The global storage helpers live at `storage/asyncStorage/index.ts` and are accessible anywhere in the app:

- `storage.setString(key: string, value: string): Promise<void>`
- `storage.getString(key: string): Promise<string | null>`
- `storage.setNumber(key: string, value: number): Promise<void>`
- `storage.getNumber(key: string): Promise<number | null>`
- `storage.setBoolean(key: string, value: boolean): Promise<void>`
- `storage.getBoolean(key: string): Promise<boolean | null>`
- `storage.setArray<T>(key: string, value: T[]): Promise<void>`
- `storage.getArray<T>(key: string): Promise<T[] | null>`
- `storage.remove(key: string): Promise<void>`
- `storage.clearAll(): Promise<void>`

Notes:
- Strings, numbers, and booleans are stored as strings internally. Arrays are stored as JSON with a small wrapper to distinguish them on read.
- `get*` methods coerce values back to the appropriate type; if the stored type doesn't match, they return `null`.

## Usage Example

```ts
import { storage } from './storage/asyncStorage';

await storage.setString('user:name', 'Alice');
await storage.setNumber('user:age', 30);
await storage.setBoolean('flags:subscribed', true);
await storage.setArray('list:items', ['a', 'b', 'c']);

const name = await storage.getString('user:name');
const age = await storage.getNumber('user:age');
const subscribed = await storage.getBoolean('flags:subscribed');
const items = await storage.getArray<string>('list:items');
```

## Demo UI

Open the app screen to:
- Enter values for string, number, boolean, and an array (comma separated)
- Write them to storage
- Read back the values
- Remove just the demo keys
- Clear the entire storage

The demo uses the following keys:
- `demo:string`
- `demo:number`
- `demo:boolean`
- `demo:array`

## Project Structure

```
storage/
  asyncStorage/
    index.ts           # Typed helpers
App.tsx                # Simple UI to test helpers
```

## Library Docs

- AsyncStorage: `https://github.com/react-native-async-storage/async-storage`


