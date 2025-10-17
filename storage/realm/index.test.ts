import Realm from 'realm';
import { RealmCRUD, userRealm, bankRealm, convertUserData, convertBankData, parseUserData, parseBankData } from './index';

jest.mock('realm');

// Mock data
const mockUser = {
  _id: 'user-123',
  name: 'John Doe',
  age: 30,
  address: '123 Main St',
  isMarried: true,
  aboutHim: '{"bio":"Developer"}',
  hisFamily: '["Alice","Bob"]',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBank = {
  _id: 'bank-123',
  bankName: 'Chase Bank',
  bankID: 'CHASE001',
  userID: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RealmCRUD', () => {
  let mockRealm: any;
  let crud: RealmCRUD<any>;

  beforeEach(() => {
    mockRealm = {
      write: jest.fn((callback) => callback()),
      create: jest.fn(),
      objects: jest.fn(() => [mockUser]),
      objectForPrimaryKey: jest.fn(() => mockUser),
      delete: jest.fn(),
      close: jest.fn(),
    };

    (Realm.open as jest.Mock).mockResolvedValue(mockRealm);
    crud = new RealmCRUD('User');
  });

  it('should create a record', async () => {
    const result = await crud.create({
      name: 'John',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: '{"bio":"Developer"}',
      hisFamily: '["Alice","Bob"]',
    });

    expect(result).toBeDefined();
    expect(mockRealm.write).toHaveBeenCalled();
    expect(mockRealm.create).toHaveBeenCalledWith('User', expect.objectContaining({
      name: 'John',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: '{"bio":"Developer"}',
      hisFamily: '["Alice","Bob"]',
    }));
  });

  it('should read all records', async () => {
    const result = await crud.readAll();

    expect(result).toEqual([mockUser]);
    expect(mockRealm.objects).toHaveBeenCalledWith('User');
  });

  it('should read by ID', async () => {
    const result = await crud.readById('user-123');

    expect(result).toEqual(mockUser);
    expect(mockRealm.objectForPrimaryKey).toHaveBeenCalledWith('User', expect.any(Object));
  });

  it('should read by filter', async () => {
    // Mock the filtered method to return the user
    mockRealm.objects = jest.fn(() => ({
      filtered: jest.fn(() => [mockUser]),
    }));

    const result = await crud.readByFilter('name == $0', 'John');

    expect(result).toEqual([mockUser]);
    expect(mockRealm.objects).toHaveBeenCalledWith('User');
  });

  it('should update a record', async () => {
    const result = await crud.update('user-123', { name: 'Jane' });

    expect(result).toBe(true);
    expect(mockRealm.write).toHaveBeenCalled();
  });

  it('should delete a record', async () => {
    const result = await crud.delete('user-123');

    expect(result).toBe(true);
    expect(mockRealm.write).toHaveBeenCalled();
    expect(mockRealm.delete).toHaveBeenCalled();
  });

  it('should delete all records', async () => {
    const result = await crud.deleteAll();

    expect(result).toBe(true);
    expect(mockRealm.write).toHaveBeenCalled();
    expect(mockRealm.delete).toHaveBeenCalled();
  });

  it('should close realm', () => {
    crud.close();

    expect(mockRealm.close).toHaveBeenCalled();
  });
});

describe('Data conversion functions', () => {
  it('should convert user data', () => {
    const userData = {
      name: 'John',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: { bio: 'Developer' },
      hisFamily: ['Alice', 'Bob'],
    };

    const result = convertUserData(userData);

    expect(result).toEqual({
      name: 'John',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: '{"bio":"Developer"}',
      hisFamily: '["Alice","Bob"]',
    });
  });

  it('should convert bank data', () => {
    const bankData = {
      bankName: 'Chase Bank',
      bankID: 'CHASE001',
      userID: 'user-123',
    };

    const result = convertBankData(bankData);

    expect(result).toEqual({
      bankName: 'Chase Bank',
      bankID: 'CHASE001',
      userID: expect.any(Object),
    });
  });

  it('should parse user data', () => {
    const testUser = {
      _id: 'user-123',
      name: 'John Doe',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: '{"bio":"Developer"}',
      hisFamily: '["Alice","Bob"]',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = parseUserData(testUser as any);

    expect(result).toEqual({
      _id: 'user-123',
      name: 'John Doe',
      age: 30,
      address: '123 Main St',
      isMarried: true,
      aboutHim: { bio: 'Developer' },
      hisFamily: ['Alice', 'Bob'],
      createdAt: testUser.createdAt,
      updatedAt: testUser.updatedAt,
    });
  });

  it('should parse bank data', () => {
    const result = parseBankData(mockBank as any);

    expect(result).toEqual({
      _id: 'bank-123',
      bankName: 'Chase Bank',
      bankID: 'CHASE001',
      userID: 'user-123',
      createdAt: mockBank.createdAt,
      updatedAt: mockBank.updatedAt,
    });
  });
});

describe('Global instances', () => {
  it('should create user realm instance', () => {
    expect(userRealm).toBeInstanceOf(RealmCRUD);
  });

  it('should create bank realm instance', () => {
    expect(bankRealm).toBeInstanceOf(RealmCRUD);
  });
});
