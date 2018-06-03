import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Action, Store, select } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';

import { Item } from '../models/item.model';

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
  testitem: Observable<string>;

  actions$ = new Subject<Action>();


  constructor(store: Store<any>) {
		// Get the current item
		// this.item$ = store.pipe();
		// this.testitem = Observable.call((() => 'abcdef'));
		// this.item$.subscribe(i => console.log('**** got: ' + i));
		// store.select(state => { console.log('abc' + state); return state; }).subscribe(i => console.log('**** got: ' + i));
		console.log(store.select(s => s).subscribe(this.updateForm));
		this.actions$.subscribe(store);
		this.actions$.forEach(i => { console.log(i) });
		// this.item.forEach(i => console.log(i));
	}

	updateForm(state){
		console.log(state);

	}

  ngOnInit() {
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

}
