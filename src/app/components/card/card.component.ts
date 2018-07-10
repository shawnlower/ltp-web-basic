import { Component, OnInit, Input } from '@angular/core';

import { Store } from '@ngrx/store';

import * as appActions from '../../actions/app.actions';
import * as editorActions from '../../actions/editor.actions';
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
  @Input() id: string;
  selected: boolean;

  constructor(public store: Store<fromRoot.State>) {
    this.store.select(state => state.item.selectedItem)
      .subscribe(selectedItem => {
        if (selectedItem && selectedItem.uri === this.item.uri) {
          this.selected = true;
        } else {
          this.selected = false;
        }
      });
  }

  ngOnInit() {
  }

  selectItem() {
    /*
     * Select the current item by dispatching a message
     */
    // console.log('[card selectItem] args', arguments, this);
    if (this.selected) {
      this.store.dispatch(new itemActions.SelectItem(null));
    } else {
      this.store.dispatch(new itemActions.SelectItem(this.item));
    }
  }

  editItem() {
    /*
     * Edit the current item by dispatching a message
     */
    this.store.dispatch(new appActions.ToggleEditor());
    this.store.dispatch(new editorActions.LoadItem(this.item));
    return false;
  }

  removeItem(): boolean {
    /*
     * Remove the current item by dispatching a message
     */
    this.store.dispatch(new itemActions.RemoveItem(this.item));
    return false;
  }

}
