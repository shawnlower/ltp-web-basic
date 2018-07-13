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
  ViewChildren
} from '@angular/core';

import { Action, ActionsSubject, Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { filter, last, map, take, takeLast, tap } from 'rxjs/operators';

import { CardComponent } from '../card/card.component';

import * as appActions from '../../actions/app.actions';
import * as editorActions from '../../actions/editor.actions';
import * as itemActions from '../../actions/item.actions';

import { Item } from '../../models/item.model';
import * as fromRoot from '../../reducers';
import { ItemService } from '../../services/item.service';

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

  @ViewChildren(CardComponent) cards: QueryList<CardComponent>;

  constructor(private itemService: ItemService,
              public store: Store<fromRoot.State>,
              private actions$: ActionsSubject,
              private renderer: Renderer2) {

    actions$.subscribe(data => {
      if (data.type === appActions.SELECT_NEXT_ITEM) {
        this.select('next');
      }
      if (data.type === appActions.SELECT_PREV_ITEM) {
        this.select('prev');
      }
      if (data.type === editorActions.EDITOR_CLOSED) {
        this.select('current');
      }
    });

    this.getItems();
    this.items$ = store.select(state => state.item.data);
  }

  ngAfterViewInit() {
  }

  getItems() {
    // Fetch all items from the service

    this.itemService.getItems().then(items => {
      items.map(item => this.store.dispatch(new itemActions.ItemLoaded(item)));
      console.log(`Loaded ${items.length.toString()} items.`);
    });
  }

  selectItem(item: Item): void {
    // Sets focused property on an item
    console.log('[selectItem] args', arguments);
    console.log('[selectItem] this', this);

    // Get the currently selected card (returned as array)
    const cards = this.cards.filter(card => card.selected);
    for (const card of cards) {
      if (card) {
        card.selected = false;
      }
    }

    if (this.currentItem && this.currentItem === item) {
      // Clicking a selected item will unselect it
      this.currentItem = null;
      this.store.dispatch(new itemActions.SelectItem(null));
    } else {
      this.currentItem = item;
      // Get index of item in cards
      this.store.dispatch(new itemActions.SelectItem(item));
    }
  }

  select(action: string): boolean {
    /*
    /* Moves the current selection based on 'action'
     * action can be one of 'next', 'prev', or 'current'
     * to ensure the item for the current card is loaded
     */

    if (!this.cards) {
      return;
    }

    // Get the first card that is selected
    const selectedCard = this.cards.filter(card => card.selected).pop();
    const cardIdx = this.cards.toArray().indexOf(selectedCard);

    let index = 0;
    switch (action) {
      case 'next':
        if (cardIdx === -1) {
          index = 0;
        } else if (cardIdx < this.cards.length - 1) {
          index = cardIdx + 1;
        } else {
          index = 0;
        }
        break;

      case 'prev':
        const lastIndex = this.cards.length - 1;
        if (cardIdx === -1) {
          index = lastIndex;
        } else if (cardIdx > 0) {
          index = cardIdx - 1;
        } else {
          index = lastIndex;
        }
        break;

      case 'current':
        index = cardIdx;
        break;

      default:
        break;

    }

    // Unselect current
    if (selectedCard) {
      selectedCard.selected = false;
    }

    // Select desired card, and dispatch action
    const card = this.cards.toArray()[index];
    if (card) {
      card.selected = true;
      this.store.dispatch(new itemActions.SelectItem(card.item));
    }

  }

  isSelected(item: Item): boolean {
    // Return whether an item is the currently focused item
    if (this.currentItem) {
      return this.currentItem.uri === item.uri;
    } else {
      return false;
    }
  }

  ngOnInit() {
  }

}
