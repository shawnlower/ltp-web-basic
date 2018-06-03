import {
  Component,
  Input,
  OnInit
} from '@angular/core';

import { FormArray, FormControl, FormBuilder, FormGroup } from '@angular/forms';

import { Action, Store } from '@ngrx/store';

import { Subject, Observable } from 'rxjs';

import { Item } from '../models/item.model';

// TODO: Move interface outside
interface AppState {
  item: Item;
}

@Component({
  selector: 'app-basic-editor',
  templateUrl: './basic-editor.component.html',
  styleUrls: ['./basic-editor.component.css']
})
export class BasicEditorComponent implements OnInit {

  @Input() item: Item;
  @Input() testitem: Item;
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      url: 'default url',
      dataType: 'default dataType'
    });

  }

  onChanges(): void {
    this.form.valueChanges.subscribe(val => {
      console.log(val);
    });
  }

  ngOnInit() {
      console.log(this.item);
  }

}
