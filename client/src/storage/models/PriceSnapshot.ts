import { Model } from '@nozbe/watermelondb';
import { field, date, text } from '@nozbe/watermelondb/decorators';

export default class PriceSnapshot extends Model {
  static table = 'price_snapshots';

  @text('item_id') itemId?: string;
  @field('price') price?: number;
  @text('currency') currency?: string;
  @text('store_id') storeId?: string;
  @date('timestamp') timestamp?: Date;
}
