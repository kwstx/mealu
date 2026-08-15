import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'recipe_cache',
      columns: [
        { name: 'recipe_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'data_json', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'price_snapshots',
      columns: [
        { name: 'item_id', type: 'string', isIndexed: true },
        { name: 'price', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'store_id', type: 'string' },
        { name: 'timestamp', type: 'number' },
      ],
    }),
  ],
});
