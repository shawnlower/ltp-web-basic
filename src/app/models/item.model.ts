import * as uuid from 'uuid';

/*
 * Our Item class allows us to 'root' the hierarchy of objects which we'll
 * be storing.
 *
 * For everything that we'd like to store, we need to define what the 'thing'
 * actually is.
 *
 * Example: There's an NBA game today featuring the Miami Heat v Phil 76ers.
 *
 * The primary subject is the game, however the teams themselves, as well
 * as the game's location are also subjects. Simply flattening this object
 * into a list of items which have semantic types causes us to lose detail
 * on which items were actually important.
 *
 * Instead, we define an Item type, with a sameAs relationship to the child
 * objects.
 *
 */
export class Item {
    uri: string;       // A URI that identifies the item; generally this will
                       // take the form of a dereferenceable URL. Knowledge
                       // solely of the URL would then allow one to completely
                       // reconstruct the item.
                       //
    sameAs: string;    // A URI that refers to the actual resource. It may be
                       // (extremely) useful to perform secondary caching
                       // of a resource, and thus define multiple sameAs
                       // relationships.
                       //
    data: JsonLD;      // The actual object
                       //
    observed: string;  // The datetime when the item was initially encountered.
                       // This is often distinct from the creation time,
                       // modification time, etc.

  constructor(data: string|JsonLD) {
    this.data = <JsonLD>data;
    this.uri  = 'http://shawnlower.net/i/' + uuid.v1();
  }
}

export class JsonLD {
  '@type': string;
}

/*
export class JsonLD {
  '@context'?: any;
  '@graph'?: any;
  '@type'?: string;
  '@id'?: string;
  type: any;
  // @ts-ignore
  any: any;
}

/*
export interface JsonLdObject {
  '@type': string
}
*/
