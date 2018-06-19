import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Directive,
  Input,
  OnInit,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { FormArray, FormControl, FormBuilder, FormGroup } from '@angular/forms';

import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';

import { Action, Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, merge, concat,
         flatMap, mergeMap, filter, last, map, switchMap,
         take
       } from 'rxjs/operators';

import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';

import { ItemDirective } from '../../directives/item.directive';
import { ItemComponent } from '../item/item.component';
import { ItemSectionComponent } from '../item-section/item-section.component';

import { Item } from '../../models/item.model';

import { DynamicContentService } from '../../services/dynamic-content-service.service';

interface AdItem {
  new (component: Type<any>, data: any): any;
}

@Component({
  selector: 'app-rdfa-editor',
  templateUrl: './rdfa-editor.component.html',
  styleUrls: ['./rdfa-editor.component.css'],
})
export class RdfaEditorComponent implements OnInit, AfterViewInit {

  @Input() item: Item;
  @Input() typeUrl: string;
  form: FormGroup;

  // A viewchild bound to the 'selector' property of our directive
  @ViewChild(ItemDirective) itemHost: ItemDirective;
  private containerRefs: Array<any>;

  private resultOptionsSubject: Subject<any> = new Subject<any>();

  staticSearchResults: string[];
  searchResults: Observable<string[]>;

  public model: any;

  showRawInputBox: boolean;

  constructor(private formBuilder: FormBuilder,
    private store: Store<fromRoot.State>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dynamicContentService: DynamicContentService
  ) {

    this.containerRefs = [];
    this.showRawInputBox = false;

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

    this.form.controls['json'].valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged())
      .subscribe(v => {
        console.log('json updated to', v);
    });

  }

  ngOnInit() {

    this.store.select(state => state.editor.item).pipe(
      take(1))
      .subscribe(item => {
        if (item) {
          this.reloadItem(item);
        } else {
          console.log('nothing suitable in the store', item);
          this.resetEditor();
        }
      });


  }

  resetEditor() {
    this.showRawInputBox = true;
  }
  ngAfterViewInit() {
  }

  getItemComponent(item) {
    /*
     * Use the dynamic content service to render a modal editor, based on
     * a JSON-LD payload
     * TODO:
     *  - Allow customized layouts
     *  - For 'new' items, pre-fill with defaults, search
     *  - Semantic enrichment / upgrade from Thing -> Note -> Todo, etc
     */

    const viewContainerRef = this.itemHost.viewContainerRef;
    this.dynamicContentService.setRootViewContainerRef(viewContainerRef);
    this.containerRefs = this.dynamicContentService.renderItem(this.item);
  }

  reloadItem(item: Item): void {
    // Spinner-time
    this.containerRefs.forEach(containerRef => containerRef.destroy());
    this.getItemComponent(item);
  }

  setupForm(): void {
    this.form = this.formBuilder.group({
      typeUrl: new FormControl(),
      json: new FormControl()
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

