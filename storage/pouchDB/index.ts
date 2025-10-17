import PouchDB from 'pouchdb-core';
import AsyncStorageAdapter from 'pouchdb-adapter-asyncstorage';
import MapReduce from 'pouchdb-mapreduce';
import Find from 'pouchdb-find';

// Register PouchDB plugins
PouchDB.plugin(AsyncStorageAdapter);
PouchDB.plugin(MapReduce);
PouchDB.plugin(Find);

import { UserDocument, BankDocument, CreateDocument, UpdateDocument, DocumentType } from './schemas';

// Initialize PouchDB database
let pouchDB: any | null = null;

// Mock PouchDB for when the real one is not available
function createMockPouchDB() {
  const mockStore: any[] = [];
  let idCounter = 1;

  return {
    put: async (doc: any) => {
      const existingIndex = mockStore.findIndex(d => d._id === doc._id);
      if (existingIndex >= 0) {
        mockStore[existingIndex] = { ...doc, _rev: `2-mockrev-${idCounter++}` };
        return { id: doc._id, rev: mockStore[existingIndex]._rev, ok: true };
      } else {
        const newDoc = { ...doc, _id: doc._id || `mock-id-${idCounter++}`, _rev: `1-mockrev-${idCounter++}` };
        mockStore.push(newDoc);
        return { id: newDoc._id, rev: newDoc._rev, ok: true };
      }
    },
    get: async (id: string) => {
      const doc = mockStore.find(d => d._id === id);
      if (!doc) {
        const error: any = new Error('Document not found');
        error.status = 404;
        throw error;
      }
      return doc;
    },
    find: async (query: any) => {
      let docs = [...mockStore];
      
      if (query.selector) {
        for (const key in query.selector) {
          docs = docs.filter(d => d[key] === query.selector[key]);
        }
      }
      
      if (query.sort) {
        const sortField = query.sort[0]?.[0];
        const sortOrder = query.sort[0]?.[1];
        if (sortField) {
          docs.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (sortOrder === 'desc') {
              return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
            } else {
              return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            }
          });
        }
      }
      
      return { docs };
    },
    remove: async (doc: any) => {
      const index = mockStore.findIndex(d => d._id === doc._id);
      if (index >= 0) {
        mockStore.splice(index, 1);
        return { id: doc._id, rev: `3-mockrev-${idCounter++}`, ok: true };
      }
      const error: any = new Error('Document not found');
      error.status = 404;
      throw error;
    },
    bulkDocs: async (docs: any[]) => {
      const results = [];
      const mockDB = {
        put: async (doc: any) => {
          const existingIndex = mockStore.findIndex(d => d._id === doc._id);
          if (existingIndex >= 0) {
            mockStore[existingIndex] = { ...doc, _rev: `2-mockrev-${idCounter++}` };
            return { id: doc._id, rev: mockStore[existingIndex]._rev, ok: true };
          } else {
            const newDoc = { ...doc, _id: doc._id || `mock-id-${idCounter++}`, _rev: `1-mockrev-${idCounter++}` };
            mockStore.push(newDoc);
            return { id: newDoc._id, rev: newDoc._rev, ok: true };
          }
        },
        remove: async (doc: any) => {
          const index = mockStore.findIndex(d => d._id === doc._id);
          if (index >= 0) {
            mockStore.splice(index, 1);
            return { id: doc._id, rev: `3-mockrev-${idCounter++}`, ok: true };
          }
          const error: any = new Error('Document not found');
          error.status = 404;
          throw error;
        }
      };
      
      for (const doc of docs) {
        try {
          if (doc._deleted) {
            await mockDB.remove(doc);
            results.push({ id: doc._id, rev: doc._rev, ok: true });
          } else {
            const result = await mockDB.put(doc);
            results.push(result);
          }
        } catch (error) {
          results.push({ id: doc._id, error: true, name: 'not_found', message: 'missing' });
        }
      }
      return results;
    },
    createIndex: async () => ({ result: 'created' }),
    allDocs: async (options: any) => {
      const rows = mockStore.map(d => ({ 
        id: d._id, 
        key: d._id, 
        doc: options.include_docs ? d : undefined 
      }));
      return { rows };
    }
  };
}

export const initDatabase = async (): Promise<any> => {
  if (pouchDB) {
    return pouchDB;
  }

  try {
    // Try to create PouchDB with AsyncStorage adapter
    try {
      pouchDB = new PouchDB('localStoragePouchDB', {
        adapter: 'asyncstorage',
      });
    } catch (adapterError) {
      // Fallback to default adapter if AsyncStorage fails
      console.warn('AsyncStorage adapter failed, using default adapter:', adapterError);
      pouchDB = new PouchDB('localStoragePouchDB');
    }

    // Create indexes for better query performance (optional, don't fail if this doesn't work)
    try {
      await pouchDB.createIndex({
        index: { fields: ['type'] }
      });

      await pouchDB.createIndex({
        index: { fields: ['type', 'userId'] }
      });
    } catch (indexError) {
      console.warn('Index creation failed, continuing without indexes:', indexError);
    }

    return pouchDB;
  } catch (error) {
    console.warn('PouchDB not available:', error);
    // Create a mock PouchDB for development/testing
    pouchDB = createMockPouchDB();
    return pouchDB;
  }
};

export const getDatabase = (): any => {
  if (!pouchDB) {
    throw new Error('PouchDB not initialized. Call initDatabase() first.');
  }
  return pouchDB;
};

// Generic CRUD operations for PouchDB
export class PouchCRUD<T extends DocumentType> {
  private db: any;
  private documentType: string;

  constructor(documentType: string) {
    this.documentType = documentType;
    this.db = getDatabase();
  }

  // Create
  async create(data: CreateDocument<T>): Promise<string> {
    try {
      const doc = {
        ...data,
        type: this.documentType,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T;

      const result = await this.db.put(doc);
      return result.id;
    } catch (error: any) {
      throw error;
    }
  }

  // Read All
  async readAll(): Promise<T[]> {
    try {
      const result = await this.db.find({
        selector: { type: this.documentType },
        sort: [{ createdAt: 'desc' }]
      });
      return result.docs as T[];
    } catch (error: any) {
      throw error;
    }
  }

  // Read by ID
  async readById(id: string): Promise<T | null> {
    try {
      const doc = await this.db.get(id);
      if (doc.type === this.documentType) {
        return doc as T;
      }
      return null;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Read by filter
  async readByFilter(filter: Partial<T>): Promise<T[]> {
    try {
      const selector: any = { type: this.documentType };
      
      // Add filter conditions
      Object.keys(filter).forEach(key => {
        if (key !== 'type' && filter[key as keyof T] !== undefined) {
          selector[key] = filter[key as keyof T];
        }
      });

      const result = await this.db.find({
        selector,
        sort: [{ createdAt: 'desc' }]
      });
      return result.docs as T[];
    } catch (error: any) {
      throw error;
    }
  }

  // Update
  async update(id: string, data: UpdateDocument<T>): Promise<boolean> {
    try {
      const existingDoc = await this.db.get(id);
      
      if (existingDoc.type !== this.documentType) {
        return false;
      }

      const updatedDoc = {
        ...existingDoc,
        ...data,
        updatedAt: new Date(),
      };

      await this.db.put(updatedDoc);
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  // Delete
  async delete(id: string): Promise<boolean> {
    try {
      const doc = await this.db.get(id);
      if (doc.type !== this.documentType) {
        return false;
      }
      await this.db.remove(doc);
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  // Delete All
  async deleteAll(): Promise<boolean> {
    try {
      const docs = await this.readAll();
      if (docs.length === 0) {
        return true;
      }

      const docsToDelete = docs.map(doc => ({
        _id: doc._id!,
        _rev: doc._rev!,
        _deleted: true
      }));

      await this.db.bulkDocs(docsToDelete);
      return true;
    } catch (error: any) {
      throw error;
    }
  }
}

// Helper functions for data conversion
export function convertUserData(data: Partial<UserDocument>): CreateDocument<UserDocument> {
  const convertJsonField = (field: any): string | undefined => {
    if (!field) return undefined;
    
    // If it's already a string, return it
    if (typeof field === 'string') return field;
    
    // If it's an object or array, stringify it
    if (typeof field === 'object') {
      try {
        return JSON.stringify(field);
      } catch (error) {
        console.warn('Failed to stringify field:', field, error);
        return undefined;
      }
    }
    
    return undefined;
  };

  return {
    type: 'user',
    name: data.name || '',
    age: data.age || 0,
    address: data.address,
    isMarried: data.isMarried,
    aboutHim: convertJsonField(data.aboutHim),
    hisFamily: convertJsonField(data.hisFamily),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function parseUserData(pouchUser: UserDocument): UserDocument {
  const parseJsonField = (field: string | undefined): any => {
    if (!field) return null;
    
    // If it's already an object, return it
    if (typeof field === 'object') return field;
    
    // If it's a string, try to parse it
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (error) {
        console.warn('Failed to parse JSON field:', field, error);
        return null;
      }
    }
    
    return null;
  };

  return {
    ...pouchUser,
    aboutHim: parseJsonField(pouchUser.aboutHim),
    hisFamily: parseJsonField(pouchUser.hisFamily),
  };
}

export function convertBankData(data: Partial<BankDocument>): CreateDocument<BankDocument> {
  return {
    type: 'bank',
    bankName: data.bankName || '',
    bankId: data.bankId || '',
    userId: data.userId || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function parseBankData(pouchBank: BankDocument): BankDocument {
  return {
    ...pouchBank,
  };
}

// Global instances for easy access (lazy initialization)
let _userPouch: PouchCRUD<UserDocument> | null = null;
let _bankPouch: PouchCRUD<BankDocument> | null = null;

export const userPouch = {
  get instance() {
    if (!_userPouch) {
      _userPouch = new PouchCRUD<UserDocument>('user');
    }
    return _userPouch;
  }
};

export const bankPouch = {
  get instance() {
    if (!_bankPouch) {
      _bankPouch = new PouchCRUD<BankDocument>('bank');
    }
    return _bankPouch;
  }
};

// Type definitions for external use
export interface UserRecord {
  _id?: string;
  _rev?: string;
  name: string;
  age: number;
  address?: string;
  isMarried?: boolean;
  aboutHim?: Record<string, unknown> | null;
  hisFamily?: unknown[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BankRecord {
  _id?: string;
  _rev?: string;
  bankName: string;
  bankId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
