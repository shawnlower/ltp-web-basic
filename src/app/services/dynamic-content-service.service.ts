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

import { Item, JsonLD } from '../models/item.model';

import * as jsonld from '../../assets/js/jsonld.js';
import * as _ from 'lodash';

// Data passed to the header section
interface HeaderSectionData {
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


    const header: HeaderSectionData = {
      itemType: item.data['@type'],
      headingSize: 1
    };
    this.renderSection(header, ItemHeaderComponent, viewContainerRef);

    return jsonld.expand(item.data)
      .then(expanded => {
        // At this point, we should have either a single '@type',
        // or a graph containing multiple types.
        if ('@graph' in expanded) {
          throw new Error('@graph objects not supported yet.');
        }

        for (const subitem of expanded) {
          console.log('[renderItem] subitem', subitem);

          for (const key in subitem) {
            // Handle any additional JSON-LD keys
            if ( key.startsWith('@') ) { continue; }

            if (key) {
              const propertyName = key;
              const value = subitem[propertyName];
              this.parseSection(propertyName, value, viewContainerRef);
            }
          }

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

  parseSection(propertyName, value, viewContainerRef, headingSize = 1) {
    console.log('[parseSection]', arguments);
    /*
     * Since we've ensured that we have an expanded JSON-LD
     * document, with an explicit '@type', all of the subsequent
     * keys must be URLs, in order to be valid
     */

    if (Array.isArray(value)) {
      // iterate through subkeys
      value.forEach(propertyValue => {
        console.log('[propertyValue]', propertyValue);
        /* At this point, our value should be either
         *    a) { @value: 'http://www.w3.org/2002/12/cal/ical#dtstart' }
         *       In this case, our value can be anything ([], {}, '', 0-9)
         *    b) { @id: 'http://xxxx/' }
         *    c) { @type: xxxx, @value: yyyy }
         */
        if ('@value' in propertyValue) {
          // Literal
          const literalValue = propertyValue['@value'];
          console.log('[propertyValue] - LITERAL ', literalValue,
            viewContainerRef);

          /*
           * Construct the data for the section
           */
          const sectionData: SectionData = {
            label: propertyName,
            key: propertyName,
            value: literalValue
          };
          this.renderSection(sectionData, ItemSectionComponent,
            viewContainerRef);


        } else if ('@id' in propertyValue) {
          // Link to another resource
          // e.g. image, audio, webpage
          const id = propertyValue['@id'];
          console.log('[propertyValue] - ID ', id);
          /*
           * FIXME: This will vary based on the property type
           */
          const sectionData: SectionData = {
            label: propertyName,
            key: propertyName,
            value: id
          };
          this.renderSection(sectionData, ItemSectionComponent,
            viewContainerRef);


        } else if ('@type' in propertyValue) {
          // Nested type: Recurse
          const typeUrl = propertyValue['@type'];
          console.log('[propertyValue] - NESTED TYPE ', typeUrl,
           propertyName, propertyValue, viewContainerRef);

          // Write another header
          const header: HeaderSectionData = {
            itemType: typeUrl,
            headingSize: headingSize >= 5 ? 5 : headingSize + 1
          };
          const vcr = this.renderSection(
            header, ItemHeaderComponent, viewContainerRef);

          console.log('[renderSection] recurse with', propertyValue);
          this.parseSection(propertyName, propertyValue, viewContainerRef);
          /*
          jsonld.expand(propertyValue).then( expanded => {
            // this.parseSection(propertyName, expanded, viewContainerRef);
            console.log('in cb', expanded);
          });
          */
        } else {
          // Should never get here
          console.log('[propertyValue] - *** ERROR ***');
      }


        /*
         * At this point, we'd like to construct a data object
         * that we can populate a section component template from.
         *
         * Before we do that, however, we need the following:
         *
         */
      });
    } else {
      console.log('*** not an array', value);

    }
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
            // this.handleSection(key, value['@value'], <string[]>context);
          }
        }


      }
    }
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

