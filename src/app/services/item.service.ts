import { Injectable } from '@angular/core';

import { Item } from '../models/item.model';
import { ITEMS } from '../models/mock-items';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor() {
  }

  getItems(): Item[] {
    return ITEMS;
  }
}
