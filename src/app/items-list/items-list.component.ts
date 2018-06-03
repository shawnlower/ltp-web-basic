import {
  AfterViewInit,
  Component,
  Output,
  OnInit,
  ViewChild
} from '@angular/core';

import { Action, Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';

import { Item } from '../item';
import * as itemActions from '../item.actions';
import { ItemService } from '../item.service';
import { AppState } from '../app.state';

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

  state: AppState;

  private pckry: any;

  @ViewChild('grid') grid;

  constructor(private itemService: ItemService, public store: Store<AppState>) {
    this.getItems();
    store.subscribe(state => this.updateMessage(state));
  }

  ngAfterViewInit() {
    const elem = document.querySelector('.grid');
    const pckry = new Packery( elem, {

      itemSelector: '.grid-item',
      gutter: 10
    });

    // Enable dragging
    console.log(pckry.items);
    pckry.getItemElements().forEach( (gridItem) => {
      const draggie = new Draggabilly( gridItem );
      pckry.bindDraggabillyEvents( draggie );
    });

  }

  updateMessage(state) {
    // this.state.forEach(m => this.message = m.dataType);
    console.log('updateMessage: updating with', state);
    console.log('updateMessage: this.state: ', this.state);
  }

  getItems() {
    // Fetch all items from the service

    this.items = this.itemService.getItems();
    this.items.map(item => this.store.dispatch({ type: itemActions.ADD_ITEM,
      payload: item}));
    console.log(`Loaded ${this.items.length.toString()} items.`);
  }

  selectItem(item: Item): void {
    // Sets focused property on an item

    if (this.currentItem && this.currentItem === item) {
      this.store.dispatch({ type: itemActions.DESELECT_ITEM, payload: item });
      this.currentItem = null;
    } else {
      this.currentItem = item;
      this.store.dispatch({ type: itemActions.SELECT_ITEM,
                                   payload: item });
    }
  }

  select(action: string): void {
    /*
    /* Moves the current selection based on 'action'
     */

    // Get current item
    const i = this.items.indexOf(this.currentItem);

    switch (action) {
      case 'next':
        console.log('Selecting next item');
        if (i < this.items.length - 1) {
          this.selectItem(this.items[i + 1]);
        } else {
          this.selectItem(this.items[0]);
        }
        break;

      case 'prev':
        console.log('Selecting previous item');
        if (i > 0) {
          this.selectItem(this.items[i - 1]);
        } else {
          this.selectItem(this.items[this.items.length - 1]);
        }
        break;

      default:
        console.log('Selecting with no option?');
        break;
    }
  }

  isSelected(item: Item): boolean {
    // Return whether an item is the currently focused item
    return this.currentItem === item;
  }

  ngOnInit() {
  }

}
