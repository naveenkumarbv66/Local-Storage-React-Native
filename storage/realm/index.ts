import Realm from 'realm';
import { realmConfig, User, Bank } from './schemas';

// Generic Realm CRUD Operations
export class RealmCRUD<T extends Realm.Object> {
  private realm: Realm | null = null;
  private isAvailable: boolean = false;
  private objectType: string;

  constructor(objectType: string) {
    this.objectType = objectType;
    this.initRealm();
  }

  private async initRealm() {
    try {
      if (Realm.open) {
        this.realm = await Realm.open(realmConfig);
        this.isAvailable = true;
      }
    } catch (error) {
      console.warn('Realm not available:', error);
      this.isAvailable = false;
    }
  }

  private ensureRealm() {
    if (!this.isAvailable || !this.realm) {
      throw new Error('Realm not available. Use a Dev Client (not Expo Go).');
    }
  }

  // Create
  async create(data: Partial<T>): Promise<string> {
    this.ensureRealm();
    try {
      const now = new Date();
      const objectData = {
        _id: new Realm.BSON.ObjectId(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      this.realm!.write(() => {
        this.realm!.create(this.objectType, objectData);
      });

      return objectData._id.toString();
    } catch (error) {
      throw error;
    }
  }

  // Read all
  async readAll(): Promise<T[]> {
    this.ensureRealm();
    try {
      const objects = this.realm!.objects<T>(this.objectType);
      return Array.from(objects);
    } catch (error) {
      throw error;
    }
  }

  // Read by ID
  async readById(id: string): Promise<T | null> {
    this.ensureRealm();
    try {
      const object = this.realm!.objectForPrimaryKey(this.objectType, new Realm.BSON.ObjectId(id));
      return object as T || null;
    } catch (error) {
      throw error;
    }
  }

  // Read by filter
  async readByFilter(filter: string, ...args: any[]): Promise<T[]> {
    this.ensureRealm();
    try {
      const objects = this.realm!.objects<T>(this.objectType).filtered(filter, ...args);
      return Array.from(objects);
    } catch (error) {
      throw error;
    }
  }

  // Update
  async update(id: string, data: Partial<T>): Promise<boolean> {
    this.ensureRealm();
    try {
      const object = this.realm!.objectForPrimaryKey(this.objectType, new Realm.BSON.ObjectId(id));
      if (!object) {
        return false;
      }

      this.realm!.write(() => {
        Object.assign(object, { ...data, updatedAt: new Date() });
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete
  async delete(id: string): Promise<boolean> {
    this.ensureRealm();
    try {
      const object = this.realm!.objectForPrimaryKey(this.objectType, new Realm.BSON.ObjectId(id));
      if (!object) {
        return false;
      }

      this.realm!.write(() => {
        this.realm!.delete(object);
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete all
  async deleteAll(): Promise<boolean> {
    this.ensureRealm();
    try {
      const objects = this.realm!.objects<T>(this.objectType);
      this.realm!.write(() => {
        this.realm!.delete(objects);
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Close realm
  close() {
    if (this.realm) {
      this.realm.close();
      this.realm = null;
      this.isAvailable = false;
    }
  }
}

// Global instances for easy access
export const userRealm = new RealmCRUD<User>('User');
export const bankRealm = new RealmCRUD<Bank>('Bank');

// Helper functions for data conversion
export const convertUserData = (data: any) => ({
  name: data.name || '',
  age: data.age || 0,
  address: data.address || '',
  isMarried: data.isMarried || false,
  aboutHim: data.aboutHim ? JSON.stringify(data.aboutHim) : '{}',
  hisFamily: data.hisFamily ? JSON.stringify(data.hisFamily) : '[]',
});

export const convertBankData = (data: any) => ({
  bankName: data.bankName || '',
  bankID: data.bankID || '',
  userID: data.userID ? new Realm.BSON.ObjectId(data.userID) : new Realm.BSON.ObjectId(),
});

export const parseUserData = (user: User) => ({
  _id: user._id.toString(),
  name: user.name,
  age: user.age,
  address: user.address,
  isMarried: user.isMarried,
  aboutHim: user.aboutHim ? JSON.parse(user.aboutHim) : null,
  hisFamily: user.hisFamily ? JSON.parse(user.hisFamily) : null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const parseBankData = (bank: Bank) => ({
  _id: bank._id.toString(),
  bankName: bank.bankName,
  bankID: bank.bankID,
  userID: bank.userID.toString(),
  createdAt: bank.createdAt,
  updatedAt: bank.updatedAt,
});

// Export types
export type UserData = {
  _id?: string;
  name: string;
  age: number;
  address: string;
  isMarried: boolean;
  aboutHim: Record<string, unknown> | null;
  hisFamily: unknown[] | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type BankData = {
  _id?: string;
  bankName: string;
  bankID: string;
  userID: string;
  createdAt?: Date;
  updatedAt?: Date;
};
