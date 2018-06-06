import {
  Component,
  HostListener,
  Output,
  ViewChildren
} from '@angular/core';

import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChildren('searchBox') vc;

  showEditor$: Observable<boolean>;
  showEditor: boolean;

  constructor(public store: Store<fromRoot.State>) {
    // store.select(state => this.showEditor = state.app.showEditor);

    this.showEditor$ = store.select(state => {
      this.showEditor = state.app.showEditor;
      return state.app.showEditor;
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // Handle keyboard events


    // ignore inputs if editor modal is shown or search focused
    const searchFocused =
      document.activeElement === document.getElementsByName('search')[0];

    if (this.showEditor || searchFocused) {
      return;
    }

    if ( event.key === '/' ) {
      this.vc.first.nativeElement.focus();
    } else if ( event.key === '?' ) {
      alert('HELP');
    } else if ( event.key === 'j' ) {
      // j: Select next item
      this.store.dispatch(new appActions.SelectNextItem());
    } else if ( event.key === 'k' ) {
      // k: Select previous item
      this.store.dispatch(new appActions.SelectPrevItem());
    } else if ( event.key === 'e' ) {
      // Toggle the editor
      this.toggleEditor();
    } else if ( event.key === 'n' ) {
      // Toggle the editor
      this.toggleEditor();
    } else {
      console.log('keyEvent: no handler for key: ', event.key);
    }
  }

  toggleEditor() {
      this.store.dispatch(new appActions.ToggleEditor());
  }

  filterSearch() {
    console.log('filter search');
  }

  doSearch() {
    console.log('SEARCHING!!!');
  }

}
