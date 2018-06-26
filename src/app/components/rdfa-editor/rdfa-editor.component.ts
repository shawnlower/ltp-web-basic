import {
         AfterViewInit,
         Component,
         ComponentFactoryResolver,
         Directive,
         ElementRef,
         Input,
         OnInit,
         QueryList,
         Renderer,
         Type,
         ViewChild,
         ViewChildren,
       } from '@angular/core';

import * as uuid from 'uuid';

import { FormArray,
         FormControl,
         FormBuilder,
         FormGroup,
         Validators
       } from '@angular/forms';

import { typePresentValidator,
         jsonValidator
       } from '../../directives/form-validator.directive';

import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';

import { Action, State, Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, merge, concat,
         flatMap, mergeMap, filter, last, map, switchMap,
         take
       } from 'rxjs/operators';

import * as fromRoot from '../../reducers';
import * as editorActions from '../../actions/editor.actions';
import * as appActions from '../../actions/app.actions';

import { ItemDirective } from '../../directives/item.directive';
import { ItemSectionComponent } from '../item-section/item-section.component';

import { Item, JsonLD } from '../../models/item.model';
import { SchemaService } from '../../services/schema.service';

import { DynamicContentService } from '../../services/dynamic-content-service.service';

interface AdItem {
  new (component: Type<any>, data: any): any;
}

@Component({
  selector: 'app-rdfa-editor',
  templateUrl: './rdfa-editor.component.html',
  styleUrls: ['./rdfa-editor.component.css'],
})
export class RdfaEditorComponent implements AfterViewInit, OnInit {

  @Input() item: Item;
  @ViewChild('typeUrl') typeUrl: ElementRef;
  @ViewChild('rawInput') rawInput: ElementRef;

  form: FormGroup;

  contentLoaded: boolean; // controls spinner/loader

  // A viewchild bound to the 'selector' property of our directive
  @ViewChild(ItemDirective) itemHost: ItemDirective;
  private componentRefs: Array<any>;

  private resultOptionsSubject: Subject<any> = new Subject<any>();

  staticSearchResults: string[];
  searchResults: Observable<string[]>;

  public model: any;

  showRawInputBox: boolean;

  constructor(private formBuilder: FormBuilder,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dynamicContentService: DynamicContentService,
    private schema: SchemaService,
    private store: Store<fromRoot.State>,
    private renderer: Renderer
  ) {

    this.contentLoaded = false;
    this.componentRefs = [];
    this.showRawInputBox = false;

    this.setupForm();
    this.searchResults = of([
      'http://schema.org/NoteDigitalDocument',
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
        if ( !this.form.controls.json.errors ) {
          /*
           * Create 'item' from JSON
           */

          const  json = JSON.parse(v);

          const item    = new Item(json);
          item.observed = new Date(Date.now()).toUTCString();
          item.sameAs   = 'http://shawnlower.net/o/' + uuid.v1();

          // No type key found. See below for potential reasons
          if ('@type' in item.data) {
            this.store.dispatch(new editorActions.LoadItem(item));
          }

          /*
          *{
          *  "@context": {
          *      "ical": "http://www.w3.org/2002/12/cal/ical#",
          *      "xsd": "http://www.w3.org/2001/XMLSchema#",
          *      "ical:dtstart": {
          *        "@type": "xsd:dateTime"
          *      }
          *  },
          *  "ical:summary": "Lady Gaga Concert",
          *  "ical:location": "New Orleans Arena, New Orleans, Louisiana, USA",
          *  "ical:dtstart": "2011-04-09T20:00Z"
          *}
          *
          * Here, an item without a specific type, has several attributes, which
          * themselves happen to be from the same uri prefix (ical:)
          *
          * The decision here would be to either reject the item, or apply some
          * default type (e.g. schema.org/Thing)
          */

        }
    });

  }

  ngOnInit() {
    // Perform initialization steps for editor modal
    this.store.select(state => state.editor)
      .pipe(take(1))
        .subscribe(editorState => this.initEditor(editorState))
        .unsubscribe();

    this.store.select(state => state.editor.item)
      .subscribe(item => this.updateItem(item));
  }

  ngAfterViewInit() {
  }

  updateItem(item: Item) {
    console.log('[rdfEditor:updateItem]', item);
    // If our editor has an item, load the content
    if (item) {
      this.reloadItem(item);
      // Update the item type field
      const itemType = item.data['@type'];
      if (itemType && itemType.startsWith('http:')) {
        this.form.controls.typeUrl.setValue(itemType);
      }
    } else {
      // Otherwise, show a raw input box
      // this.showRawInputBox = true;
    }
  }

  handleTypeChange(typeUrl: string): void {
    this.schema.getLabelForType(typeUrl).then(label => {

      console.log('[handleTypeChange]', typeUrl, label);
      /*
       * Currently, we won't allow changing the type after it's been
       * selected. In the future, we'll allow it, prompt to clear the form
       * or handle conversions between compatible classes, etc.
       * For now, just close and re-open :-/
       */
      this.form.controls['typeUrl'].setValue(label);
      this.form.controls['typeUrl'].disable();

      /*
       * Next, populate the inputs for this type.
       *
       * 1) Get, for the set of vocabularies we are using (schema, etc):
       *     { "@id": "xxx:some_type",
       *       "schema:rangeIncludes": {
       *       "@id": "${typeUrl}" }
       *
       */

      /*
       * Attach an input
       */

      /*
       * mock impl
       */

      const data = {
          '@type': 'NoteDigitalDocument',
          '@context': 'https://schema.org/',
          'text': '',
          'dateCreated': ''
      };
      const item    = new Item(data);
      item.observed = new Date(Date.now()).toUTCString();
      item.sameAs   = 'http://shawnlower.net/o/' + uuid.v1();
      this.store.dispatch(new editorActions.LoadItem(item));

      /*
       * Attach our new item to the dom
       */
      const viewContainerRef = this.itemHost.viewContainerRef;
      // Fetch the items from our service
      this.dynamicContentService.renderItem(item, viewContainerRef)
      .then(refs => {
        this.componentRefs = refs;
        this.contentLoaded = true;
      });
    });
  }

  initEditor(editorState) {
    this.typeUrl.nativeElement.focus();
    this.contentLoaded = true;

  }

  getItemComponent(item: Item) {
    /*
     * Use the dynamic content service to render a modal editor, based on
     * a JSON-LD payload
     * TODO:
     *  - Allow customized layouts
     *  - For 'new' items, pre-fill with defaults, search
     *  - Semantic enrichment / upgrade from Thing -> Note -> Todo, etc
     */

    const viewContainerRef = this.itemHost.viewContainerRef;
    // Fetch the items from our service
    this.dynamicContentService.renderItem(item, viewContainerRef)
      .then(refs => {
        this.componentRefs = refs;
        this.contentLoaded = true;
      });
  }

  reloadItem(item: Item): void {
    this.componentRefs.forEach(containerRef => containerRef.destroy());

    // Spinner-time
    this.contentLoaded = false;

    this.getItemComponent(item);
  }

  setupForm(): void {
    this.form = this.formBuilder.group({
      typeUrl: new FormControl('', [
        Validators.required
      ]),
      json: new FormControl('', [
        Validators.required,
        jsonValidator
      ])
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

