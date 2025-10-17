import { convertUserData, parseUserData, convertBankData, parseBankData } from './index';

describe('WatermelonDB Data Conversion Functions', () => {
  describe('User Data Conversion', () => {
    it('should convert user data correctly', () => {
      const userData = {
        name: 'John',
        age: 30,
        aboutHim: { bio: 'Developer' },
        hisFamily: ['Alice', 'Bob'],
      };

      const converted = convertUserData(userData);

      expect(converted.name).toBe('John');
      expect(converted.age).toBe(30);
      expect(converted.aboutHim).toBe('{"bio":"Developer"}');
      expect(converted.hisFamily).toBe('["Alice","Bob"]');
    });

    it('should handle null values in user data conversion', () => {
      const userData = {
        name: 'John',
        age: 30,
        aboutHim: null,
        hisFamily: null,
      };

      const converted = convertUserData(userData);

      expect(converted.name).toBe('John');
      expect(converted.age).toBe(30);
      expect(converted.aboutHim).toBeUndefined();
      expect(converted.hisFamily).toBeUndefined();
    });

    it('should parse user data correctly', () => {
      const mockUser = {
        id: 'user-1',
        name: 'John',
        age: 30,
        address: '123 Main St',
        isMarried: true,
        aboutHim: '{"bio":"Developer"}',
        hisFamily: '["Alice","Bob"]',
        createdAt: new Date(),
        updatedAt: new Date(),
        getAboutHimObject: () => ({ bio: 'Developer' }),
        getHisFamilyArray: () => ['Alice', 'Bob'],
      };

      const parsed = parseUserData(mockUser as any);

      expect(parsed.id).toBe('user-1');
      expect(parsed.name).toBe('John');
      expect(parsed.age).toBe(30);
      expect(parsed.address).toBe('123 Main St');
      expect(parsed.isMarried).toBe(true);
      expect(parsed.aboutHim).toEqual({ bio: 'Developer' });
      expect(parsed.hisFamily).toEqual(['Alice', 'Bob']);
    });

    it('should handle null values in user data parsing', () => {
      const mockUser = {
        id: 'user-1',
        name: 'John',
        age: 30,
        address: '123 Main St',
        isMarried: true,
        aboutHim: null,
        hisFamily: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        getAboutHimObject: () => null,
        getHisFamilyArray: () => null,
      };

      const parsed = parseUserData(mockUser as any);

      expect(parsed.id).toBe('user-1');
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
    });

    it('should parse bank data correctly', () => {
      const mockBank = {
        id: 'bank-1',
        bankName: 'Chase Bank',
        bankId: 'CHASE001',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parseBankData(mockBank as any);

      expect(parsed.id).toBe('bank-1');
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
        aboutHim: {},
        hisFamily: [],
      };

      const converted = convertUserData(userData);

      expect(converted.aboutHim).toBe('{}');
      expect(converted.hisFamily).toBe('[]');
    });

    it('should handle complex nested objects', () => {
      const userData = {
        name: 'John',
        age: 30,
        aboutHim: {
          bio: 'Developer',
          skills: ['React', 'Node.js'],
          contact: { email: 'john@example.com' },
        },
        hisFamily: ['Alice', 'Bob', 'Charlie'],
      };

      const converted = convertUserData(userData);

      expect(converted.aboutHim).toBe('{"bio":"Developer","skills":["React","Node.js"],"contact":{"email":"john@example.com"}}');
      expect(converted.hisFamily).toBe('["Alice","Bob","Charlie"]');
    });
  });
});
