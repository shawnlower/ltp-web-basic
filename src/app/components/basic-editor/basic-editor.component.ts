import {
  Component,
  HostListener,
  Input,
  OnInit
} from '@angular/core';

import { FormArray, FormControl, FormBuilder, FormGroup } from '@angular/forms';

import { Action, Store } from '@ngrx/store';

import { Subject, Observable } from 'rxjs';

import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';

import { Item } from '../../models/item.model';

// TODO: Move interface outside
interface AppState {
  item: Item;
}

@Component({
  selector: 'app-basic-editor',
  templateUrl: './basic-editor.component.html',
  styleUrls: ['./basic-editor.component.css'],
})
export class BasicEditorComponent implements OnInit {

  @Input() item: Item;
  @Input() typeUrl: Item;
  @Input() testitem: Item;
  form: FormGroup;


  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      // close modal
      this.store.dispatch(new appActions.ToggleEditor());
    }
  }

  constructor(private formBuilder: FormBuilder,
              public store: Store<fromRoot.State>) {
    this.form = this.formBuilder.group({
      typeUrl: '',
      dataType: 'default dataType'
    });

    this.form.controls['typeUrl'].valueChanges.subscribe(v => console.log('typeUrl', v));
  }

  onChanges(): void {
    console.log('this', this);
  }

  ngOnInit() {
  }

}
