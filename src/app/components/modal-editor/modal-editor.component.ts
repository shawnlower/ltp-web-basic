import {
         AfterViewInit,
         Component,
         ComponentFactoryResolver,
         Directive,
         ElementRef,
         Input,
         OnInit,
         OnDestroy,
         QueryList,
         Renderer,
         Type,
         ViewChild,
         ViewChildren,
       } from '@angular/core';

import { FormArray,
         FormControl,
         FormBuilder,
         FormGroup,
         Validators
       } from '@angular/forms';

import { trigger, style, animate, transition } from '@angular/animations';

// ngrx
import { Action,
         State,
         Store,
         select } from '@ngrx/store';

// rxjs
import { Subject, Observable, of, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, merge, concat,
         flatMap, mergeMap, filter, last, map, switchMap,
         take
       } from 'rxjs/operators';

// Keyboard Shortcuts
import {
      KeyboardShortcutsService
    } from '../../services/keyboard-shortcuts.service';
import { Unlisten } from '../../services/keyboard-shortcuts.service';

// misc
import * as uuid from 'uuid';
import * as jsonld from '../../../assets/js/jsonld.js';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';

// forms
import { typePresentValidator,
         jsonValidator
       } from '../../directives/form-validator.directive';

import * as fromRoot from '../../reducers';

import * as appActions from '../../actions/app.actions';
import * as editorActions from '../../actions/editor.actions';
import * as itemActions from '../../actions/item.actions';

import { ItemDirective } from '../../directives/item.directive';

import { Item, JsonLD } from '../../models/item.model';
import { IRDFSClass, IRDFSProperty } from '../../models/schema.model';
import { SchemaService } from '../../services/schema.service';

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
export class ModalEditorComponent implements
  AfterViewInit,
  OnInit,
  OnDestroy {

  @Input() initText: string;
  @Input() closable = true;
  @Input() visible: boolean;
  @Input() item: Item;

  @ViewChild('typeUrl') typeUrl: ElementRef;
  @ViewChild('rawInput') rawInput: ElementRef;

  public unlisten: Unlisten;
  public unlistenInput: Unlisten;

  modalTitle: string; // A formatted string, e.g. type label + description
  currentItem: Item;
  currentItem$: Observable<Item>;

  expandedJson: object;
  form: FormGroup;

  contentLoaded: boolean; // controls spinner/loader

  private resultOptionsSubject: Subject<any> = new Subject<any>();

  staticSearchResults: string[];
  searchResults: Observable<string[]>;

  // RDF properties of a given type
  propertySearchResults$: Observable<IRDFSProperty[]>;

  public model: any;

  showRawInputBox: boolean;

  constructor(private formBuilder: FormBuilder,
    private componentFactoryResolver: ComponentFactoryResolver,
    private store: Store<fromRoot.State>,
    private schema: SchemaService,
    public keyboardShortcuts: KeyboardShortcutsService) {
    this.keyboardShortcuts = keyboardShortcuts;

    store.select(state => state.editor.item).subscribe(item => {
      this.currentItem = item;
      this.getModalTitle(item).then(title => {
        this.modalTitle = title;
      });
    });

    this.contentLoaded = false;
    this.showRawInputBox = false;

    this.setupForm();
    this.searchResults = of([
      'http://schema.org/Book',
      'http://schema.org/Movie',
      'http://schema.org/NoteDigitalDocument',
      'http://schema.org/Person',
      'http://schema.org/Place',
      'http://schema.org/Restaurant',
      'http://schema.org/Thing',
    ]);

    this.form.controls['json'].valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged())
      .subscribe(v => {
        if ( !this.form.controls.json.errors ) {
          /*
           * Create 'item' from JSON
           */

          const json = JSON.parse(v);

          const item    = new Item(json);
          /*
          item.observed = new Date(Date.now()).toUTCString();
          item.sameAs   = 'http://shawnlower.net/o/' + uuid.v1();
          item.data = json;
          */

          // No type key found. See below for potential reasons
          this.store.dispatch(new editorActions.LoadItem(item));

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

  ngAfterViewInit() {
  }

  getModalTitle(item: Item): Promise<string> {
    /*
     * Return a formatted title
     */

    if (!item || !item.data) {
      return new Promise(() => '<new item>');
    }

    const typeUrl = item.typeUrl;
    console.log('[getModalTitle] typeUrl', item);

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

        console.log( 'Handler [ 100 ]: ', event);
        // this.saveChanges();
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

        console.log( 'Handler [ 100 ]: ', event);
        event.preventDefault();

      },
      'Control.Enter': ( event: KeyboardEvent ): void => {
        /*
         * Submit dialog
         */

        console.log( 'Handler [ 100 ]: ', event);
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
    /*
     * Upon initalization, we call initEditor()
     * which either
     * a) Takes any item that our item list put into the store, into the
     *    editor, or:
     * b) Loads a default item, e.g. a digital 'note' item
     *
     */

    this.unlisten = this.keyHandler();
    this.unlistenInput = this.keyHandlerInput();

    this.store.select(state => state.editor)
      .pipe(take(1))
        .subscribe(editorState => this.initEditor(editorState))
        .unsubscribe();

    this.currentItem$ = this.store.select(state => state.editor.item)
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      );

    /*
     * Observable not working correctly in template
     * :-(
     */
    this.currentItem$.subscribe(item => {
      // console.log('[ngOnInit: editor.item]', item);
      this.currentItem = item;
    });

  }

  public ngOnDestroy(): void {

    this.store.dispatch(new editorActions.EditorClosed());

    if (this.unlisten) { this.unlisten(); }
    if (this.unlistenInput) { this.unlistenInput(); }

  }

  async loadItem(item: Item, lock = true) {
    /*
     * Can be called at any time, to clear the editor and load a new item
     * lock: controls whether to lock the typeUrl control
     */
    // console.log('[rdfEditor:loadItem]', item);

    if (item) {
      this.store.dispatch(new editorActions.LoadItem(item));
      // Set expandedJson which is used by the item-section component,
      // then update the type field
      const expanded = await jsonld.expand(item.properties);
      this.expandedJson = expanded;
      const typeUrl = item.typeUrl;

      // Set readable label for Item type
      this.schema.getLabelForType(typeUrl).then(label =>
        this.form.controls['typeUrl'].setValue(label));

      if (lock) {
        this.form.controls['typeUrl'].disable();
      }
    }
  }

  handleTypeChange(typeUrl: string): void {
    /*
     * Called when the 'typeUrl' control changes.
     *
     * If an item is not loaded, load the default.
     *
     * We only allow the type to be changed once, which triggers the other
     * form controls to be populated.
     *
     */
    // console.log('[handleTypeChange] args', arguments);

    if (this.currentItem === null) {
      this.loadDefaultItem(typeUrl);
    }
  }

  loadDefaultItem(typeUrl: string): void {
    /*
     * Construct an empty Item from a given Type URL
     * this item should contain the default properties for that
     * type.
     *
     * loadItem() will then construct the form / DOM elements
     */

    const defProperties = this.schema.getDefaultProperties(typeUrl);

    const data = {
      '@type': typeUrl
    };
    if (defProperties) {
      for (const property of defProperties) {
        data[property.id] = '';
      }
    }

    const item    = new Item(typeUrl);
    item.load(data).then(() => this.loadItem(item, false));
  }


  initEditor(editorState) {
    /*
     * Called upon initialization
     */
    // console.log('[initEditor]', editorState);

    // Load a default item if we don't have one already loaded
    if (editorState.item) {
      this.loadItem(editorState.item);
    }

    const DEFAULT_TYPE = 'http://schema.org/NoteDigitalDocument';

    this.form.controls['typeUrl'].setValue(DEFAULT_TYPE);
    this.typeUrl.nativeElement.focus();
    this.typeUrl.nativeElement.select();

    this.contentLoaded = true;

  }

  setupForm(): void {
    this.form = this.formBuilder.group({
      typeUrl: new FormControl('', [
        Validators.required
      ]),
      ctlAddProperty: new FormControl('', [
      ]),
      json: new FormControl('', [
        Validators.required,
        jsonValidator
      ])
    });
  }

  addProperty(propertyName: string) {
    /*
     * Called when we add a new property from the form
     * We need to update the current item with the new property,
     * BUT should likely do that as part of the blur event, or
     * when the control becomes dirty, AKA: when data is added.
     */
    console.log('[addProperty] args', arguments);
    if (this.propertySearchResults$) {
      this.propertySearchResults$.pipe(
        last(),
        map(properties =>
          properties.filter(prop =>
            prop && prop.label === propertyName)),
        map(p => {
          console.log('[addProperty]: ', p);

          // test just updating the expandedJson
          /*
        if (p[0].id in this.expandedJson[0]){
          this.expandedJson[0][p[0].id]['@value'].push
           */

        })
      ).subscribe();
    }
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

  doPropertySearch(term) {

    const typeUrl = this.schema.getValue(this.expandedJson[0]['@type']);
    if (!typeUrl.startsWith('http')) {
      console.error(`Invalid type: ${typeUrl}. Expected http...`);
      return of(['Invalid type']);
    }

    this.propertySearchResults$ = from(this.schema.getProperties(typeUrl));

    // create a subscriber, so that we can use the structured objects
    // in the addProperty() onBlur() handler
    this.propertySearchResults$.subscribe();

    return this.propertySearchResults$.pipe(
      map(properties => properties
        .filter(property => property && 'label' in property)
        .map(property => this.formatPropertyLabel(property, term))
        .filter(label =>
          label.toLowerCase()
          .indexOf(term.toLowerCase()) > -1)
        .sort()),
      map(labels => {
        const maxResults = 10;
        if (labels.length > maxResults) {
          return labels.slice(0, maxResults).concat(
            [ ` ... ${labels.length - maxResults} more` ]);
        } else {
          return labels;
        }
      })

    );
  }

  formatPropertyLabel(property: IRDFSProperty, term: string): string {
    return property.label[0].toUpperCase() +
           property.label.substring(1) + ':  ' + property.comment;
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      flatMap(i => this.doSearch(i)
      )
    )

  propertySearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      flatMap(i => this.doPropertySearch(i)
      )
    )
  saveChanges(): void {

    this.store.select(state => state.editor.item).pipe(
      take(1),
      map(item => {
        this.store.dispatch(new itemActions.UpdateItem(item));
        this.toggleEditor();
        return item;
      })).subscribe(item => console.log('[saveChanges] data', item));
  }

  toggleEditor() {
    this.store.dispatch(new appActions.ToggleEditor());
  }
}
