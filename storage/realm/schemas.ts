import Realm from 'realm';

// User Schema
export class User extends Realm.Object {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  age!: number;
  address!: string;
  isMarried!: boolean;
  aboutHim!: string; // JSON string
  hisFamily!: string; // JSON string
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'User',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name: 'string',
      age: 'int',
      address: 'string',
      isMarried: 'bool',
      aboutHim: 'string',
      hisFamily: 'string',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}

// Bank Schema
export class Bank extends Realm.Object {
  _id!: Realm.BSON.ObjectId;
  bankName!: string;
  bankID!: string;
  userID!: Realm.BSON.ObjectId;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Bank',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      bankName: 'string',
      bankID: 'string',
      userID: 'objectId',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}

// Realm Configuration
export const realmConfig: Realm.Configuration = {
  schema: [User, Bank],
  schemaVersion: 1,
  deleteRealmIfMigrationNeeded: true, // For development only
};
