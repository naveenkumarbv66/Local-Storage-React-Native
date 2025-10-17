import * as SQLite from 'expo-sqlite';
import { SQLiteCRUD, DatabaseRecord } from './index';

jest.mock('expo-sqlite');

interface TestRecord extends DatabaseRecord {
  name: string;
  age: number;
  address: string;
  isMarried: boolean;
  aboutHim: Record<string, unknown> | null;
  hisFamily: unknown[] | null;
}

describe('SQLiteCRUD', () => {
  let mockDb: any;
  let crud: SQLiteCRUD<TestRecord>;

  beforeEach(() => {
    mockDb = {
      execSync: jest.fn(),
      runSync: jest.fn(),
      getAllSync: jest.fn(),
    };
    (SQLite.openDatabaseSync as jest.Mock).mockReturnValue(mockDb);
    crud = new SQLiteCRUD('test.db', 'test_table');
  });

  it('should create a record', async () => {
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
      expect.stringContaining('INSERT INTO test_table'),
      expect.arrayContaining(['John', 30, '123 Main St', 1, '{"bio":"Developer"}', '["Alice","Bob"]'])
    );
  });

  it('should read records', async () => {
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

  it('should update a record', async () => {
    mockDb.runSync.mockReturnValue({ changes: 1 });

    const result = await crud.update(1, {
      name: 'Jane',
      age: 25,
    });

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE test_table'),
      expect.arrayContaining(['Jane', 25, 1])
    );
  });

  it('should delete a record', async () => {
    mockDb.runSync.mockReturnValue({ changes: 1 });

    const result = await crud.delete(1);

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM test_table'),
      [1]
    );
  });

  it('should delete all records', async () => {
    mockDb.runSync.mockReturnValue({ changes: 5 });

    const result = await crud.deleteAll();

    expect(result).toBe(true);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      'DELETE FROM test_table',
      []
    );
  });
});
