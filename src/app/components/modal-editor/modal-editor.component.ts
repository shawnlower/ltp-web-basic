import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Action, Store, select } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';

import { Subject, Observable } from 'rxjs';

import { Item } from '../../models/item.model';

import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { Unlisten } from '../../services/keyboard-shortcuts.service';

@Component({
  selector: 'app-modal-editor',
  templateUrl: './modal-editor.component.html',
  styleUrls: ['./modal-editor.component.css'],
  animations: [
    trigger('modal-editor', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
      ])
    ])
  ]
})
export class ModalEditorComponent implements OnInit, OnDestroy {

  @Input() initText: string;
  @Input() closable = true;
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  item$: Observable<Item>;
  @Input() item: Item;

  public unlisten: Unlisten;
  public unlistenInput: Unlisten;

  constructor(public store: Store<fromRoot.State>,
              public keyboardShortcuts: KeyboardShortcutsService) {
    this.keyboardShortcuts = keyboardShortcuts;
  }

  keyHandlerInput(): Unlisten {
    // Handle shortcuts within an input dialog
    console.log('Initalizing inputbox shortcuts');

    return this.keyboardShortcuts.listen({
      'Control.Enter': ( event: KeyboardEvent ): void => {
        /*
         * Submit dialog
         */

        console.log( 'Handler[ 0 ]: ', event);
        event.preventDefault();

      },
      'Escape': ( event: KeyboardEvent ): void => {

        console.log( 'Handler[ 0 ]: ', event );
        this.toggleEditor();

        event.preventDefault();

      }
    }, {
      // Priority should be lower than our modal
      priority: 150,
      inputs: true
    });
  }

  keyHandler(): Unlisten {
    console.log('Initalizing keyboard shortcuts');

    return this.keyboardShortcuts.listen({
      'Shift.?': ( event: KeyboardEvent ): void => {
        /*
         * Show help dialog
         */

        console.log( 'Handler[ 0 ]: ', event);
        alert('Halp.');
        event.preventDefault();

      },
      'Control.Enter': ( event: KeyboardEvent ): void => {
        /*
         * Submit dialog
         */

        console.log( 'Handler[ 0 ]: ', event);
        event.preventDefault();

      },
      'Escape': ( event: KeyboardEvent ): void => {

        console.log( 'Handler[ 0 ]: ', event );
        this.toggleEditor();

        event.preventDefault();

      }
    }, {
      // Priority should be lower than our modal
      priority: 100
    });
  }

  ngOnInit() {
    this.unlisten = this.keyHandler();
    this.unlistenInput = this.keyHandlerInput();
  }

  public ngOnDestroy(): void {

    if (this.unlisten) {
      this.unlisten();
    }

    if (this.unlistenInput) {
      this.unlistenInput();
    }


  }

  toggleEditor() {
    this.store.dispatch(new appActions.ToggleEditor());
  }
}
