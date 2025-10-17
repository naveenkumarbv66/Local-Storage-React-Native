import { PouchCRUD, UserRecord, BankRecord, convertUserData, parseUserData, convertBankData, parseBankData, initDatabase } from './index';

// Mock PouchDB
jest.mock('pouchdb-core');
jest.mock('pouchdb-adapter-asyncstorage');
jest.mock('pouchdb-mapreduce');
jest.mock('pouchdb-find');

interface TestUserRecord {
  _id?: string;
  _rev?: string;
  type: 'user';
  name: string;
  age: number;
  address?: string;
  isMarried?: boolean;
  aboutHim?: string;
  hisFamily?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestBankRecord {
  _id?: string;
  _rev?: string;
  type: 'bank';
  bankName: string;
  bankId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

describe('PouchCRUD', () => {
  let userCrud: PouchCRUD<TestUserRecord>;
  let bankCrud: PouchCRUD<TestBankRecord>;

  beforeEach(async () => {
    // Initialize the database first
    await initDatabase();
    
    userCrud = new PouchCRUD<TestUserRecord>('user');
    bankCrud = new PouchCRUD<TestBankRecord>('bank');
  });

  it('should create a user record', async () => {
    const result = await userCrud.create({
      type: 'user',
      name: 'John',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: '{"bio":"Developer"}',
      hisFamily: '["Alice","Bob"]',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should create a bank record', async () => {
    const result = await bankCrud.create({
      type: 'bank',
      bankName: 'Chase Bank',
      bankId: 'CHASE001',
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should read all user records', async () => {
    const result = await userCrud.readAll();

    expect(Array.isArray(result)).toBe(true);
  });

  it('should read all bank records', async () => {
    const result = await bankCrud.readAll();

    expect(Array.isArray(result)).toBe(true);
  });

  it('should read user record by ID', async () => {
    // First create a user
    const userId = await userCrud.create({
      type: 'user',
      name: 'John',
      age: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await userCrud.readById(userId);

    expect(result).toBeDefined();
    expect(result?.name).toBe('John');
    expect(result?.age).toBe(30);
  });

  it('should return null for non-existent user ID', async () => {
    const result = await userCrud.readById('non-existent-id');

    expect(result).toBeNull();
  });

  it('should read bank records by filter', async () => {
    const result = await bankCrud.readByFilter({ userId: 'user-123' });

    expect(Array.isArray(result)).toBe(true);
  });

  it('should update a user record', async () => {
    // First create a user
    const userId = await userCrud.create({
      type: 'user',
      name: 'John',
      age: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await userCrud.update(userId, {
      name: 'Jane',
      age: 31,
    });

    expect(result).toBe(true);
  });

  it('should return false when updating non-existent user', async () => {
    const result = await userCrud.update('non-existent-id', {
      name: 'Jane',
    });

    expect(result).toBe(false);
  });

  it('should delete a user record', async () => {
    // First create a user
    const userId = await userCrud.create({
      type: 'user',
      name: 'John',
      age: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await userCrud.delete(userId);

    expect(result).toBe(true);
  });

  it('should return false when deleting non-existent user', async () => {
    const result = await userCrud.delete('non-existent-id');

    expect(result).toBe(false);
  });

  it('should delete all user records', async () => {
    const result = await userCrud.deleteAll();

    expect(result).toBe(true);
  });

  it('should delete all bank records', async () => {
    const result = await bankCrud.deleteAll();

    expect(result).toBe(true);
  });
});

describe('Data Conversion Functions', () => {
  describe('User Data Conversion', () => {
    it('should convert user data correctly', () => {
      const userData = {
        name: 'John',
        age: 30,
        aboutHim: '{"bio":"Developer"}',
        hisFamily: '["Alice","Bob"]',
      };

      const converted = convertUserData(userData);

      expect(converted.name).toBe('John');
      expect(converted.age).toBe(30);
      expect(converted.aboutHim).toBe('{"bio":"Developer"}');
      expect(converted.hisFamily).toBe('["Alice","Bob"]');
      expect(converted.type).toBe('user');
    });

    it('should handle null values in user data conversion', () => {
      const userData = {
        name: 'John',
        age: 30,
        aboutHim: undefined,
        hisFamily: undefined,
      };

      const converted = convertUserData(userData);

      expect(converted.name).toBe('John');
      expect(converted.age).toBe(30);
      expect(converted.aboutHim).toBeUndefined();
      expect(converted.hisFamily).toBeUndefined();
    });

    it('should parse user data correctly', () => {
      const mockUser = {
        _id: 'user-1',
        _rev: '1-abc123',
        type: 'user',
        name: 'John',
        age: 30,
        address: '123 Main St',
        isMarried: true,
        aboutHim: '{"bio":"Developer"}',
        hisFamily: '["Alice","Bob"]',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parseUserData(mockUser as any);

      expect(parsed._id).toBe('user-1');
      expect(parsed.name).toBe('John');
      expect(parsed.age).toBe(30);
      expect(parsed.address).toBe('123 Main St');
      expect(parsed.isMarried).toBe(true);
      expect(parsed.aboutHim).toEqual({ bio: 'Developer' });
      expect(parsed.hisFamily).toEqual(['Alice', 'Bob']);
    });

    it('should handle null values in user data parsing', () => {
      const mockUser = {
        _id: 'user-1',
        _rev: '1-abc123',
        type: 'user',
        name: 'John',
        age: 30,
        address: '123 Main St',
        isMarried: true,
        aboutHim: null,
        hisFamily: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parseUserData(mockUser as any);

      expect(parsed._id).toBe('user-1');
      expect(parsed.name).toBe('John');
      expect(parsed.age).toBe(30);
      expect(parsed.aboutHim).toBeNull();
      expect(parsed.hisFamily).toBeNull();
    });
  });

  describe('Bank Data Conversion', () => {
    it('should convert bank data correctly', () => {
      const bankData = {
        bankName: 'Chase Bank',
        bankId: 'CHASE001',
        userId: 'user-123',
      };

      const converted = convertBankData(bankData);

      expect(converted.bankName).toBe('Chase Bank');
      expect(converted.bankId).toBe('CHASE001');
      expect(converted.userId).toBe('user-123');
      expect(converted.type).toBe('bank');
    });

    it('should parse bank data correctly', () => {
      const mockBank = {
        _id: 'bank-1',
        _rev: '1-def456',
        type: 'bank',
        bankName: 'Chase Bank',
        bankId: 'CHASE001',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parseBankData(mockBank as any);

      expect(parsed._id).toBe('bank-1');
      expect(parsed.bankName).toBe('Chase Bank');
      expect(parsed.bankId).toBe('CHASE001');
      expect(parsed.userId).toBe('user-123');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty objects in user data conversion', () => {
      const userData = {
        name: 'John',
        age: 30,
        aboutHim: '{}',
        hisFamily: '[]',
      };

      const converted = convertUserData(userData);

      expect(converted.aboutHim).toBe('{}');
      expect(converted.hisFamily).toBe('[]');
    });

    it('should handle complex nested objects', () => {
      const userData = {
        name: 'John',
        age: 30,
        aboutHim: '{"bio":"Developer","skills":["React","Node.js"],"contact":{"email":"john@example.com"}}',
        hisFamily: '["Alice","Bob","Charlie"]',
      };

      const converted = convertUserData(userData);

      expect(converted.aboutHim).toBe('{"bio":"Developer","skills":["React","Node.js"],"contact":{"email":"john@example.com"}}');
      expect(converted.hisFamily).toBe('["Alice","Bob","Charlie"]');
    });
  });
});
