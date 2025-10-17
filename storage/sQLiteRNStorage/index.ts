import * as SQLite from 'expo-sqlite';

export interface DatabaseRecord {
  id?: number;
  [key: string]: any;
}

export class SQLiteCRUD<T extends DatabaseRecord> {
  private db: SQLite.SQLiteDatabase | null = null;
  private tableName: string;
  private isAvailable: boolean = false;

  constructor(dbName: string, tableName: string) {
    this.tableName = tableName;
    try {
      if (SQLite.openDatabaseSync) {
        this.db = SQLite.openDatabaseSync(dbName);
        this.isAvailable = true;
        this.initTable();
      }
    } catch (error) {
      console.warn('SQLite not available:', error);
      this.isAvailable = false;
    }
  }

  private initTable() {
    if (!this.db) return;
    
    // Create users table
    if (this.tableName === 'users') {
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          age INTEGER,
          address TEXT,
          isMarried INTEGER DEFAULT 0,
          aboutHim TEXT,
          hisFamily TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    // Create banks table
    if (this.tableName === 'banks') {
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS banks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bankName TEXT NOT NULL,
          bankID TEXT NOT NULL,
          userID INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userID) REFERENCES users (id) ON DELETE CASCADE
        );
      `);
    }
  }

  // Create
  async create(data: Omit<T, 'id'>): Promise<number> {
    if (!this.isAvailable || !this.db) {
      throw new Error('SQLite not available. Use a Dev Client (not Expo Go).');
    }
    try {
      let result;
      if (this.tableName === 'users') {
        result = this.db.runSync(
          `INSERT INTO users (name, age, address, isMarried, aboutHim, hisFamily) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            data.name || '',
            data.age || 0,
            data.address || '',
            data.isMarried ? 1 : 0,
            data.aboutHim ? JSON.stringify(data.aboutHim) : '',
            data.hisFamily ? JSON.stringify(data.hisFamily) : '',
          ]
        );
      } else if (this.tableName === 'banks') {
        result = this.db.runSync(
          `INSERT INTO banks (bankName, bankID, userID) VALUES (?, ?, ?)`,
          [
            data.bankName || '',
            data.bankID || '',
            data.userID || 0,
          ]
        );
      } else {
        throw new Error(`Unknown table: ${this.tableName}`);
      }
      return result.lastInsertRowId || 0;
    } catch (error) {
      throw error;
    }
  }

  // Read
  async read(id?: number): Promise<T[]> {
    if (!this.isAvailable || !this.db) {
      throw new Error('SQLite not available. Use a Dev Client (not Expo Go).');
    }
    try {
      const query = id 
        ? `SELECT * FROM ${this.tableName} WHERE id = ?`
        : `SELECT * FROM ${this.tableName} ORDER BY createdAt DESC`;
      const params = id ? [id] : [];
      
      const result = this.db.getAllSync(query, params);
      
      if (this.tableName === 'users') {
        return result.map((row: any) => ({
          ...row,
          isMarried: Boolean(row.isMarried),
          aboutHim: row.aboutHim ? JSON.parse(row.aboutHim) : null,
          hisFamily: row.hisFamily ? JSON.parse(row.hisFamily) : null,
        }));
      } else if (this.tableName === 'banks') {
        return result.map((row: any) => ({
          ...row,
          userID: Number(row.userID),
        }));
      }
      
      return result as T[];
    } catch (error) {
      throw error;
    }
  }

  // Read banks by user ID
  async readByUserId(userId: number): Promise<T[]> {
    if (!this.isAvailable || !this.db) {
      throw new Error('SQLite not available. Use a Dev Client (not Expo Go).');
    }
    if (this.tableName !== 'banks') {
      throw new Error('readByUserId is only available for banks table');
    }
    try {
      const result = this.db.getAllSync(
        `SELECT * FROM banks WHERE userID = ? ORDER BY createdAt DESC`,
        [userId]
      );
      return result.map((row: any) => ({
        ...row,
        userID: Number(row.userID),
      }));
    } catch (error) {
      throw error;
    }
  }

  // Update
  async update(id: number, data: Partial<Omit<T, 'id'>>): Promise<boolean> {
    if (!this.isAvailable || !this.db) {
      throw new Error('SQLite not available. Use a Dev Client (not Expo Go).');
    }
    try {
      const fields = [];
      const values = [];
      
      if (this.tableName === 'users') {
        if (data.name !== undefined) {
          fields.push('name = ?');
          values.push(data.name);
        }
        if (data.age !== undefined) {
          fields.push('age = ?');
          values.push(data.age);
        }
        if (data.address !== undefined) {
          fields.push('address = ?');
          values.push(data.address);
        }
        if (data.isMarried !== undefined) {
          fields.push('isMarried = ?');
          values.push(data.isMarried ? 1 : 0);
        }
        if (data.aboutHim !== undefined) {
          fields.push('aboutHim = ?');
          values.push(JSON.stringify(data.aboutHim));
        }
        if (data.hisFamily !== undefined) {
          fields.push('hisFamily = ?');
          values.push(JSON.stringify(data.hisFamily));
        }
      } else if (this.tableName === 'banks') {
        if (data.bankName !== undefined) {
          fields.push('bankName = ?');
          values.push(data.bankName);
        }
        if (data.bankID !== undefined) {
          fields.push('bankID = ?');
          values.push(data.bankID);
        }
        if (data.userID !== undefined) {
          fields.push('userID = ?');
          values.push(data.userID);
        }
      }
      
      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);
      
      const result = this.db.runSync(
        `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete
  async delete(id: number): Promise<boolean> {
    if (!this.isAvailable || !this.db) {
      throw new Error('SQLite not available. Use a Dev Client (not Expo Go).');
    }
    try {
      const result = this.db.runSync(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete all
  async deleteAll(): Promise<boolean> {
    if (!this.isAvailable || !this.db) {
      throw new Error('SQLite not available. Use a Dev Client (not Expo Go).');
    }
    try {
      const result = this.db.runSync(
        `DELETE FROM ${this.tableName}`,
        []
      );
      return result.changes >= 0;
    } catch (error) {
      throw error;
    }
  }
}

// Global instances for easy access
export const sqliteDB = new SQLiteCRUD('localStorage.db', 'users');
export const bankDB = new SQLiteCRUD('localStorage.db', 'banks');

// Bank interface
export interface BankRecord extends DatabaseRecord {
  bankName: string;
  bankID: string;
  userID: number;
}
