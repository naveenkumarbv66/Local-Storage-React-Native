declare module 'pouchdb-core' {
  export default class PouchDB {
    constructor(name: string, options?: any);
    static plugin(plugin: any): void;
    put(doc: any): Promise<{ id: string; rev: string; ok: boolean }>;
    get(id: string): Promise<any>;
    find(query: any): Promise<{ docs: any[] }>;
    remove(doc: any): Promise<{ id: string; rev: string; ok: boolean }>;
    bulkDocs(docs: any[]): Promise<any[]>;
    createIndex(index: any): Promise<any>;
  }
  
  export namespace PouchDB {
    interface Database {
      put(doc: any): Promise<{ id: string; rev: string; ok: boolean }>;
      get(id: string): Promise<any>;
      find(query: any): Promise<{ docs: any[] }>;
      remove(doc: any): Promise<{ id: string; rev: string; ok: boolean }>;
      bulkDocs(docs: any[]): Promise<any[]>;
      createIndex(index: any): Promise<any>;
    }
  }
}

declare module 'pouchdb-adapter-asyncstorage' {
  export default {};
}

declare module 'pouchdb-mapreduce' {
  export default {};
}

declare module 'pouchdb-find' {
  export default {};
}
