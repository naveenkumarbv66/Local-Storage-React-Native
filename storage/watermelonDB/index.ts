import { Database, Model } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { mySchema } from './schemas';
import { User, Bank } from './models';

// Database setup
let database: Database | null = null;
let isAvailable = false;

// Initialize database
export const initDatabase = async (): Promise<Database> => {
  if (database) {
    return database;
  }

  try {
    const adapter = new SQLiteAdapter({
      dbName: 'localStorageWatermelon', // Custom database name
      schema: mySchema,
      // Optional: Add migrations here if needed
      // migrations,
      // Optional: Add synchronous mode for better performance
      // synchronous: true,
    });

    database = new Database({
      adapter,
      modelClasses: [User, Bank],
    });

    isAvailable = true;
    return database;
  } catch (error) {
    console.warn('WatermelonDB not available:', error);
    isAvailable = false;
    throw error;
  }
};

// Get database instance
export const getDatabase = (): Database => {
  if (!isAvailable || !database) {
    throw new Error('WatermelonDB not available. Use a Dev Client (not Expo Go).');
  }
  return database;
};

// Generic CRUD operations for any model
export class WatermelonCRUD<T extends Model> {
  private modelClass: typeof Model;
  private tableName: string;

  constructor(modelClass: typeof Model, tableName: string) {
    this.modelClass = modelClass;
    this.tableName = tableName;
  }

  // Create
  async create(data: Partial<T>): Promise<string> {
    const db = getDatabase();
    let newRecordId: string | undefined;

    await db.write(async () => {
      const newRecord = await db.collections.get(this.tableName).create((record: any) => {
        // Only assign non-readonly properties
        const { createdAt, updatedAt, ...assignableData } = data as any;
        Object.assign(record, assignableData);
        // createdAt and updatedAt are handled automatically by the @readonly @date decorators
      });
      newRecordId = newRecord.id;
    });

    return newRecordId || '';
  }

  // Read All
  async readAll(): Promise<T[]> {
    const db = getDatabase();
    const records = await db.collections.get(this.tableName).query().fetch();
    return records as T[];
  }

  // Read by ID
  async readById(id: string): Promise<T | null> {
    const db = getDatabase();
    try {
      const record = await db.collections.get(this.tableName).find(id);
      return record as T;
    } catch (error) {
      return null;
    }
  }

  // Read by filter
  async readByFilter(column: string, value: any): Promise<T[]> {
    const db = getDatabase();
    try {
      const records = await db.collections.get(this.tableName)
        .query()
        .fetch();
      // Filter in memory since WatermelonDB query API is more complex
      return records.filter((record: any) => record[column] === value) as T[];
    } catch (error) {
      console.warn('WatermelonDB not available:', error);
      return [];
    }
  }

  // Update
  async update(id: string, data: Partial<T>): Promise<boolean> {
    const db = getDatabase();
    try {
      const record = await db.collections.get(this.tableName).find(id);

      await db.write(async () => {
        await record.update((updatedRecord: any) => {
          // Only assign non-readonly properties
          const { createdAt, updatedAt, ...assignableData } = data as any;
          Object.assign(updatedRecord, assignableData);
          // updatedAt is handled automatically by the @readonly @date decorator
        });
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // Delete
  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    try {
      const record = await db.collections.get(this.tableName).find(id);

      await db.write(async () => {
        await record.destroyPermanently();
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // Delete All
  async deleteAll(): Promise<boolean> {
    const db = getDatabase();
    try {
      const records = await db.collections.get(this.tableName).query().fetch();

      await db.write(async () => {
        for (const record of records) {
          await record.destroyPermanently();
        }
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Helper functions for data conversion
export function convertUserData(data: Partial<UserRecord>): Partial<User> {
  // Exclude readonly properties from conversion
  const { createdAt, updatedAt, ...userData } = data;
  return {
    ...userData,
    aboutHim: data.aboutHim ? JSON.stringify(data.aboutHim) : undefined,
    hisFamily: data.hisFamily ? JSON.stringify(data.hisFamily) : undefined,
  };
}

export function parseUserData(watermelonUser: User): UserRecord {
  return {
    id: watermelonUser.id,
    name: watermelonUser.name,
    age: watermelonUser.age,
    address: watermelonUser.address,
    isMarried: watermelonUser.isMarried,
    aboutHim: watermelonUser.getAboutHimObject(),
    hisFamily: watermelonUser.getHisFamilyArray(),
    createdAt: watermelonUser.createdAt,
    updatedAt: watermelonUser.updatedAt,
  };
}

export function convertBankData(data: Partial<BankRecord>): Partial<Bank> {
  // Exclude readonly properties from conversion
  const { createdAt, updatedAt, ...bankData } = data;
  return {
    ...bankData,
  };
}

export function parseBankData(watermelonBank: Bank): BankRecord {
  return {
    id: watermelonBank.id,
    bankName: watermelonBank.bankName,
    bankId: watermelonBank.bankId,
    userId: watermelonBank.userId,
    createdAt: watermelonBank.createdAt,
    updatedAt: watermelonBank.updatedAt,
  };
}

// Type definitions
export interface WatermelonRecord {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface UserRecord extends WatermelonRecord {
  name: string;
  age: number;
  address?: string;
  isMarried?: boolean;
  aboutHim?: Record<string, unknown> | null;
  hisFamily?: unknown[] | null;
}

export interface BankRecord extends WatermelonRecord {
  bankName: string;
  bankId: string;
  userId: string;
}

// Global instances for easy access
export const userWatermelon = new WatermelonCRUD<User>(User, 'users');
export const bankWatermelon = new WatermelonCRUD<Bank>(Bank, 'banks');
