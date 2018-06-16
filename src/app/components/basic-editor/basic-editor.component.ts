import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup } from '@angular/forms';

import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';

import { Action, Store } from '@ngrx/store';

import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, merge, concat,
         flatMap, mergeMap, filter, last, map, switchMap
       } from 'rxjs/operators';

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
  @Input() typeUrl: string;
  @Input() testitem: Item;
  form: FormGroup;

  currentItem$: Observable<Item>;

  private resultOptionsSubject: Subject<any> = new Subject<any>();

  staticSearchResults: string[];
  searchResults: Observable<string[]>;

  public model: any;

  constructor(private formBuilder: FormBuilder,
              private store: Store<fromRoot.State>) {

    this.setupForm();
    this.searchResults = of([
      'https://schema.org/NoteDigitalDocument',
      'http://schema.org/Person',
      'http://schema.org/Restaurant',
      'http://schema.org/Thing',
    ]);

    this.form.controls['typeUrl'].valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged())
      .subscribe(v => {
        console.log('typeUrl updated to', v);
    });

  }

  ngOnInit() {
    this.currentItem$ = this.store.select( state => state.item.selectedItem);
    this.currentItem$.subscribe(this.reloadItem);
  }

  reloadItem(item: Item): void {
    console.log('reloading', item);
  }

  setupForm(): void {
    this.form = this.formBuilder.group({
      typeUrl: new FormControl(),
      dataType: new FormControl()
    });
  }

  doSearch(term) {
    // Case-insensitive mock search
    return this.searchResults.pipe(
      map(results =>
        results.filter(result => result.toLowerCase()
                                       .indexOf(term.toLowerCase()) > -1)
      )
    );
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      flatMap(i => this.doSearch(i)
      )
    )
}
