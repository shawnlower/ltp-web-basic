import { Injectable } from '@angular/core';

import { Item } from '../models/item.model';
import { ITEMS, JLOs } from '../models/mock-items';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor() {
  }

  async getItems(): Promise<Item[]> {
    const items = [];
    for (const jlo of JLOs) {
      const item = new Item(jlo['@type']);
      await item.load(jlo);
      items.push(item);
    }

    return items;
  }
}
