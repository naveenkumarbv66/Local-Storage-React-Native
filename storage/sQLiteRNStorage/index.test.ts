import * as SQLite from 'expo-sqlite';
import { SQLiteCRUD, DatabaseRecord, BankRecord } from './index';

jest.mock('expo-sqlite');

interface TestRecord extends DatabaseRecord {
  name: string;
  age: number;
  address: string;
  isMarried: boolean;
  aboutHim: Record<string, unknown> | null;
  hisFamily: unknown[] | null;
}

interface TestBankRecord extends DatabaseRecord {
  bankName: string;
  bankID: string;
  userID: number;
}

describe('SQLiteCRUD', () => {
  let mockDb: any;
  let crud: SQLiteCRUD<TestRecord>;
  let bankCrud: SQLiteCRUD<TestBankRecord>;

  beforeEach(() => {
    mockDb = {
      execSync: jest.fn(),
      runSync: jest.fn(),
      getAllSync: jest.fn(),
    };
    (SQLite.openDatabaseSync as jest.Mock).mockReturnValue(mockDb);
    crud = new SQLiteCRUD('test.db', 'users');
    bankCrud = new SQLiteCRUD('test.db', 'banks');
  });

  it('should create a user record', async () => {
    mockDb.runSync.mockReturnValue({ lastInsertRowId: 1, changes: 1 });

    const result = await crud.create({
      name: 'John',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: { bio: 'Developer' },
      hisFamily: ['Alice', 'Bob'],
    });

    expect(result).toBe(1);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      expect.arrayContaining(['John', 30, '123 Main St', 1, '{"bio":"Developer"}', '["Alice","Bob"]'])
    );
  });

  it('should create a bank record', async () => {
    mockDb.runSync.mockReturnValue({ lastInsertRowId: 1, changes: 1 });

    const result = await bankCrud.create({
      bankName: 'Chase Bank',
      bankID: 'CHASE001',
      userID: 1,
    });

    expect(result).toBe(1);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO banks'),
      expect.arrayContaining(['Chase Bank', 'CHASE001', 1])
    );
  });

  it('should read user records', async () => {
    const mockRows = [
      {
        id: 1,
        name: 'John',
        age: 30,
        address: '123 Main St',
        isMarried: 1,
        aboutHim: '{"bio":"Developer"}',
        hisFamily: '["Alice","Bob"]',
      },
    ];
    mockDb.getAllSync.mockReturnValue(mockRows);

    const result = await crud.read();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      name: 'John',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: { bio: 'Developer' },
      hisFamily: ['Alice', 'Bob'],
    });
  });

  it('should read bank records by user ID', async () => {
    const mockRows = [
      {
        id: 1,
        bankName: 'Chase Bank',
        bankID: 'CHASE001',
        userID: 1,
      },
      {
        id: 2,
        bankName: 'Bank of America',
        bankID: 'BOA001',
        userID: 1,
      },
    ];
    mockDb.getAllSync.mockReturnValue(mockRows);

    const result = await bankCrud.readByUserId(1);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      bankName: 'Chase Bank',
      bankID: 'CHASE001',
      userID: 1,
    });
    expect(result[1]).toEqual({
      id: 2,
      bankName: 'Bank of America',
      bankID: 'BOA001',
      userID: 1,
    });
  });

  it('should update a user record', async () => {
    mockDb.runSync.mockReturnValue({ changes: 1 });

    const result = await crud.update(1, {
      name: 'Jane',
      age: 25,
    });

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users'),
      expect.arrayContaining(['Jane', 25, 1])
    );
  });

  it('should update a bank record', async () => {
    mockDb.runSync.mockReturnValue({ changes: 1 });

    const result = await bankCrud.update(1, {
      bankName: 'Updated Bank',
      bankID: 'UPDATED001',
    });

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE banks'),
      expect.arrayContaining(['Updated Bank', 'UPDATED001', 1])
    );
  });

  it('should delete a user record', async () => {
    mockDb.runSync.mockReturnValue({ changes: 1 });

    const result = await crud.delete(1);

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM users'),
      [1]
    );
  });

  it('should delete a bank record', async () => {
    mockDb.runSync.mockReturnValue({ changes: 1 });

    const result = await bankCrud.delete(1);

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM banks'),
      [1]
    );
  });

  it('should delete all user records', async () => {
    mockDb.runSync.mockReturnValue({ changes: 5 });

    const result = await crud.deleteAll();

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      'DELETE FROM users',
      []
    );
  });

  it('should delete all bank records', async () => {
    mockDb.runSync.mockReturnValue({ changes: 3 });

    const result = await bankCrud.deleteAll();

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      'DELETE FROM banks',
      []
    );
  });
});
