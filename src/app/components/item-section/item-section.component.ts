import * as uuid from 'uuid';

import {
         AfterViewInit,
         Component,
         Input,
         OnInit,
       } from '@angular/core';

import {
         FormControl,
       } from '@angular/forms';


import { Subject, Observable, of, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, merge, concat,
         flatMap, mergeMap, filter, last, map, switchMap,
         take
       } from 'rxjs/operators';

import { Item } from '../../models/item.model';
import { IRDFSClass, IRDFSProperty } from '../../models/schema.model';

import { HeaderSectionData } from '../item-header/item-header.component';

import { SchemaService } from '../../services/schema.service';

@Component({
  selector: 'app-item-section',
  template: `
  <div *ngFor="let subitem of subitems">
    <div [ngSwitch]="subitem.component">

      <!-----------------
        Header
      ------------------->
      <ng-container *ngSwitchCase="'header'">
        <app-item-header
          [data]="subitem.data">
        </app-item-header>
      </ng-container>

      <!-----------------
        URL Links
      ------------------->
      <ng-container *ngSwitchCase="'href'">
        <div class="input-group mb-1 mt-1">
          <label
                 for="{{ subitem.label }}-{{ this.sectionPrefix }}"
                 class="input-group-text mr-2">
                 {{ subitem.label }}
          </label>
          <span
            id="{{ subitem.label }}-{{ this.sectionPrefix }}"
            >
            <a
               href="{{ subitem.value }}"
               rel="{{ subitem.property }}"
            >{{ subitem.value }}
            </a>
          </span>
        </div>
      </ng-container>

      <!-----------------
        Raw value
      ------------------->
      <ng-container *ngSwitchCase="'value'">
        <div class="input-group mb-1 mt-1">
          <div class="input-group-prepend">
            <label
                   for="{{ subitem.label }}-{{ this.sectionPrefix }}"
                   class="input-group-text">
                   {{ subitem.label }}
            </label>

            <input
                   [attr.about]="subitem.subject"
                   [attr.property]="subitem.property"
                   [attr.value]="subitem.value"
                   id="{{ subitem.id }}"
                   (blur)="updateProperty(subitem)"
                   class="form-control">
            </div>
          </div>
      </ng-container>

      <!-----------------
        ! fallthrough !
      ------------------->
      <div *ngSwitchDefault>
        <p>**** DEFAULT ***</p>
        <p>{{ subitem | json }}</p>
      </div>

    </div>
  </div>
  `
})

export class ItemSectionComponent implements OnInit {

  @Input() form: any;
  @Input() item$: Observable<Item>;

  header: HeaderSectionData;
  subitems = [];
  values = [];
  sectionPrefix: string; // used to generate unique labels

  typeLabel: string;

  constructor(private schema: SchemaService) {
  }

  async initSection(item) {
    /*
     * simplified initSection
     */
    console.log('[initSection] args', arguments);

    const properties = await item.properties;
    console.log('[initSection] properties', properties);

    // Get a list of unique subject IRIs, where our primary subject
    // comes first
    const subjects = [ item.uri, ...new Set(
      properties
        .map(property => property.s)
        .filter(subject => subject !== item.uri)
    ) ];

    for (const subject of subjects) {
      console.log('[initSection] subj', subject);

      /*
       * If this isn't the primary subject, write a small header
       */
      if (subject !== item.uri) {

          const typeUrl = properties
            .filter(property => property.s === subject &&
                                property.p === '@type')
            .map(property => property.o[0])[0];

        const sectionLabel = await this.schema.getLabelForType(typeUrl);
        this.subitems.push({
          component: 'header',
          data: {
            label: sectionLabel,
            headerSize: 4
          }
        });
      }

      /*
       * Example:
       *
       *  <ltp:100>    <a>                <Person>
       *  <ltp:100>    <name>             "Jane Doe"
       *  <ltp:100>    <address>          <ltp:101>
       *  <ltp:100>    <telephone>        "(212) 123-4567"
       *  <ltp:100>    <worksFor>         <ltp:102>
       *  <ltp:101>    <a>                <PostalAddress>
       *  <ltp:102>    <streetAddress>    "7 S. Broadway"
       *  <ltp:101>    <postalCode>       "10012"
       *  <ltp:102>    <a>                <Company>
       *  <ltp:102>    <name>             "Penguin Books"
       *
       * First, add all literals (name, telephone)
       * Next, write a header, then all literals for address, company
       *
       */

      // Get properties with literal values
      properties
        .filter(property => {
          return property.o.length === 1
            && property.s === subject
            && typeof(property.o[0]) !== 'string';
        })
        .map(property => {
          /*
           * First, generate a unique ID that we can use to lookup
           * this element.
          */
          const elementId = 'ctl_' + uuid.v4().substr(0, 8);
          this.schema.getLabelForType(property.p)
            .then(label => {
              if ('@id' in property.o[0]) {
                const id = property.o[0]['@id'];
                if (!item.subjects.includes(id)) {
                  this.subitems.push({
                    component: 'href',
                    property: property.p,
                    label: label,
                    subject: property.s,
                    value: id
                  });
                }
              } else {
                const value = property.o[0]['@value'];
                this.subitems.push({
                  component: 'value',
                  id: elementId,
                  property: property.p,
                  label: label,
                  subject: property.s,
                  value: value
                });
              }
            });
        });
    }


  }

  addPropertyToForm(id) {
    const ctl = new FormControl('', []);
    this.form.addControl(id, ctl);
    console.log('[addPropertyToForm]', this.form, ctl);

  }
  updateProperty(ctl) {
    console.log('[updateProperty] args', arguments);
  }

  ngOnInit() {
    console.log('[item-section ngOnInit]', this);

    this.item$ ? this.item$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      take(1),
      map(item => this.initSection(item))
    ).subscribe() : console.log('no item$');
  }

}
