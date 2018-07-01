import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

import { Action, Store, select } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';
import * as editorActions from '../../actions/editor.actions';
import * as itemActions from '../../actions/item.actions';

import { SchemaService } from '../../services/schema.service';

import { Item, getTypeUrl } from '../../models/item.model';

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
  @Input() item: Item;

  public unlisten: Unlisten;
  public unlistenInput: Unlisten;

  modalTitle: string; // A formatted string, e.g. type label + description
  currentItem: Item;
  currentItem$: Observable<Item>;

  constructor(public store: Store<fromRoot.State>,
              private schema: SchemaService,
              public keyboardShortcuts: KeyboardShortcutsService) {
    this.keyboardShortcuts = keyboardShortcuts;

    store.select(state => state.editor.item).subscribe(item => {
      this.currentItem = item;
      this.getModalTitle(item).then(title => {
        this.modalTitle = title;
      });
    });

  }

  getModalTitle(item: Item): Promise<string> {
    /*
     * Return a formatted title
     */

    if (!item || !item.data) {
      return new Promise(() => '<new item>');
    }

    const typeUrl = getTypeUrl(item.data);

    return this.schema.getLabelForType(typeUrl).then(label => {
      return `${label}`;
    }).catch(err => {
      console.log('[getModalTitle] error fetching label', err);
      return '';
    });
  }

  keyHandlerInput(): Unlisten {
    // Handle shortcuts within an input dialog

    return this.keyboardShortcuts.listen({
      'Control.Enter': ( event: KeyboardEvent ): void => {
        /*
         * Submit dialog
         */

        console.log( 'Handler[ 0 ]: ', event);
        event.preventDefault();

      },
      'Escape': ( event: KeyboardEvent ): void => {

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

    return this.keyboardShortcuts.listen({
      'Shift.?': ( event: KeyboardEvent ): void => {
        /*
         * Show help dialog
         */

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

    this.store.dispatch(new editorActions.EditorClosed());

    if (this.unlisten) { this.unlisten(); }
    if (this.unlistenInput) { this.unlistenInput(); }

  }

  saveChanges(): void {

    this.store.select(state => state.editor.item).pipe(
      take(1),
      map(item => {
        this.store.dispatch(new itemActions.ItemLoaded(item));
      })).subscribe(item => {
        console.log('[saveChanges]', this.item);
        this.toggleEditor();
      });
  }

  toggleEditor() {
    this.store.dispatch(new appActions.ToggleEditor());
  }
}
