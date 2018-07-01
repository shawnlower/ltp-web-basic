import {
  Component,
  HostListener,
  OnInit,
  Output,
  ViewChildren
} from '@angular/core';

import { Observable } from 'rxjs';
import { last, map, switchMap, debounceTime } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';
import * as editorActions from '../../actions/editor.actions';
import * as itemActions from '../../actions/item.actions';

import { Item } from '../../models/item.model';

import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { Unlisten } from '../../services/keyboard-shortcuts.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChildren('searchBox') vc;

  showEditor$: Observable<boolean>;

  selectedItem$: Observable<Item>;
  selectedItem: Item;

  public unlisten: Unlisten;

  constructor(public keyboardShortcuts: KeyboardShortcutsService,
              public store: Store<fromRoot.State>) {
    this.showEditor$ = store.select(state => state.app.showEditor);
    this.selectedItem$ = store.select(state => state.item.selectedItem);

    this.keyboardShortcuts = keyboardShortcuts;
    this.unlisten = null;
  }

  newEditor() {
    /*
     * Clear the existing editor. Set defaults for editing a new item.
     */
    this.store.dispatch(new editorActions.ResetEditor()); // TODO: Currently NO-OP
    this.store.dispatch(new itemActions.SelectItem(null));
    this.store.dispatch(new editorActions.LoadItem(null));
    setTimeout(() => this.toggleEditor(), 0);
  }

  toggleEditor(msg = '') {
    this.store.dispatch(new appActions.ToggleEditor());
  }

  filterSearch() {
    console.log('filter search');
  }

  doSearch() {
    console.log('SEARCHING!!!');
  }

  public ngOnInit(): void {
    this.unlisten = this.keyHandler();

  this.store.select(state => state.item.selectedItem)
    .subscribe(item => this.selectedItem = item);
  }

  keyHandler(): Unlisten {
    return this.keyboardShortcuts.listen(
      {
        'Shift.?': ( event: KeyboardEvent ): void => {
          /*
           * Show help dialog
           */

          console.log( 'Handler [app-component][ 0 ]: ', event);
          alert('Halp.');
          event.preventDefault();

        },
        'e': ( event: KeyboardEvent ): void => {
          /*
           * Edit currently selected item
           */

          const searchHasFocus = document.activeElement ===
            document.getElementsByName('search')[0];

          if (searchHasFocus) {
            return;
          }
          this.toggleEditor();
          this.store.dispatch(new editorActions.LoadItem(this.selectedItem));

          // Since this is a native browser action, we want to cancel the
          // default behavior and isolate it as a local action.
          event.preventDefault();

        },
        'n': ( event: KeyboardEvent ): void => {
          /*
           * Show empty editor modal
           */

          console.log( 'Handler [app-component][ 0 ]: ', event);

          const searchHasFocus = document.activeElement ===
            document.getElementsByName('search')[0];

          if (searchHasFocus) {
            return;
          }

          this.newEditor();

          // Since this is a native browser action, we want to cancel the
          // default behavior and isolate it as a local action.
          event.preventDefault();

        },
        'j': ( event: KeyboardEvent ): void => {
          /*
           * Select next item
           */

          const searchHasFocus = document.activeElement ===
            document.getElementsByName('search')[0];

          if (!searchHasFocus) {
            this.store.dispatch(new appActions.SelectNextItem());
          }

          event.preventDefault();

        },
        'k': ( event: KeyboardEvent ): void => {
          /*
           * Select previous item
           */

          const searchHasFocus = document.activeElement ===
            document.getElementsByName('search')[0];

          if (!searchHasFocus) {
            this.store.dispatch(new appActions.SelectPrevItem());
          }

          event.preventDefault();

        },
        'd': ( event: KeyboardEvent ): void => {
          /*
           * Remove currently selected item
           */

          this.removeItem();

          event.preventDefault();

        },
      },
      {
        // Priority should be lower than our modal
        priority: 0,
        terminal: false
      }
    );
  }

  removeItem(): void {
    this.store.dispatch(new itemActions.RemoveItem(this.selectedItem));
  }

  public onDestroy(): void {
    if ( this.unlisten ) { this.unlisten(); }
  }


}
