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

import { ItemSectionComponent } from '../components/item-section/item-section.component';
import { ItemHeaderComponent } from '../components/item-header/item-header.component';

import { HttpClient, HttpResponse } from '@angular/common/http';

import { SchemaService } from './schema.service';

import { Item, JsonLD } from '../models/item.model';

import * as jsonld from '../../assets/js/jsonld.js';
import * as _ from 'lodash';

// Container for headers and subsections
// Note: nesting is supported
class Section {
  header: HeaderSectionData;
  subsections: SectionData[] | null;
}

// Data passed to the header section
class HeaderSectionData {
  label: string;
  itemType: string;
  headingSize: number; // 1..5
}

// Data passed to each section
class SectionData {
  label: string;
  key: string;
  value: string;
  constructor(label, key, value) {
    this.label = label;
    this.key = key;
    this.value = value;
  }

}


@Injectable({
  providedIn: 'root'
})
export class DynamicContentService {

  rootViewContainer: ViewContainerRef;
  componentRefs: Array<ItemSectionComponent>;

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

  public getComponentForItem(item: Item): any {
    /*
     * Map a given item to the component that's best suited to display it
     * e.g. date / string / image, etc
     */

    /*
     * A JSON-LD value is a string, a number, true or false, a typed value,
     * or a language-tagged string.
     * <https://json-ld.org/spec/latest/json-ld/#dfn-json-ld-values>
     */
    return ItemSectionComponent;
  }

  public renderItem(item: Item, viewContainerRef: ViewContainerRef): any {
    /*
     * Take an item
     *   - render it in the viewContainer
     *   - return a list of components, which can be used later
     */

    if (!item) {
      return of([]);
    }

    console.log('[renderItem] args', arguments);
    const viewContainerRefs: Observable<ItemSectionComponent>
      = jsonld.expand(item.data)
      .then(expanded => {
        /*
         * In order to render an item of a given type, we need to lookup the
         * correct component for a given item. The component will be
         * responsible for any transforming/reshaping of the item's data that
         * is necessary.
         *
         * It's important also that the order of the components is preserved,
         * so that they are not rendered out-of-order.
         */

        if ('@graph' in expanded) {
          throw new Error('@graph objects not supported yet.');
        }

        const sections: Section[] = [];
        for (const subitem of expanded) {
          console.log('[renderItem] subitem', subitem);
          const component = this.getComponentForItem(subitem);

          /*

          @type
           |-- <uri>
           |    |-- @type
           |    |-- @value
           |-- <uri>
           |    |-- @type
           |    |-- @value

           */


          /*
          let typeUrl = subitem['@type'];
          if (Array.isArray(typeUrl)) {
            typeUrl = typeUrl[0];
          }
          */

          // sections.push(this.getSectionFromItem(subitem));
          // const sectionDataList: SectionData[] | HeaderSectionData[] =
          //  this.parseSection(typeUrl, subitem, viewContainerRef, 2, true);

        }
        const componentRefs = [];
        for (const section in sections) {
          // if header
          // if body
        }

        return of(componentRefs);

      })
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
    topContext = false): SectionData[] | HeaderSectionData[] {

    const sectionDataList = [];
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
          /*
          const vcr = this.renderSection(
            header, ItemHeaderComponent, viewContainerRef);
           */
          sectionDataList.push(header);
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
                const sectionData = new SectionData(
                  nodeChild,
                  nodeChild,
                  value
                );
                sectionDataList.push(sectionData);

              } else if ('@id' in key) {
                const id =  key['@id'];
                console.log('[parseSection] id', id);
                const sectionData = new SectionData(
                  nodeChild,
                  nodeChild,
                  id
                );
                sectionDataList.push(sectionData);

              } else if ('@type' in key) {
                console.log('[parseSection] RECURSE', key);
                const sectionData = this.parseSection(
                  typeUrl, key, viewContainerRef, headingSize + 1);
                sectionDataList.concat(sectionData);

              } else {
                console.log('[parseSection] unknown', key);
              }
            }
          }
          console.log('[getLabelForType] exited with', sectionDataList);
        }
      });
      return sectionDataList;
  }

  getSectionFromItem(item: Item, topContext = false, headingSize = 3): Promise<Section> {
    /*
     * Return a single section, consisting of a HeaderSectionData, and
     * possibly nested subsections
     */

    const typeUrl = this.getType(item);

    if (!typeUrl) {
      throw new Error('no type specified');
    }

    return this.schema.getLabelForType(typeUrl)
      .then(label => {

        // const sectionDataList: Section[] = [];
        let section: Section;

        if (!label) {
          console.log('[parseSection] no label');
          label = typeUrl;
        }
        const header: HeaderSectionData = {
          label: label,
          itemType: typeUrl,
          headingSize: headingSize
        };
        console.log('[parseSection] header', header);

        section = {
          header: header,
          subsections: null
        };
        for (const subitem of []) {
        // Iterate through item

          // TODO
        return section;
        }
      });


  }


}

