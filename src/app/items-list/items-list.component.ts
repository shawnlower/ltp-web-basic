import {
  AfterViewInit,
  Component,
  Directive,
  Input,
  Output,
  OnInit,
  QueryList,
  Renderer2,
  /* Not using Renderer2 because https://github.com/angular/angular/issues/19554 */
  ViewChild,
  ViewChildren
} from '@angular/core';

import { Action, Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { last } from 'rxjs/operators';

import { CardComponent } from '../card/card.component';

import * as appActions from '../actions/app.actions';
import * as itemActions from '../actions/item.actions';

import { Item } from '../models/item.model';
import * as fromRoot from '../reducers';
import { ItemService } from '../services/item.service';

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

  items$: Observable<Item[]>;
  currentItem: Item;

  message$: Observable<string>;
  visible$: Observable<boolean>;

  private pckry: any;

  @Input('about') about;
  @ViewChild('grid') grid;

  @ViewChildren(CardComponent) cards: QueryList<CardComponent>;

  constructor(private itemService: ItemService,
              public store: Store<fromRoot.State>,
              private renderer: Renderer2) {

    this.getItems();
    this.items$ = store.select(state => state.item.data);
    this.message$ = store.select(state => JSON.stringify(state.app.showEditor));
    this.visible$ = store.select(state => state.app.showEditor);
  }

  ngAfterViewInit() {
    this.cards.forEach(cardInstance => console.log(cardInstance));
    const elem = document.querySelector('.grid');
    const pckry = new Packery( elem, {

      itemSelector: '.grid-item',
      gutter: 10

    });

  }

  updateMessage(state) {
    // this.state.forEach(m => this.message = m.dataType);
    console.log('updateMessage: updating with', state);
  }

  getItems() {
    // Fetch all items from the service

    // this.items = this.itemService.getItems();
    // this.items = this.itemService.getItems();
    // this.items.map(item => this.store.dispatch(new itemActions.ItemLoaded(item)));
    const items = this.itemService.getItems();
    items.map(item => this.store.dispatch(new itemActions.ItemLoaded(item)));
    console.log(`Loaded ${items.length.toString()} items.`);
  }

  removeItem(item: Item): void {
    this.store.dispatch(new itemActions.RemoveItem(item));
  }


  selectItem(item: Item): void {
    // Sets focused property on an item
    const selectedCard = this.cards.filter(card => card.selected);
    if (selectedCard) {
      selectedCard.pop().selected = false;
    }

    if (this.currentItem && this.currentItem === item) {
      this.currentItem = null;
    } else {
      this.currentItem = item;
    }
  }

  select(action: string): void {
    /*
    /* Moves the current selection based on 'action'
     */


    /*
     * Handle a couple easy cases up-front
     */

    if (!this.cards) {
      return;
    }

    if (this.cards.length === 1) {
      this.cards.first.selected = true;
      return
    }


    // Get the first card that is selected
    const selectedCard = this.cards.filter(card => card.selected).pop();
    const cardIdx = this.cards.toArray().indexOf(selectedCard);

    if (!selectedCard) {
      this.cards.first.selected = true;
      return;
    } else {
      selectedCard.selected = false;
      // const url = this.currentItem.url;
      // const element = this.renderer.selectRootElement(`[about="${url}"]`);
    }

    switch (action) {
      case 'next':
        console.log('Selecting next item', cardIdx);
        if (cardIdx < this.cards.length - 1) {
          this.cards.toArray()[cardIdx + 1].selected = true;
        } else {
          this.cards.first.selected = true;
        }
        break;

      case 'prev':
        console.log('Selecting previous item');
        if (cardIdx > 0) {
          this.cards.toArray()[cardIdx - 1].selected = true;
        } else {
          this.cards.last.selected = true;
        }
        break;

      default:
        console.log('Selecting with no option?');
        break;
    }
  }

  isSelected(item: Item): boolean {
    // Return whether an item is the currently focused item
    if (this.currentItem) {
      return this.currentItem.url === item.url;
    } else {
      return false
    }
  }

  ngOnInit() {
  }

}
