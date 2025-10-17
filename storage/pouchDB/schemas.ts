// PouchDB Document Types and Interfaces

export interface PouchDBDocument {
  _id?: string;
  _rev?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Document Schema
export interface UserDocument extends PouchDBDocument {
  type: 'user';
  name: string;
  age: number;
  address?: string;
  isMarried?: boolean;
  aboutHim?: string; // JSON serialized
  hisFamily?: string; // JSON serialized array
}

// Bank Document Schema
export interface BankDocument extends PouchDBDocument {
  type: 'bank';
  bankName: string;
  bankId: string;
  userId: string; // Reference to user._id
}

// Document Type Union
export type DocumentType = UserDocument | BankDocument;

// Helper type for creating documents (without _id, _rev)
export type CreateDocument<T extends PouchDBDocument> = Omit<T, '_id' | '_rev'>;

// Helper type for updating documents (partial, without _id, _rev)
export type UpdateDocument<T extends PouchDBDocument> = Partial<Omit<T, '_id' | '_rev' | 'type' | 'createdAt'>>;
