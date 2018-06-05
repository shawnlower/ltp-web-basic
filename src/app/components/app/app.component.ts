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

  constructor(public store: Store<fromRoot.State>) {
    this.showEditor$ = store.select(state => state.app.showEditor);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log(event);

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
      console.log(this.showEditor$.pipe(v => v));
      this.toggleEditor();
    } else if ( event.key === 'n' ) {
      // Toggle the editor
      this.toggleEditor();
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
