import {
  AfterViewInit,
  Component,
  Output,
  OnInit,
  ViewChild
} from '@angular/core';

import { Item } from '../item';
import { ItemService } from '../item.service';

declare var Draggabilly: any; // drag+drop
declare var Packery: any;    // grid layout library

/**
 * @ItemsList: A component for displaying items
 * and navigating/selecting between items
 */
@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent implements OnInit, AfterViewInit {

  items: Item[];
  currentItem: Item;
  private pckry: any;

  @ViewChild('grid') grid;

  constructor(private itemService: ItemService) {
  }

  ngAfterViewInit(){
    var elem = document.querySelector('.grid');
    var pckry = new Packery( elem, {

      itemSelector: '.grid-item',
      gutter: 10
    });

    // Enable dragging
    console.log(pckry.items);
    pckry.getItemElements().forEach( (gridItem) => {
      var draggie = new Draggabilly( gridItem );
      pckry.bindDraggabillyEvents( draggie )
    });

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
