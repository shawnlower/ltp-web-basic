import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Action, Store, select } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';

import { Subject, Observable } from 'rxjs';

import { Item } from '../../models/item.model';

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
export class ModalEditorComponent implements OnInit {

  @Input() initText: string;
  @Input() closable = true;
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  item$: Observable<Item>;

  constructor(public store: Store<fromRoot.State>) { }

  ngOnInit() {
  }

  toggleEditor() {
      this.store.dispatch(new appActions.ToggleEditor());
  }
}
