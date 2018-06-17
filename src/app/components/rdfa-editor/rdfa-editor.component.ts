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

import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, merge, concat,
         flatMap, mergeMap, filter, last, map, switchMap
       } from 'rxjs/operators';

import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';

import { ItemDirective } from '../../directives/item.directive';
import { ItemComponent } from '../item/item.component';
import { ItemSectionComponent } from '../item-section/item-section.component';

import { Item } from '../../models/item.model';


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

  @ViewChild(ItemDirective) itemHost: ItemDirective;

  private resultOptionsSubject: Subject<any> = new Subject<any>();

  staticSearchResults: string[];
  searchResults: Observable<string[]>;

  public model: any;

  constructor(private formBuilder: FormBuilder,
    private store: Store<fromRoot.State>,
    private componentFactoryResolver: ComponentFactoryResolver) {

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
    console.log('itemHost', this.itemHost);
    this.reloadItem(this.item);
  }

  ngAfterViewInit() {
  }

  getItemComponent(item) {
    const sectionData: object = {
      headline: 'test headline',
      body: 'test body'
    };

    // Build a item header component
    const itemHeaderComponent = new ItemComponent(
      ItemSectionComponent, sectionData);
    const headerComponentFactory = this.componentFactoryResolver
      .resolveComponentFactory(itemHeaderComponent.component);

    const viewContainerRef = this.itemHost.viewContainerRef;
    viewContainerRef.clear();

    // Build item section components
    for (const id in [0, 1]) {
      if (id) {
        const sectionData: object = {
          headline: 'section headline',
          body: 'test body',
          json: this.item,
          id: id,
        };

        const itemSectionComponent = new ItemComponent(
          ItemSectionComponent, sectionData);

        const sectionComponentFactory = this.componentFactoryResolver
          .resolveComponentFactory(itemSectionComponent.component);

        const componentRef = viewContainerRef.createComponent(
          sectionComponentFactory);

        (<ItemComponent>componentRef.instance).data = sectionData;
      }
    }


  }

  reloadItem(item: Item): void {
    console.log('reloading', item);

    /*
    const itemComponent = new ItemComponent(ItemSectionComponent, sectionData);
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(itemComponent.component);

    const viewContainerRef = this.itemHost.viewContainerRef;

    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);

    (<ItemComponent>componentRef.instance).data = sectionData;
     */

    this.getItemComponent(item);
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

