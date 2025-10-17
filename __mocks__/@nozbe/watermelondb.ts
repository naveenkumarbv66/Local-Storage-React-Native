// Mock WatermelonDB for testing
const mockDatabase = {
  write: jest.fn((callback) => callback()),
  collections: {
    get: jest.fn((tableName) => ({
      create: jest.fn((updater) => {
        const newRecord = {
          id: 'mock-record-id-' + Math.random().toString(36).substring(7),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        updater(newRecord);
        return newRecord;
      }),
      find: jest.fn((id) => {
        if (id === 'existing-id') {
          return {
            id: 'existing-id',
            name: 'John Doe',
            age: 30,
            address: '123 Main St',
            isMarried: true,
            aboutHim: '{"bio":"Developer"}',
            hisFamily: '["Alice","Bob"]',
            createdAt: new Date(),
            updatedAt: new Date(),
            update: jest.fn((updater) => {
              updater({
                id: 'existing-id',
                name: 'John Doe',
                age: 30,
                address: '123 Main St',
                isMarried: true,
                aboutHim: '{"bio":"Developer"}',
                hisFamily: '["Alice","Bob"]',
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }),
            destroyPermanently: jest.fn(),
          };
        }
        throw new Error('Record not found');
      }),
      query: jest.fn(() => ({
        where: jest.fn((column, value) => ({
          fetch: jest.fn(() => {
            if (column === 'user_id' && value === 'user-123') {
              return [
                {
                  id: 'bank-1',
                  bankName: 'Chase Bank',
                  bankId: 'CHASE001',
                  userId: 'user-123',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                {
                  id: 'bank-2',
                  bankName: 'Bank of America',
                  bankId: 'BOA001',
                  userId: 'user-123',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ];
            }
            return [
              {
                id: 'user-1',
                name: 'John Doe',
                age: 30,
                address: '123 Main St',
                isMarried: true,
                aboutHim: '{"bio":"Developer"}',
                hisFamily: '["Alice","Bob"]',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];
          }),
        })),
        fetch: jest.fn(() => [
          {
            id: 'user-1',
            name: 'John Doe',
            age: 30,
            address: '123 Main St',
            isMarried: true,
            aboutHim: '{"bio":"Developer"}',
            hisFamily: '["Alice","Bob"]',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      })),
    })),
  },
};

// Mock the global database instance
let mockDatabaseInstance = mockDatabase;

// Mock SQLiteAdapter
class MockSQLiteAdapter {
  constructor(config: any) {
    // Mock adapter initialization
  }
}

// Mock Database class
class MockDatabase {
  constructor(config: any) {
    // Mock database initialization
  }

  static async open(config: any) {
    return mockDatabase;
  }
}

// Mock Model class
class MockModel {
  static table = 'mock_table';
  
  constructor(record: any) {
    Object.assign(this, record);
  }
}

// Mock User model
class MockUser extends MockModel {
  static table = 'users';
  
  aboutHim?: string;
  hisFamily?: string;
  
  getAboutHimObject() {
    return this.aboutHim ? JSON.parse(this.aboutHim) : null;
  }

  setAboutHimObject(obj: any) {
    this.aboutHim = obj ? JSON.stringify(obj) : undefined;
  }

  getHisFamilyArray() {
    return this.hisFamily ? JSON.parse(this.hisFamily) : null;
  }

  setHisFamilyArray(arr: any) {
    this.hisFamily = arr ? JSON.stringify(arr) : undefined;
  }
}

// Mock Bank model
class MockBank extends MockModel {
  static table = 'banks';
}

// Export mocks
export { MockDatabase as Database, MockSQLiteAdapter as default, MockUser as User, MockBank as Bank };
export { MockModel as Model };

// Mock decorators
export const field = (columnName: string) => (target: any, propertyKey: string) => {
  // Mock field decorator - just return the property descriptor
  return {
    value: undefined,
    writable: true,
    enumerable: true,
    configurable: true
  };
};

export const date = (columnName: string) => (target: any, propertyKey: string) => {
  // Mock date decorator - just return the property descriptor
  return {
    value: undefined,
    writable: true,
    enumerable: true,
    configurable: true
  };
};

export const readonly = (target: any, propertyKey: string) => {
  // Mock readonly decorator - just return the property descriptor
  return {
    value: undefined,
    writable: false,
    enumerable: true,
    configurable: true
  };
};

// Mock schema functions
export const appSchema = (config: any) => config;
export const tableSchema = (config: any) => config;
