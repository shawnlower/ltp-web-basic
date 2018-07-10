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

interface SchemaCache {
  [key: string]: IRDFSClass;
}

interface PropertyCache {
  [key: string]: IRDFSProperty;
}

@Injectable({
  providedIn: 'root'
})
export class SchemaService {

  propertyCache: PropertyCache;
  schemaCache: SchemaCache;
  schemaMap: {};           // map of URL -> Array<IRDFSProperty>
  classHierarchy: {};      // Linked list of class<->subclasses

  constructor(private http: HttpClient) {
    // Init caches
    this.schemaCache = {};
    this.propertyCache = {};
    this.schemaMap = {};
    this.classHierarchy = {};
  }

  public getLabelForType(typeUrl: string): Promise<string>|null {
    // console.log('[getLabelForType] args', arguments);
    /*
     * - Fetch schema as IRDFSClass
     * - return schema.label
     */
    return this.getSchema(typeUrl)
      .then(schema => schema.label)
      .catch(error => {
        console.warn('Unable to get label: ', error);
        return null;
      });
  }

  addProperty(property: IRDFSProperty) {
    // console.log('[addProperty] ', property, this.propertyCache);

    this.propertyCache[property.id] = property;
  }

  getCachedSchema(typeUrl: string): IRDFSClass {
    // console.log('[getCached] args', arguments);
    const schema = this.schemaCache[typeUrl];
    if (schema) {
      return schema;
    } else {
      return null;
    }
  }

  getCachedProperties(typeUrl: string, recurse = -1): Array<IRDFSProperty> {
    /*
     * Returns the properties for a given type from the cache
     * Returns:
     * null: No item found in cache
     * []  : No properties for item
     * [ IRDFSProperty, ...]
     */
    if (recurse === 0 ) {
      throw new Error('Maximum recursion depth exceeded');
    }

    // get all cached properties
    const props = [].concat(this.schemaMap[typeUrl])
      .map(prop => this.propertyCache[prop])

    /*
     * classHierarchy:
     * child = classHierarchy[typeUrl];
     * parent = child.parents[0];
     */
    if (this.classHierarchy[typeUrl] && this.classHierarchy[typeUrl].parents) {
      // found a superClass
      for (const parentUrl of this.classHierarchy[typeUrl].parents) {
        if (parentUrl) {
          // recursively append any cachedProperties here
          return props.concat(this.getCachedProperties(parentUrl, --recurse));
        }
      }
    }

    // console.log(`[getCachedProperties] ${typeUrl}: ${props.length} properties`);
    return props;
  }

  async getProperties(typeInfo: string|IRDFSClass, recurse = 10):
    Promise<IRDFSProperty[]> {
    /*
     * Return: The RDF properties that are valid for a given type
     *   The promise of an array of IRDFSProperty objects
     *
     * Arguments:
     *   typeInfo: can be either
     *     - a URL
     *     - an RDF schema class object (IRDFSClass)
     *
     * Stack looks roughly like:
     *   getProperties
     *       getCachedProperties
     *           updateProps
     *               getSchema
     *                   normalizeJson
     *                       normalizeJsonProperty
     *                         or
     *                       normalizeJsonClass
     */

      let typeUrl: string;
      if (typeof(typeInfo) === 'string') {
        typeUrl = typeInfo;
      } else {
        typeUrl = typeInfo.id;
      }

      const properties: IRDFSProperty[] = [].concat(
        this.getCachedProperties(typeUrl, 20));

      // console.log('[getProperties] from cache: ', properties);

      if (properties.length > 0) {
        // just promisify our cached props
        const p: Promise<IRDFSProperty[]> = new Promise(resolve => {
          resolve(properties);
        });
        return p;

      } else {
        // Update our own type first
        await this.updateProps(typeUrl);
        //  .then(() => {

        if (this.classHierarchy[typeUrl] &&
            this.classHierarchy[typeUrl].parents) {
          // found a superClass
          for (const parentUrl of this.classHierarchy[typeUrl].parents) {
            if (parentUrl) {
              // recursively append any cachedProperties here
              await this.updateProps(parentUrl, --recurse);
            }
          }
        }

        console.error('[getProperties]', this.schemaCache, this.propertyCache,
          this.schemaMap);
        return properties.concat(this.getCachedProperties(typeUrl, 20));
      }
    }

  async updateProps(typeUrl: string, recurse = 30): Promise<any> {
    console.error('[updateProps] called', arguments);

    if (recurse < 1) {
      throw new Error('[getProperties] max recursion depth exceeded');
    }

    const schema = await this.getSchema(typeUrl);
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

    let rdfType: string;

    for (const o of expanded) {
      if (o) {
        // console.log('[normalizeJson] expanded o', o);
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
          /*
           * RDFS Class
           */
          outSchemas.push(await this._normalizeJsonClass(o));
        } else if (rdfType === `${RDF}Property`) {
          /*
           * RDFS Property
           */
          outSchemas.push(await this._normalizeJsonProperty(o));
        } else {
          // console.warn('[normalizeJson] ignoring unknown', o);
          // throw new Error('normalizeJson: Invalid type: ' + rdfType);
        }
      }
    }
    return outSchemas;
  }


  private async _normalizeJsonClass (jlo: object, recurse = 20): Promise<IRDFSClass> {
    /*
     * recurse: used when walking the class hierarchy
     * e.g. 3 = follow 3 levels subClassOf entries
     */
    // console.log('[normalizeJsonClass] args', arguments);

    // Set initial properties
    const outSchema = {
      id:        jlo['@id'],
      label:     this.getValue(jlo[`${RDFS}label`]),
      comment:   this.getValue(jlo[`${RDFS}comment`]),
      subClasses: null,
      superClasses: null
    };

    /*
     * Populate superClasses
     */
     outSchema.superClasses = [].concat(jlo[`${RDFS}subClassOf`]).map(
       superClass => {
         const url = this.getValue(superClass);
         if (url) {
           if (! this.classHierarchy[outSchema.id]) {
             this.classHierarchy[outSchema.id] = {};
             this.classHierarchy[outSchema.id].parents = [];
             this.classHierarchy[outSchema.id].children = [];
           }
             if (!this.classHierarchy[outSchema.id]
               .parents.includes(url)) {
               this.classHierarchy[outSchema.id].parents.push(url);
           }

           this.getSchema(url);
           return url;
         }
       });

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

    outSchema.domainIncludes = jlo[`${SCHEMA}domainIncludes`].map(
      domain => {
        const url = this.getValue(domain);
        if (!this.schemaMap[url]) {
          this.schemaMap[url] = [outSchema.id];
        } else {
          if (!this.schemaMap[url].includes(outSchema.id)) {
            this.schemaMap[url].push(outSchema.id);
          }
        }
        return this.getValue(domain);
      });

    // console.log('[normalizeJsonProperty] returning', outSchema, jlo);
    this.propertyCache[outSchema.id] = outSchema;
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
    if (!typeUrl.startsWith('http')) {
      throw new Error('Invalid URL: ' + typeUrl);
    }

    /*
     * First lookup in cache
     */
    let schema = this.getCachedSchema(typeUrl);
    if (schema) {
      return schema;
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
        s => {
          // console.log('[getSchema] JSON-LD: ', s);
          return this.normalizeJson(s);
        });

      // cast
      const _schemas: Array<any>  = schemas;

      // Store all schemas in cache
      _schemas.map(s => this.schemaCache[s.id] = s);

      // return the single schema matching our typeUrl
      schema = _schemas
        .find(t => {
          return t.id.replace('https', 'http') ===
              typeUrl.replace('https', 'http');
        });

      return schema;

    }
  }
}
