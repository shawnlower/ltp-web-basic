import {
  Component,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup } from '@angular/forms';

import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';

import { Action, Store } from '@ngrx/store';

import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, merge, concat, flatMap, mergeMap, filter, last, map, switchMap } from 'rxjs/operators';

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

  private resultOptionsSubject: Subject<any> = new Subject<any>();

  staticSearchResults: string[];
  searchResults: Observable<string[]>;

  public model: any;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      // close modal
      this.store.dispatch(new appActions.ToggleEditor());
    }
  }

  constructor(private formBuilder: FormBuilder,
              public store: Store<fromRoot.State>) {
    this.form = new FormGroup({
      typeUrl: new FormControl(),
      dataType: new FormControl()
    });

    this.searchResults = of([
      'http://schema.org/Restaurant',
      'http://schema.org/Person',
      'http://schema.org/Thing',
    ]);
    /*
    this.form = this.formBuilder.group({
      typeUrl: '',
      dataType: 'default dataType'
    });
     */

    this.form.controls['typeUrl'].valueChanges.subscribe(v => console.log('typeUrl', v));
  }

  onChanges(): void {
    console.log('this', this);
  }

  ngOnInit() {
  }

  doSearch(term) {
    // Case-insensitive mock search
    return this.searchResults.pipe(
      map(results =>
        results.filter(result => result.toLowerCase().indexOf(term.toLowerCase()) > -1)
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
