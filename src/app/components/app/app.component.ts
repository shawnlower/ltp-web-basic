import {
  Component,
  HostListener,
  OnInit,
  Output,
  ViewChildren
} from '@angular/core';

import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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

  public unlisten: Unlisten;

  constructor(public keyboardShortcuts: KeyboardShortcutsService,
              public store: Store<fromRoot.State>) {
    this.showEditor$ = store.select(state => state.app.showEditor);

    this.keyboardShortcuts = keyboardShortcuts;
    this.unlisten = null;
  }

  newItem() {
    /*
     * Create a new item
     */

    // Reset the editor to the default state
    this.store.dispatch(new editorActions.ResetEditor());

    // Make editor visible
    this.toggleEditor();

  }

  newEditor() {
    /*
     * Clear the existing editor. Set defaults for editing a new item.
     */
    console.log('Clearing editor modal.');
    this.store.dispatch(new itemActions.SelectItem(null));
  }

  toggleEditor(msg = '') {
    console.log('toggling editor', msg);
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
  }

  keyHandler(): Unlisten {
    console.log('Initalizing keyboard shortcuts');
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

          console.log( 'Handler [app-component][ 0 ]: ', event);

          const searchHasFocus = document.activeElement ===
            document.getElementsByName('search')[0];

            if (searchHasFocus) {
              return;
            } else {
              this.toggleEditor();
            }

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

          this.newEditor();

          if (searchHasFocus) {
            return;
          } else {
            this.toggleEditor();
          }

          // Since this is a native browser action, we want to cancel the
          // default behavior and isolate it as a local action.
          event.preventDefault();

        },
        'j': ( event: KeyboardEvent ): void => {
          /*
           * Select next item
           */

          console.log( 'Handler [app-component][ 0 ]: ', event);

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

          console.log( 'Handler [app-component][ 0 ]: ', event);

          const searchHasFocus = document.activeElement ===
            document.getElementsByName('search')[0];

          if (!searchHasFocus) {
            this.store.dispatch(new appActions.SelectPrevItem());
          }

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

  public onDestroy(): void {
    if ( this.unlisten ) { this.unlisten(); }
  }


}
