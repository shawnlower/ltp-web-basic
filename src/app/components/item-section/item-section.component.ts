import {
         AfterViewInit,
         Component,
         Input,
         OnInit,
       } from '@angular/core';

import { Item } from '../../models/item.model';

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
        Item
      ------------------->
      <app-item-section
        *ngSwitchCase="'item'"
        [data]="subitem.data"
        [headerSize]="getHeaderSize()"
      ></app-item-section>

      <!-----------------
        Raw value
      ------------------->
      <ng-container *ngSwitchCase="'value'">

        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <label for="content_key"
                   class="input-group-text">
                   {{ subitem.label }}
            </label>

              <input [attr.property]="subitem.typeUrl"
                     id="content_key"
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

  typeLabel: string;

  constructor(private schema: SchemaService) {
  }

  ngOnInit() {
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
      this.schema.getLabelForType(typeUrl).then(label => {
        this.typeLabel = label;

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
             * { 'schema:text':
             *   [
             *     { '@value': 'example text' }
             *   ],
             * { 'schema:dateCreated':
             *   [
             *     { '@type': 'schema:date',
             *       '@value': 'example text' }
             *   ],
             * }
             */

            for (const property of this.data[key]) {
              if (property) {
                if (property['@type']) {
                  this.subitems.push({
                    data: property,
                    component: 'item'
                  });
                } else if (property['@value']) {
                  this.subitems.push({
                    typeUrl: key,
                    label: key,
                    value: property['@value'],
                    component: 'value'
                  });
                } else {
                  this.subitems.push({
                    typeUrl: key,
                    label: key,
                    value: property['@id'],
                    component: 'value'
                  });
                }
              }
            }
          }
        }
      });
    }

  }
  getHeaderSize() {
    return this.headerSize <= 5 ? this.headerSize++ : 5;
  }
}
