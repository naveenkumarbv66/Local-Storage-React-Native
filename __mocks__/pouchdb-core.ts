// Mock PouchDB for testing
class MockPouchDB {
  private data: Map<string, any> = new Map();
  private indexes: Map<string, any> = new Map();

  constructor(name: string, options?: any) {
    // Mock constructor
  }

  async put(doc: any): Promise<{ id: string; rev: string; ok: boolean }> {
    const id = doc._id || `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const rev = `1-${Math.random().toString(36).substring(7)}`;
    
    const document = {
      ...doc,
      _id: id,
      _rev: rev,
    };
    
    this.data.set(id, document);
    return { id, rev, ok: true };
  }

  async get(id: string): Promise<any> {
    const doc = this.data.get(id);
    if (!doc) {
      const error = new Error('Document not found');
      (error as any).status = 404;
      throw error;
    }
    return doc;
  }

  async find(query: any): Promise<{ docs: any[] }> {
    const { selector, sort } = query;
    let docs = Array.from(this.data.values());

    // Simple filter implementation
    if (selector) {
      docs = docs.filter(doc => {
        for (const [key, value] of Object.entries(selector)) {
          if (doc[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    // Simple sort implementation
    if (sort && Array.isArray(sort) && sort.length > 0) {
      const sortItem = sort[0];
      if (Array.isArray(sortItem) && sortItem.length >= 2) {
        const [sortField, sortOrder] = sortItem;
        docs.sort((a, b) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          if (sortOrder === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
          } else {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          }
        });
      }
    }

    return { docs };
  }

  async remove(doc: any): Promise<{ id: string; rev: string; ok: boolean }> {
    const id = doc._id;
    if (!this.data.has(id)) {
      const error = new Error('Document not found');
      (error as any).status = 404;
      throw error;
    }
    this.data.delete(id);
    return { id, rev: doc._rev, ok: true };
  }

  async bulkDocs(docs: any[]): Promise<any[]> {
    const results = [];
    for (const doc of docs) {
      try {
        if (doc._deleted) {
          await this.remove(doc);
          results.push({ id: doc._id, rev: doc._rev, ok: true });
        } else {
          const result = await this.put(doc);
          results.push(result);
        }
      } catch (error) {
        results.push({ id: doc._id, error: (error as any).message });
      }
    }
    return results;
  }

  async createIndex(index: any): Promise<any> {
    const indexName = `index-${Date.now()}`;
    this.indexes.set(indexName, index);
    return { result: 'created', id: indexName, name: indexName };
  }

  // Mock plugin system
  static plugin(plugin: any): void {
    // Mock plugin registration
  }
}

// Mock adapters
const MockAsyncStorageAdapter = {
  name: 'asyncstorage',
};

const MockMapReduce = {};
const MockFind = {};

// Export mocks
export default MockPouchDB;
export { MockAsyncStorageAdapter as AsyncStorageAdapter };
export { MockMapReduce as MapReduce };
export { MockFind as Find };
