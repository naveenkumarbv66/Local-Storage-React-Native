// Mock Realm for testing
const mockRealm = {
  write: jest.fn((callback) => callback()),
  create: jest.fn(),
  objects: jest.fn(() => ({
    filtered: jest.fn(() => []),
  })),
  objectForPrimaryKey: jest.fn(() => null),
  delete: jest.fn(),
  close: jest.fn(),
};

// Mock Realm class
class MockRealm {
  static open = jest.fn(() => Promise.resolve(mockRealm));
  static BSON = {
    ObjectId: jest.fn(() => 'mock-object-id'),
  };
}

// Mock Realm.Object class
class MockRealmObject {
  static schema = {};
}

// Set up the mock properly
const Realm = MockRealm as any;
Realm.Object = MockRealmObject;

export default Realm;
export { MockRealmObject as Object };
