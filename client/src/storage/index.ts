import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import RecipeCache from './models/RecipeCache';
import PriceSnapshot from './models/PriceSnapshot';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true, /* JSI is recommended for React Native */
  onSetUpError: error => {
    console.error('Database setup failed', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    RecipeCache,
    PriceSnapshot,
  ],
});

export * from './mmkv';
