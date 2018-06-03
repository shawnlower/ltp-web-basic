import {
  Component,
  HostListener,
  Output,
  ViewChildren
} from '@angular/core';

import { Store } from '@ngrx/store';

import * as fromRoot from './reducers';
import * as appActions from './actions/app.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChildren('searchBox') vc;

    showEditor: boolean;

  constructor(public store: Store<fromRoot.State>) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log(event);

    if ( event.key === '/' ) {
      this.vc.first.nativeElement.focus();
    } else if ( event.key === '?' ) {
      alert('HELP');
    } else if ( event.key === 'e' ) {
      this.store.dispatch(new appActions.ToggleEditorAction());
      // this.toggleEditor();
    } else if ( event.key === 'n' ) {
      this.toggleEditor();
    }
  }


    toggleEditor() {
      this.showEditor = !this.showEditor;
      if ( this.showEditor ) {
            console.log( 'Editor modal visible.' );
      } else {
            console.log( 'Editor modal hidden.' );
      }
    }
}
