import { Model } from '@nozbe/watermelondb';
import { field, date, text } from '@nozbe/watermelondb/decorators';

export default class RecipeCache extends Model {
  static table = 'recipe_cache';

  @text('recipe_id') recipeId!: string;
  @text('title') title!: string;
  @text('data_json') dataJson!: string;
  @date('created_at') createdAt!: Date;
}
