import { Injectable } from '@angular/core';

import { Subject, Observable, of, from, pipe } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import * as jsonld from '../../assets/js/jsonld.js';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SchemaService {

  constructor(private http: HttpClient) {
  }

  public getLabelForType(typeUrl: string): Promise<any>|null {

    // console.log('[getLabelForType]', typeUrl);

    // Fetch our schema first
    const resp = this.getSchema(typeUrl);

    return resp.toPromise().then(
      schema => {
        return jsonld.flatten(schema)
          .then(flat => {
            /*
             *
             */
            const typeSchema = flat.filter(o => o['@id'] === typeUrl)[0];
            const rdfsLabel = 'http://www.w3.org/2000/01/rdf-schema#label';
            if (typeSchema) {
              // Use the RDFS class information to build an appropriate
              // label
              const label = typeSchema[rdfsLabel];
              // console.log('[getLabelForType] label', typeUrl, label);
              return label[0]['@value'];
            } else {
              // console.log('[getLabelForType] flat', flat, typeUrl);
            }})
          .catch(err => {
            console.log('[getLabelForType]', 'Error', err);
            return of(null);
          });
      });
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
