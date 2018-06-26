import {
  ComponentFactoryResolver,
  Inject,
  Injectable,
  ReflectiveInjector,
  ViewContainerRef,
  Type,
} from '@angular/core';

import { Subject, Observable, of, from, pipe } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { HttpClient, HttpResponse } from '@angular/common/http';

import { SchemaService } from './schema.service';

import { Item, JsonLD } from '../models/item.model';

import * as jsonld from '../../assets/js/jsonld.js';
import * as _ from 'lodash';

// Data passed to the header section
interface HeaderSectionData {
  label: string;
  itemType: string;
  headingSize: number; // 1..5
}

// Data passed to each section
interface SectionData {
  label: string;
  key: string;
  value: string;
}

/*
 * Temp component to use
 */
import { ItemSectionComponent } from '../components/item-section/item-section.component';
import { ItemHeaderComponent } from '../components/item-header/item-header.component';

@Injectable({
  providedIn: 'root'
})
export class DynamicContentService {

  rootViewContainer: ViewContainerRef;
  componentRefs: Array<any>;

  constructor(private factoryResolver: ComponentFactoryResolver,
              private schema: SchemaService,
              private http: HttpClient,
              ) {
    this.componentRefs = [];
    this.factoryResolver = factoryResolver;
  }

  public renderSection(data: SectionData|HeaderSectionData,
                       component = ItemSectionComponent,
                       viewContainerRef) {

    const componentFactory = this.factoryResolver
      .resolveComponentFactory(component);

    // Reference to the new component (note: this is what we'll need to
    // destroy() when clearing our modal)
    const componentRef = viewContainerRef.createComponent(
      componentFactory);

    this.componentRefs.push(componentRef);

    (componentRef.instance).data = data;

    return componentRef;
  }

  public renderItem(item: Item, viewContainerRef: ViewContainerRef): any {

    if (!item) {
      return of([]);
    }

    console.log('[renderItem] args', arguments);
    return jsonld.expand(item.data)
      .then(expanded => {
        // At this point, we should have either a single '@type',
        // or a graph containing multiple types.
        if ('@graph' in expanded) {
          throw new Error('@graph objects not supported yet.');
        }

        for (const subitem of expanded) {
          console.log('[renderItem] subitem', subitem);

          let typeUrl = subitem['@type'];
          if (Array.isArray(typeUrl)) {
            typeUrl = typeUrl[0];
          }

          this.parseSection(typeUrl, subitem, viewContainerRef, 2, true);

          return of(this.componentRefs);
        }
      }).then(() => this.componentRefs)
    .catch(error => {
      console.log('Failed to parse JSON-LD', item, error);
      alert('Error: ' + error);
    });



  }

  parseGraph(data: JsonLD): any {

    const items = <JsonLD[]>data['@graph'];
    if (!items) {
      console.log('parseGraph(): no graph present.', data);
      console.log(`Recursing graph with ${items.length} items.`);
      for (const item of items) {
        if (item) {
          console.log('Item:', { ...item, '@context': data['@context']});
        }
      }
    }
  }

  getType(node: Object): string {
    // Returns the URL of a node
    if (!('@type' in node)) {
      console.log('[WARNING] getType: no type found', node);
      return null;

    } else if (Array.isArray(node['@type'])) {
      return node['@type'][0];

    } else {
      return node['@type'];
    }
  }

  parseSection(nodeName, nodeObject, viewContainerRef, headingSize = 3,
    topContext = false) {

    console.log('[parseSection]', arguments);

    // Get our semantic type
    // If we don't have a '@type', and the nodeName is a URL, then that
    // becomes our type
    // FIXME: @id?
    let typeUrl = this.getType(nodeObject);
    if (!typeUrl) {
      typeUrl = nodeName;
    }
    if (!nodeName.startsWith('http:')) {
      throw new Error('no type specified');
    }

    // Write header for section
    // skip top-level, as that's displayed elsewhere

    this.schema.getLabelForType(typeUrl)
      .then(label => {
        if (!topContext) {
          if (!label) {
            console.log('[parseSection] no label');
            label = typeUrl;
          }
          const header: HeaderSectionData = {
            label: label,
            itemType: typeUrl,
            headingSize: headingSize
          };
          const vcr = this.renderSection(
            header, ItemHeaderComponent, viewContainerRef);
          console.log('[parseSection] header', header);
        }

        /*
         * Next, iterate through our children, which should have the form:
         *
         *    a) { @value: 'http://www.w3.org/2002/12/cal/ical#dtstart' }
         *       In this case, our value can be anything ([], {}, '', 0-9)
         *    b) { @id: 'http://xxxx/' }
         *    c) { @type: xxxx, ... }
         *
         */

        for (const nodeChild of Object.keys(nodeObject)) {
          /*
           * Example with
           * typeUrl = 'http://schema.org/address';
           * nodeChild = {
            "@type": [
              "http://schema.org/PostalAddress"
            ],
           *    "addressLocality": [
           *      "@value": "Denver"
           *    ]
           *  }
           */

          if (nodeChild.startsWith('@')) {
            console.log('[parseSection] skipping', nodeChild);
            continue;
          }
          for (const key of nodeObject[nodeChild]) {
            if (key) {
              if ('@value' in key) {
                const value =  key['@value'];
                console.log('[parseSection] value', value);
                const sectionData: SectionData = {
                  label: nodeChild,
                  key: nodeChild,
                  value: value
                };
                this.renderSection(sectionData, ItemSectionComponent,
                  viewContainerRef);

              } else if ('@id' in key) {
                const id =  key['@id'];
                console.log('[parseSection] id', id);
                const sectionData: SectionData = {
                  label: nodeChild,
                  key: nodeChild,
                  value: id
                };
                this.renderSection(sectionData, ItemSectionComponent,
                  viewContainerRef);

              } else if ('@type' in key) {
                console.log('[parseSection] RECURSE', key);
                this.parseSection(typeUrl, key, viewContainerRef, headingSize + 1);

              } else {
                console.log('[parseSection] unknown', key);
              }
            }
          }
        }
      });

  }

}

