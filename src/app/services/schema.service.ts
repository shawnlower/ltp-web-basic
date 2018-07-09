import { Injectable } from '@angular/core';

import { Subject, Observable, of, from, pipe } from 'rxjs';
import { catchError, filter, map, mergeMap, flatMap, take } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { IRDFSClass, IRDFSProperty } from '../models/schema.model';

import * as jsonld from '../../assets/js/jsonld.js';
import * as _ from 'lodash';

const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const SCHEMA = 'http://schema.org/';

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
    console.log('[getLabelForType] args', arguments);
    /*
     * - Fetch schema as IRDFSClass
     * - return schema.label
    return new Promise((resolve, reject) => {
      resolve('label test');
    });
     */
    return this.getSchema(typeUrl)
      .then(schema => schema.label)
      .catch(error => {
        console.warn('Unable to get label: ', error);
        return null;
      });
  }

  addProperty(typeUrl: string, property: string) {
    // console.log('[addProperty] ', property, typeUrl, this.schemaMap);

    if (! Object.keys(this.schemaMap).includes(typeUrl)) {
      this.schemaMap[typeUrl] = [];
    }

    if (property === '' || property === null) {
      return;
    }

    this.schemaMap[typeUrl].push(property);
  }

  propertyExists(typeUrl, property): boolean {
    if (! Object.keys(this.schemaMap).includes(typeUrl)) {
      return false;
    }

    return this.schemaMap[typeUrl].includes(property);
  }

  getCachedProperties(typeUrl: string, recurse = 20): Array<any> {
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

    console.log('[getCachedProperties] classHierarchy ', typeUrl, this.classHierarchy);
    console.log('[getCachedProperties] schemaMap', this.schemaMap);
    if (this.classHierarchy[typeUrl] && this.classHierarchy[typeUrl].parents) {
      for (const parentUrl of this.classHierarchy[typeUrl].parents) {
        if (parentUrl) {
          return props.concat(this.getCachedProperties(parentUrl, --recurse));
        }
      }
    }
    return props;

  }

  async getProperty(propInfo: string, recurse = 10): Promise<IRDFSProperty> {
    /*
     * Return a single property object
     */
    console.log('[getProperty] args', arguments);
    return null;

    /*
    const property: IRDFSProperty = {
      id: string;
      label: string;
      comment: string;
      domainIncludes: Array<IRDFSClass>;
    }
     */





  }
  async getProperties(typeInfo: string|IRDFSClass, recurse = 10): Promise<any> {
    /*
     * Return all properties for a given type
     */
    let typeUrl: string;
    if (typeof(typeInfo) === 'string') {
      typeUrl = typeInfo;
    } else {
      typeUrl = typeInfo.id;
    }

    await this.updateProps(typeUrl);

    return new Promise((resolve, reject) => {
      resolve(this.getCachedProperties(typeUrl));
    });

  }

  updateProps(typeUrl: string, recurse = 30) {
    console.log('[updateProps] args', arguments);


    if (recurse < 1) {
      throw new Error('[getProperties] max recursion depth exceeded');
    }

    return this.getSchema(typeUrl).pipe(

      mergeMap(json => from(jsonld.expand(json))),

      map(_schema => {
        // console.log('[updateProps] schema', schema);

        /*
         * Add any direct properties to the DB
         */

        const schema: Array<any> = _schema;
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
                  this.addProperty(domain['@id'], property);
                }
              }
            } else if (node['@type'] &&
              node['@type'][0] === `${RDFS}Class` ) {
              /*
               * This is a CLASS. Now we want:
               * - Ensure the schema has an entry
               * - Look up any sameAs entries (http v https, etc)
               * - Ensure we have the subclass information in our class hierarchy structure
               * - Walk the class hierarchy back, to get all properties
               */

              // Add empty property for now
              this.addProperty(typeUrl, '');

              /*
               * Recurse into any 'sameAs' properties
               */
              const refs = node['http://schema.org/sameAs'];
              if (refs) {
                for (const ref of refs) {
                  const refUrl = ref['@id'];
                  if (!this.getCachedProperties(refUrl, -1)) {
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

                  if (!this.getCachedProperties(s_typeUrl, -1)) {
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

  getDefaultProperties(typeUrl: string, max: number = -1): IRDFSProperty[] {

    /*
     * Description: Retrieve a list of default properties, for a given type
     *              e.g., for a Person, we'd want name, address, company, etc
     *
     *              Note: Some classes (e.g. schema:Restaurant) have no direct
     *              properties, and require traversal to a parent (such as
     *              schema:FoodEstablishment)
     * Arguments:
     *              typeUrl: the URL of the Type/Class to lookup
     *              max: maximum number of properties to return; -1 for all
     */

    // console.log('[getDefaultProperties] args', arguments, new Error().stack);
    console.log('[getDefaultProperties] args', arguments);

    if ( typeUrl.match('NoteDigitalDocument')) {
      const noteProps = []; // this.getRDFSClass(typeUrl);
      noteProps.push({
        id: 'https://schema.org/dateCreated',
        label:  'Date Created',
        comment:  'Date whent the note was originally authored.'
      });
      noteProps.push({
        id: 'https://schema.org/text',
        label: 'Note text',
        comment: 'Textual content of the note.'
      });
      console.log('[getDefaultProperties] returning', noteProps);
      return noteProps;
    } else {
      return null;
    }
  }

  getRDFSClass(typeUrl: string): IRDFSClass {
    /* lookup cached first */
    const rdfClass: IRDFSClass = {
      id: typeUrl,
      subClasses: [],
      superClasses: [],
    };
    // rdfClass.properties = this.getCachedProperties(typeUrl);
    return rdfClass;
  }

  getSchemaJson(typeUrl: string): Promise<object> {
    /*
     * Fetch an item, either from cache, or via HTTP, and then return it as
     * a JSON-LD object
     *
     * implementation notes:
     *  - should be expanded?
     */

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept':  'application/ld+json',
      })
    };

    // FIXME: schema.org sends 303 See Other, which results in us not caching
    // the response. Hack it by just requesting the JSON directly
    // See Other: https://stackoverflow.com/questions/47019571
    if (!typeUrl.startsWith('http')) {
      throw new Error('invalid URL: ' + typeUrl);
    }
    if (typeUrl.match(/schema.org/)) {
      return this.http.get(typeUrl + '.jsonld', httpOptions).toPromise();
    } else {
      return this.http.get(typeUrl, httpOptions).toPromise();
    }
  }

  async normalizeJson(jld: object|string):
  Promise<IRDFSClass[]|IRDFSProperty[]> {
    /*
     * Normalize an input schema in JSON-LD format, to an object of
     *
     *  export interface IRDFSClass {
     *    id: string;
     *    label?: string;
     *    comment?: string;
     *    subClasses: Array<IRDFSClass>;
     *    superClasses: Array<IRDFSClass>;
     *    // properties: Array<IRDFSProperty>;
     *  }
     *
     */
    // console.log('[normalizeJson] args', arguments);

    let inSchema: object;

    if (typeof(jld) === 'string') {
      inSchema = JSON.parse(jld);
    } else {
      inSchema = jld;
    }

    const expanded: Array<object> = await jsonld.expand(inSchema);
    if (expanded.length === 0) {
      throw new Error('JSON-LD processor returned an empty list. Input: '
        + JSON.stringify(inSchema));
    } else if (expanded.length > 1) {
      /*
      console.error('traceback', new Error().stack);
      throw new Error('Expected a SINGLE object back from JSON-LD processor.'
        + ` Got ${expanded.length}. Input: ` + JSON.stringify(inSchema));
       */
      // Multiple objects back are okay, but we only return the one matching
      // the ID we want
    }

    const outSchemas = [];

    let rdfType: string; // = this.getValue(expanded.find(i => i['@type']));

    for (const o of expanded) {
      if (o) {
        rdfType = this.getValue(o['@type']);
        if (!rdfType) {
          /*
           * Guess the type. If @type is missing, but
           * subPropertyOf is set, then it's a property
           * otherwise: fail.
           */
          if (this.getValue(o[`${RDFS}subPropertyOf`])) {
            rdfType = `${RDFS}Property`;
          } else {
            // console.warn('[normalizeJson] invald type', o['@type'], rdfType);
            // throw new Error('All items must be of the same type');
          }
        }
        if (rdfType === `${RDFS}Class`) {
          outSchemas.push(await this._normalizeJsonClass(o));
        } else if (rdfType === `${RDF}Property`) {
          outSchemas.push(await this._normalizeJsonProperty(o));
        } else {
          // console.warn('[normalizeJson] ignoring unknown', o);
          // throw new Error('normalizeJson: Invalid type: ' + rdfType);
        }
      }
    }
    return outSchemas;
  }


  private async _normalizeJsonClass (jlo: object): Promise<IRDFSClass> {

    // Set initial properties
    const outSchema = {
      id:        jlo['@id'],
      label:     this.getValue(jlo[`${RDFS}label`]),
      comment:   this.getValue(jlo[`${RDFS}comment`]),
      subClasses: null,
      superClasses: null
    };

    /*
     * Populate subClasses
     */

    /*
     * Populate superClasses
     */
    const subClassNames = [`${RDFS}subClassOf`];
    // this.getValue(o

    // console.log('[normalizeJsonClass] returning', outSchema);
    return outSchema;

  }

  private async _normalizeJsonProperty (jlo: object): Promise<IRDFSProperty> {

    // Set initial properties
    const outSchema: IRDFSProperty = {
      id:        jlo['@id'],
      label:     this.getValue(jlo[`${RDFS}label`]),
      comment:   this.getValue(jlo[`${RDFS}comment`]),
      domainIncludes: null
    };

    // console.log('[normalizeJsonProperty] returning', outSchema);
    return outSchema;

  }

  getValue(input: any): string {
    /*
     * Input any of:
     *   'something'
     *   {'@value': 'something' }
     *   {'@id': 'something' }
     *   ['something']
     *
     * Output:
     *  'something'
     */
    if (input) {
      if (typeof(input) === 'string') {
        return input;
      } else if (Array.isArray(input)) {
        return this.getValue(input[0]);
      } else {
        if (input['@value']) {
          return input['@value'];
        } else if (input['@id']) {
          return input['@id'];
        } else {
          throw new Error('no @value or @id found in object');
        }
      }
    } else {
      return input;
    }
  }

  async getSchema(typeUrl: string): Promise<IRDFSClass|IRDFSProperty> {
    /*
     * Fetch the schema for a given type
     *
     * Example:
     *  getSchema('http://schema.org/Person')
     */


    /*
     * First lookup in cache
     */
    console.log('[getSchema] unimplemented cache', typeUrl);
    if (false) {
      // meh
    } else {

      /*
       * Make HTTP request to fetch schema
       * NOTE: This /may/ return a graph of multiple items, if the
       *       item has sub-properties, ex: schema:dateCreated has
       *       schema:legislationDate which has a subPropertyOf
       *       referring to dateCreated
       */
      console.log('[getSchema] fetching via HTTP: ', typeUrl);
      const schemas = await this.getSchemaJson(typeUrl).then(
        s => this.normalizeJson(s));

      const schema = schemas.find(t =>
        t.id.replace('https', 'http') === typeUrl.replace('https', 'http'));

      // console.log('[getSchema] normalized: ', schemas, schema);
      return schema;
      /*
      if (schema) {
        console.log('[getSchema] now got ', schema);
        if (Object.keys(schema).includes('subClassOf')) {
          console.log('[getSchema] class', schema);
          return schema;
        } else {
          console.log('[getSchema] property', schema);
          return schema;
        }
      } else {
        console.error('[getSchema] not found', schemas, typeUrl);
      }
      return schemas$;
      */

    }
  }
}
