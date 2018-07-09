import * as uuid from 'uuid';

import {
         AfterViewInit,
         Component,
         Input,
         OnInit,
       } from '@angular/core';

import { Item } from '../../models/item.model';
import { IRDFSClass, IRDFSProperty } from '../../models/schema.model';

import { HeaderSectionData } from '../item-header/item-header.component';

import { SchemaService } from '../../services/schema.service';

@Component({
  selector: 'app-item-section',
  template: `
  <app-item-header
    [data]="this.header"
    *ngIf="this.showHeader && this.header">
  </app-item-header>

  <div *ngFor="let subitem of subitems">
    <div [ngSwitch]="subitem.component">

      <!-----------------
        Item (recursively embed sub-section)
      ------------------->
      <div
        *ngSwitchCase="'item'">
      <tr><td>
      <app-item-section
        [data]="subitem.data"
        [headerSize]="getHeaderSize()"
      ></app-item-section>
      <hr>
      </div>

      <!-----------------
        Raw value
      ------------------->
      <ng-container *ngSwitchCase="'value'">

        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <label
                   for="{{ subitem.label }}-{{ this.sectionPrefix }}"
                   class="input-group-text">
                   {{ subitem.label }}
            </label>

            <input [attr.property]="subitem.typeUrl"
                   id="{{ subitem.label }}-{{ this.sectionPrefix }}"
                   class="form-control"
                   value="{{ subitem.value }}">
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

  @Input() data;
  @Input() showHeader = true;
  @Input() headerSize;
  header: HeaderSectionData;
  subitems = [];
  values = [];
  sectionPrefix: string; // used to generate unique labels

  typeLabel: string;

  constructor(private schema: SchemaService) {
    this.sectionPrefix = uuid.v4().substr(0, 8);
  }

  async initSection() {
    let typeUrl: string;

    if (this.data) {
      // Get the type URL
      if (Array.isArray(this.data['@type'])) {
        typeUrl = this.data['@type'][0];
      } else {
        typeUrl = this.data['@type'];
      }
      if (!typeUrl) {
        throw new Error('missing @type');
      }

      // Setup the header
      const label = await this.schema.getLabelForType(typeUrl);

      this.header = {
        label: label,
        headerSize: this.headerSize
      };

      for (const key in this.data) {
        if (key) {
          /*
           * The keys within the data object should be either URIs, or
           * JSON-LD @type, etc;
           * The values should be lists of either JSON-LD values (literals),
           * or sub-items
           */
          if (key === '@type') {
            continue;
          } else if (key === '@value') {
            this.subitems.push({
              component: 'value',
              typeUrl: typeUrl,
              label: label,
              value: this.data[key]
            });
            return;
          }

          /*
           * Our node should be a list
          /*
           * ex:
           * { 'schema:text': [
           *       { '@value': 'example text' } ],
           *   'schema:dateCreated': [
           *       { '@type': 'schema:date',
           *         '@value': 'example text' } ],
           * }
           */
          // Fix data model to make lookups from DB explicitly;
          // obviously these can't be XHRs
          // const keyLabel = await this.schema.getLabelForType(key);
          const keyLabel = await this.schema.getLabelForType(key);
          for (const propertyData of this.data[key]) {
            if (propertyData) {
              if (propertyData['@type']) {
                /* Lookup our property, so that we can get things like
                 * - label
                 * - default value
                 */
                const propTypeUrl = propertyData['@type'];
                this.subitems.push({
                  data: propertyData,
                  component: 'item'
                });
              } else if ('@value' in propertyData) {
                this.subitems.push({
                  typeUrl: key,
                  label: keyLabel,
                  value: propertyData['@value'],
                  component: 'value'
                });
              } else if ('@id' in propertyData) {
                const propLabel = await this.schema.getLabelForType(key);
                this.subitems.push({
                  typeUrl: key,
                  label: keyLabel,
                  value: propertyData['@id'],
                  component: 'value'
                });
              } else {
                throw new Error('[initSection] invalid property data: '
                  + JSON.stringify(propertyData));
              }
            }
          }
        }
      }
    }
  }

  ngOnInit() {
    this.initSection();
  }

  getHeaderSize() {
    return this.headerSize <= 5 ? this.headerSize++ : 5;
  }
}
