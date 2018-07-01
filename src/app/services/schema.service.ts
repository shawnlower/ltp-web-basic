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
