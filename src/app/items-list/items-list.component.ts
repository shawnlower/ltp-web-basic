import {
  Component,
  Output,
  OnInit
} from '@angular/core';

import { Item } from '../item';
import { ItemService } from '../item.service';


/**
 * @ItemsList: A component for displaying items
 * and navigating/selecting between items
 */
@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent implements OnInit {

  items: Item[];
  currentItem: Item;

  constructor(private itemService: ItemService) {
  }

  getItems(){
    this.items = this.itemService.getItems();
    console.log(`Loaded ${this.items.length.toString()} items.`);
  }

  selectItem(item: Item): void {
    if(this.currentItem === item){
      this.currentItem = null;
    } else {
      this.currentItem = item;
    }

  }

  isSelected(item: Item): boolean {
    return this.currentItem === item;
  }

  ngOnInit() {
    this.getItems();
  }

}
