import { Component, OnInit, Input } from '@angular/core';

import { Store } from '@ngrx/store';

import * as itemActions from '../../actions/item.actions';

import * as fromRoot from '../../reducers';

import { Item } from '../../models/item.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() item: Item;
  @Input() selected: boolean;

  selectedItem: Item;

  constructor(public store: Store<fromRoot.State>) {
    this.store.select(state => state.item.selectedItem)
      .subscribe(item => this.selectedItem = item);
  }

  ngOnInit() {
  }

  removeItem(): boolean {
    this.store.dispatch(new itemActions.RemoveItem(this.selectedItem));
    return false;
  }

}
