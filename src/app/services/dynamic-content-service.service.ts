import {
  ComponentFactoryResolver,
  Inject,
  Injectable,
  ReflectiveInjector,
  ViewContainerRef,
  Type,
} from '@angular/core';

import { Subject, Observable, of } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { Item } from '../models/item.model';

import * as jsonld from '../../assets/js/jsonld.js';

interface JsonLD {
  '@context'?: any;
  '@graph'?: any;
  '@type'?: string;
  '@id'?: string;
  // @ts-ignore
  [any];
}

// Data passed to the header section
interface HeaderSectionData {
  itemType: string;
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
              private http: HttpClient,
              ) {
    this.componentRefs = [];
    this.factoryResolver = factoryResolver;
  }

  public setRootViewContainerRef(viewContainerRef) {
    this.rootViewContainer = viewContainerRef;
  }

  public renderSection(data, component = ItemSectionComponent) {
    const componentFactory = this.factoryResolver
      .resolveComponentFactory(component);

    // Reference to the new component (note: this is what we'll need to
    // destroy() when clearing our modal)
    const componentRef = this.rootViewContainer.createComponent(
      componentFactory);

    this.componentRefs.push(componentRef);

    (componentRef.instance).data = data;
  }

  public renderItem(item: Item): any {

    if (!item) {
      return of([]);
    }
    // Render outer div
    return jsonld.expand(item.json).then(
      expanded => {
        // At this point, we should have either a single '@type',
        // or a graph containing multiple types.
        if ('@graph' in expanded) {
          alert('@graph objects not supported yet.');
        } else {
          if (Array.isArray(expanded)) {
            for (const subitem of expanded) {
              if (subitem) { // lint
                this.parseDocument(subitem);
              }
            }
          }
        }
      }).then(() => this.componentRefs)
    .catch(error => {
      console.log('Failed to parse JSON-LD', item);
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

  parseDocument(data: JsonLD): Observable<any> {

    // TODO: get from store/infer, etc
    const DEFAULT_TYPE = 'http://schema.org/Thing';

    /*
     * We want to handle the following types:
     * - Image -> <img>
     * - URL: -> <a>
     * - text: <span>
     */

    let typeUrl: string;
    if ('@type' in data) {
      if (Array.isArray(data['@type'])) {
        console.log('WARNING: array found for ');
        typeUrl = data['@type'][0];
      } else {
        typeUrl = data['@type'];
      }
    }
    if (! typeUrl ) {
      /* No type key found. That may happen in items such as:
       *    {
       *      "@context": {
       *          "ical": "http://www.w3.org/2002/12/cal/ical#",
       *          "xsd": "http://www.w3.org/2001/XMLSchema#",
       *          "ical:dtstart": {
       *            "@type": "xsd:dateTime"
       *          }
       *      },
       *      "ical:summary": "Lady Gaga Concert",
       *      "ical:location": "New Orleans Arena, New Orleans, Louisiana, USA",
       *      "ical:dtstart": "2011-04-09T20:00Z"
       *    }
       *
       * Here, an item without a specific type, has several attributes, which
       * themselves happen to be from the same uri prefix (ical:)
       *
       * The decision here would be to either reject the item, or apply some
       * default type (e.g. schema.org/Thing)
       */
      alert('WARNING: No type found. Applying default of ' + DEFAULT_TYPE);
    }
    // const schema = this.getSchema(item.url);

    /*
    const header: HeaderSectionData = {
      itemType: typeUrl ? typeUrl : DEFAULT_TYPE
    };
    this.renderSection(header, ItemHeaderComponent);
     */

    // now iterate through each item, writing sections for each
    for (const key in data) {
      // Handle any additional JSON-LD keys
      if ( key.startsWith('@') ) { continue; }

      if (key) { // for linting purposes
        console.log('Processing item', key, data[key]);
        this.parseNonGraph({[key]: data[key]}, typeUrl);
      }
    }

    return of(this.componentRefs);

  }

  parseNonGraph(data: object, context: string|string[] = null): any {

    // Normalize our context
    if (!context) {
      context = data['@type'];
    } else if (!Array.isArray(context)) {
      context = [context];
    }

    // Not a JSON-LD value? No context passed?
    if (!context) {
      console.log('ERROR: NO CONTEXT'); // pun intended? sorry.
    }

    console.log('parseNonGraph with', data, 'context=', context);
    /*
     * First, iterate through each key in our Object
     */
    for (const key in data) {
      // Handle any additional JSON-LD keys
      if ( key.startsWith('@') ) { continue; }
      if (key) {
        /*
         * Main loop
         */
        let value = data[key];
        if (Array.isArray(value)) {
          if (value.length === 1) {
            // unpack arrays with a single item
            value = value[0];
          }
        } else {
          // iterate through subkeys
          value.forEach(v => this.parseNonGraph(v));
          continue;
        }
        console.log('Writing section with', key, value);
        /* At this point, our value should be either
         *    a) { @value: 'http://www.w3.org/2002/12/cal/ical#dtstart' }
         *       In this case, our value can be anything ([], {}, '', 0-9)
         *    b) { @id: 'http://xxxx/' }
         *    c) { @type: xxxx, @value: yyyy }
         */
        let recurse = false;
        if ( '@value' in value ) {
          // Is this a literal, or a typed object?
          if (Array.isArray(value['@value']) ||
            typeof value['@value'] === 'object') {
            recurse = true;
          }
          if (recurse) {
            console.log('Recursing');
          } else {
            this.handleSection(key, value['@value'], <string[]>context);
          }
        }


      }
    }
  }

  public handleSection(key: string, value: string, context: string[]) {
    /*
     * A section should have a simple key + value
     */

    const data: SectionData = {
      label: key,
      key,
      value
    };

    this.renderSection(data, ItemSectionComponent);
  }

  getSchema(typeUrl: string) {
    /*
     * Fetch the schema for a given type
     *
     * Example:
     *  getSchema('http://schema.org/Person')
     */
    const mockUrl = 'http://localhost:8000/person.schema.json';
    return this.http.get(mockUrl)
      .subscribe(data => console.log('schema', data));
  }
}

