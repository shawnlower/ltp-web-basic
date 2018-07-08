import { Injectable } from '@angular/core';

import { Subject, Observable, of, from, pipe } from 'rxjs';
import { catchError, map, mergeMap, flatMap, take } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import * as jsonld from '../../assets/js/jsonld.js';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SchemaService {

  schemaMap: {};           // Holds type -> property mappings
  classHierarchy: {};      // Linked list of class<->subclasses

  constructor(private http: HttpClient) {
    this.schemaMap = {};
    this.classHierarchy = {};
  }

  public getLabelForType(typeUrl: string): Promise<string>|null {

    // Fetch our schema first
    const resp = this.getSchema(typeUrl);

    return resp.toPromise().then(
      schema => {
        return jsonld.flatten(schema)
          .then(flat => {
            // Assume http and https are the same type
            const typeUrls = [ typeUrl, typeUrl.replace(/^https/, 'http')];
            let typeSchema: string;
            for (typeUrl of typeUrls) {
                typeSchema = flat.filter(o => o['@id'] === typeUrl)[0];
                if (typeSchema) {
                  break;
              }
            }
            if (!typeSchema) {
              console.log('[getLabelForType] no match', typeUrl);
            }
            const rdfsLabel = 'http://www.w3.org/2000/01/rdf-schema#label';
            let label: string;
            if (typeSchema) {
              // Use the RDFS class information to build an appropriate
              // label
              label = typeSchema[rdfsLabel];
              if (label && label[0]['@value']) {
                return label[0]['@value'];
              } else {
                console.log('[getLabelForType] invalid label', label, typeUrl);
                throw new Error('Invalid label');
              }
            }
          })
          .catch(err => {
            console.log('[getLabelForType]', 'Error', err);
            return null;
          });
      });
  }

  addProp(typeUrl: string, property: string) {
    // console.log('[addProp] ', property, typeUrl, this.schemaMap);

    if (! Object.keys(this.schemaMap).includes(typeUrl)) {
      this.schemaMap[typeUrl] = [];
    }

    if (property === '' || property === null) {
      return;
    }

    this.schemaMap[typeUrl].push(property);
  }

  propExists(typeUrl, property): boolean {
    if (! Object.keys(this.schemaMap).includes(typeUrl)) {
      return false;
    }

    return this.schemaMap[typeUrl].includes(property);
  }

  getCachedProps(typeUrl: string, recurse = 20): Array<any> {
    if (recurse === -1 ) {
      // Recursion disabled
      return this.schemaMap[typeUrl];
    } else if (recurse < 1) {
      throw new Error('Maximum recursion depth exceeded');
    }

    if (!this.schemaMap[typeUrl]) {
      return null;
    }

    const props: Array<string> = this.schemaMap[typeUrl];

    console.log('[getCachedProps] classHierarchy ', typeUrl, this.classHierarchy);
    console.log('[getCachedProps] schemaMap', this.schemaMap);
    if (this.classHierarchy[typeUrl] && this.classHierarchy[typeUrl].parents) {
      for (const parentUrl of this.classHierarchy[typeUrl].parents) {
        if (parentUrl) {
          return props.concat(this.getCachedProps(parentUrl, --recurse));
        }
      }
    }
    return props;

  }

  async getProps(typeUrl: string, recurse = 10): Promise<any> {

    await this.updateProps(typeUrl);

    return new Promise((resolve, reject) => {
      resolve(this.getCachedProps(typeUrl));
    });

  }

  updateProps(typeUrl: string, recurse = 200) {
    console.log('[updateProps] args', arguments);

    const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
    const SCHEMA = 'http://schema.org/';


    if (recurse < 1) {
      throw new Error('[getProps] max recursion depth exceeded');
    }

    return this.getSchema(typeUrl).pipe(

      mergeMap(json => from(jsonld.expand(json))),

      map(schema => {
        // console.log('[updateProps] schema', schema);

        /*
         * Add any direct properties to the DB
         */

        for (const node of schema) {
          if (node) {
            // console.log('[updateProps] node', node);
            if (node['@type'] && node['@type'][0] === `${RDF}Property`) {
              /*
               * This is a PROPERTY. Now we want:
               * - Domains (the types that this property is valid for)
               * - Comment
               * - Label
               */
              let property: string;
              if (node['@id']) {
                property = node['@id'];
              } else {
                property = typeUrl;
              }

              // TODO: Use RDFS as well as schema for domainIncludes, etc
              const domainIncludes = node[`${SCHEMA}domainIncludes`];
              if (domainIncludes) {
                for (const domain of domainIncludes) {
                  this.addProp(domain['@id'], property);
                }
              }
            } else if (node['@type'] && node['@type'][0] === `${RDFS}Class` ) {
              /*
               * This is a CLASS. Now we want:
               * - Ensure the schema has an entry
               * - Look up any sameAs entries (http v https, etc)
               * - Ensure we have the subclass information in our class hierarchy structure
               * - Walk the class hierarchy back, to get all properties
               */

              // Add empty property for now
              this.addProp(typeUrl, '');

              /*
               * Recurse into any 'sameAs' properties
               */
              const refs = node['http://schema.org/sameAs'];
              if (refs) {
                for (const ref of refs) {
                  const refUrl = ref['@id'];
                  if (!this.getCachedProps(refUrl, -1)) {
                    console.log('[updateProps] recursing', refUrl, recurse);
                    this.updateProps(refUrl, --recurse);
                  }
                }
              }

              /*
               * Retrieve the entire tree back to the root
               */
              if (! this.classHierarchy[typeUrl]) {
                this.classHierarchy[typeUrl] = {};
                this.classHierarchy[typeUrl].parents = [];
                this.classHierarchy[typeUrl].children = [];
              }

              const superClasses = node[`${RDFS}subClassOf`];
              if (superClasses) {
                /*
                 * First update the hierarchy tree
                 */

                for (const s of superClasses) {
                  const s_typeUrl = s['@id'];
                  if (! this.classHierarchy[typeUrl].parents.includes(s_typeUrl) && s_typeUrl !== typeUrl) {
                    this.classHierarchy[typeUrl].parents.push(s_typeUrl);
                  }

                  if (! this.classHierarchy[s_typeUrl]) {
                    this.classHierarchy[s_typeUrl] = {};
                    this.classHierarchy[s_typeUrl].parents = [];
                    this.classHierarchy[s_typeUrl].children = [];
                  }
                  if (! this.classHierarchy[s_typeUrl].children.includes(typeUrl) && s_typeUrl !== typeUrl) {
                    this.classHierarchy[s_typeUrl].children.push(typeUrl);
                  }

                  if (!this.getCachedProps(s_typeUrl, -1)) {
                    console.log('[updateProps] adding superclass', s_typeUrl);
                    this.updateProps(s_typeUrl, --recurse);
                  }
                }
              }
            }
          }
        }
      })
    ).toPromise();
  }


  getSchema(typeUrl: string): Observable<HttpResponse<any>> {
    /*
     * Fetch the schema for a given type
     *
     * Example:
     *  getSchema('http://schema.org/Person')
     */

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept':  'application/ld+json',
      })
    };
    // const resp = this.http.get<any>(typeUrl, httpOptions);
    // FIXME: schema.org sends 303 See Other, which results in us not caching
    // the response. Hack it by just requesting the JSON directly
    // See Other: https://stackoverflow.com/questions/47019571
    // console.log('[getSchema]', typeUrl);
    if (!typeUrl.startsWith('http')) {
      throw new Error('invalid URL: ' + typeUrl);
    }
    if (typeUrl.match(/schema.org/)) {
      return this.http.get<any>(typeUrl + '.jsonld', httpOptions);
    } else {
      return this.http.get<any>(typeUrl, httpOptions);
    }
  }
}
