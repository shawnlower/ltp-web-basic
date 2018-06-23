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

import { FormArray,
         FormControl,
         FormBuilder,
         FormGroup,
         Validators
       } from '@angular/forms';

import { jsonValidator } from '../../directives/form-validator.directive';

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
export class RdfaEditorComponent implements AfterViewInit, OnInit {

  @Input() item: Item;
  @Input() typeUrl: string;
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
    private store: Store<fromRoot.State>,
    private renderer: Renderer
  ) {

    this.contentLoaded = false;
    this.componentRefs = [];
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
        if ( !this.form.controls.json.errors ) {
          /*
           * Create 'item' from JSON
           */
          let data: Item;
          const id = 'http://shawnlower.net/i/918348';

          const  json = JSON.parse(v);
          let typeUrl: string;
          if ('@type' in json) {
            typeUrl = json['@type'];
          } else {
            // TODO: app config
            typeUrl = 'https://schema.org/Thing';
            console.log(`No @type specified. Using ${typeUrl}`);
          }

          data = {
            url: id,
            dataType: typeUrl,
            json: json
          };

          this.store.dispatch(new editorActions.LoadItem(data));
          console.log('Creating item', data);
        }
    });

  }

  ngOnInit() {
    // Perform initialization steps for editor modal
    this.store.select(state => state.editor)
      .subscribe(editorState => this.initEditor(editorState));

    this.store.select(state => state.editor.item)
      .pipe(take(1))
      .subscribe(item => this.updateItem(item));
  }

  ngAfterViewInit() {
  }

  updateItem(item) {
    // If our editor has an item, load the content
    if (item) {
      this.reloadItem(item);
    } else {
      // Otherwise, show a raw input box
      this.showRawInputBox = true;

    }
  }

  initEditor(editorState) {
    this.contentLoaded = true;
    // todo: pending application configuration store
    this.typeUrl = 'https://schema.org/NoteDigitalDocument';
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
    // Fetch the items from our service
    this.dynamicContentService.renderItem(this.item).then(refs => {
      this.componentRefs = refs;
      this.contentLoaded = true;
    });
  }

  reloadItem(item: Item): void {
    this.componentRefs.forEach(containerRef => containerRef.destroy());

    // Spinner-time
    this.contentLoaded = false;

    this.getItemComponent(item);
    // Update the item type field
    this.form.controls.typeUrl.setValue(this.item.dataType);
  }

  setupForm(): void {
    this.form = this.formBuilder.group({
      typeUrl: new FormControl('', [jsonValidator]),
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

