import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup } from '@angular/forms';

import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';

import { Action, Store } from '@ngrx/store';

import { Subject, Observable, of, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, merge, concat,
         flatMap, mergeMap, filter, last, map, switchMap
       } from 'rxjs/operators';

import * as uuid from 'uuid';


import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';
import * as editorActions from '../../actions/editor.actions';

import { Item } from '../../models/item.model';

import { SchemaService } from '../../services/schema.service';

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

  properties$: Observable<any>;

  private resultOptionsSubject: Subject<any> = new Subject<any>();

  searchResults: Observable<string[]>;
  rdfClasses: Observable<string[]>;
  rdfProps: Observable<string[]>;

  public model: any;

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      flatMap(i => this.doSearch(i)
      )
    )

  constructor(private formBuilder: FormBuilder,
              private schema: SchemaService,
              private store: Store<fromRoot.State>) {

    this.setupForm();

    this.searchResults = of([
      'https://schema.org/NoteDigitalDocument',
      'http://schema.org/Person',
      'http://schema.org/Restaurant',
      'http://schema.org/Thing',
    ]);

    this.rdfProps = of([
      'https://schema.org/NoteDigitalDocument',
      'http://schema.org/Person',
      'http://schema.org/Restaurant',
      'http://schema.org/Thing',
    ]);

    this.rdfClasses = of([
      'https://schema.org/NoteDigitalDocument',
      'http://schema.org/Person',
      'http://schema.org/Restaurant',
      'http://schema.org/Thing',
    ]);

    this.form.controls['typeUrl'].valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged())
      .subscribe(v => {
        // console.log('typeUrl updated to', v);
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

  handleTypeChange(typeUrl: string) {
    this.loadDefaultItem();
    this.properties$ = from(this.schema.getProps(typeUrl));
    // this.properties$.subscribe();

  }

  loadItem(item: Item, lock = true) {
    /*
     * Can be called at any time, to clear the editor and load a new item
     * lock: controls whether to lock the typeUrl control
     */

    if (item) {
      this.store.dispatch(new editorActions.LoadItem(item));
    }
  }

  loadDefaultItem() {
      /*
       * Next, populate the inputs for this type.
       *
       * 1) Get, for the set of vocabularies we are using (schema, etc):
       *     { "@id": "xxx:some_type",
       *       "schema:rangeIncludes": {
       *       "@id": "${typeUrl}" }
       *
       */

      const data = {
          '@type': 'NoteDigitalDocument',
          '@context': 'https://schema.org/',
          'text': '',
      };
      const item    = new Item(data);
      item.observed = new Date(Date.now()).toUTCString();
      item.sameAs   = 'http://shawnlower.net/o/' + uuid.v1();
      this.loadItem(item, false);
  }

}
