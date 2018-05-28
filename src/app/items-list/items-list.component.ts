import {
  Component,
  Input,
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

  @Input() itemList: Item[];

  items: Item[];

  constructor(private itemService: ItemService) {
  }

  getItems(){
    this.items = this.itemService.getItems();
    console.log(`Loaded ${this.items.length.toString()} items.`);
  }

  ngOnInit() {
    this.getItems();
  }

}
