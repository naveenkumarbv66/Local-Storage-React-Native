import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 1,
  tables: [
    // Users table
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'age', type: 'number' },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'is_married', type: 'boolean' },
        { name: 'about_him', type: 'string', isOptional: true }, // JSON serialized
        { name: 'his_family', type: 'string', isOptional: true }, // JSON serialized array
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    // Banks table
    tableSchema({
      name: 'banks',
      columns: [
        { name: 'bank_name', type: 'string' },
        { name: 'bank_id', type: 'string' },
        { name: 'user_id', type: 'string', isIndexed: true }, // Foreign key to users
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
