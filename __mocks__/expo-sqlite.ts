const mockDb = {
  execSync: jest.fn(),
  runSync: jest.fn((sql, params) => {
    if (sql.includes('INSERT')) {
      return { lastInsertRowId: 1, changes: 1 };
    } else if (sql.includes('UPDATE') || sql.includes('DELETE')) {
      return { changes: 1 };
    }
    return { changes: 0 };
  }),
  getAllSync: jest.fn((sql, params) => {
    if (sql.includes('WHERE id = ?')) {
      return [{ id: 1, name: 'Test User', age: 30, address: 'Test Address', isMarried: 1, aboutHim: '{}', hisFamily: '[]' }];
    }
    return [
      { id: 1, name: 'Test User 1', age: 30, address: 'Test Address 1', isMarried: 1, aboutHim: '{}', hisFamily: '[]' },
      { id: 2, name: 'Test User 2', age: 25, address: 'Test Address 2', isMarried: 0, aboutHim: '{}', hisFamily: '[]' }
    ];
  })
};

export const openDatabaseSync = jest.fn(() => mockDb);
