import * as uuid from 'uuid';
import * as jsonld from '../../assets/js/jsonld.js';

/*
 * An Item represents a named graph centered on a specifically 'typed' piece
 * of data.
 *
 * Example: There's an NBA game today featuring the Miami Heat v Phil 76ers.
 *
 * The primary subject is the game, however the teams themselves, as well
 * as the game's location are also subjects. Simply flattening this object
 * into a list of items which have semantic types causes us to lose detail
 * on which items were actually important.
 *
 * Instead, we define an Item, which has:
 *
 *   - Type:       In this case an Event, the basketball game
 *   - Provenance: Is this data from an external URL, or did we generate it
 *                 from firsthand knowledge?
 *   - Timestamp:  When the knowledge came to be known, i.e. observation time
 *   - Graph:      A graph of all the data from this observation.
 *
 */

export class Item {

    // Namespaces
    static DC             = 'http://purl.org/dc/elements/1.1/';
    static DCT            = 'http://purl.org/dc/terms/';
    static LTP            = 'http://ltp.shawnlower.net/i/';
    static PROV           = 'http://www.w3.org/ns/prov#';
    static SCHEMA         = 'http://schema.org/';


    static DEFAULT_TYPE   = `${Item.SCHEMA}Thing`;
    static DEFAULT_PREFIX = Item.LTP;


    prefix: string;    // The prefix for our items

    uuid: string;      // The auto-generated unique identifier for the item

    /* Only store intrinsic data here. e.g.
     * - @id
     * - @type of thing
     * - initial observation timestamp
     * the rest come from properties
    sameAs: string;    /*
                        *
                        *
                        * A URI that refers to the actual resource. It may be
                        * (extremely) useful to perform secondary caching
                        * of a resource, and thus define multiple sameAs
                        * relationships.
                        */

    _data: object;     /*
                        * using JSON-LD 1.1 to make working with the items
                        * easier. We also take advantage of the named graphs,
                        * which are also referred to here as 'observations'
                        *
                        * An observation could be:
                        *  - The set of data captured from a single photograph
                        *  - Saving contact information for a person
                        *  - Saving a WebPage, or some data from within
                        *  - Making note of a book to read
                        *  - Making any other note for later reference
                        *
                        * The 'thing' (Place in a photo, Person, Book, etc),
                        * may then have additional 'observations' made.
                        *  - <event> <occuring at> <place>
                        *  - <person> <knows> <otherPerson>
                        *
                        * Provenance can then also be tied to the graph
                        */

    observed: string;  /*  <item> <dc:created> <dct:created>
                        *  <item> <prov:wasGeneratedAt> <xsd:datetime>
                        *  prov:activity ...
                        *
                        *  The datetime when the item was initially encountered.
                        *  This is often distinct from the creation time,
                        *  modification time, etc.
                        */

    /* usefulness tbd
    isPhysical: boolean; /*
                          * Is this a digital item, or the representation of a
                          * physical item?
                          *
                          * You can't serialize a ham sandwich.
                          * You can serialize a MediaObject that represents
                          * it, a webpage about it, a digital document, etc.
                          *
                          * Examples for the less-creative :-)
                          *
                          * Digital:
                          * - WebPage
                          * - NoteDigitalDocument
                          * - Script/Source Code
                          *
                          * Physical:
                          * - Person
                          * - Restaurant
                          * - Event (timestamp, yes, the event itself: no)
                          * - Goal
                          *
                          */

    source: string;     /* Set this ONLY when importing JSON-LD / RDF directly
                         *
                         * When generating new content (e.g. note, photo, etc)
                         * we can just set a prov:wasGeneratedBy property.
                         *
                         * source maps to the following properties:
                         *
                         *  <item> <dc:creator> <dct:creator>
                         *  <item> <prov:wasDerivedFrom> ...
                         *
                         */

  get subjects(): string[] {
    return [ ...new Set(this.properties.map(property => property.s)) ];
  }

  get properties(): {g: string, s: string, p: string, o: string}[] {
    // return this.data['graphMap']['_:b0'];

    const properties = [];
    // Iterate through graphs
    for (const graphId in this.data['graphMap']) {
      if (graphId) {
        // Iterate through nodes in graph
        for (const node of this.data['graphMap'][graphId]) {
          if (node) {
            const nodeId = node['@id'];
            if (!nodeId) {
              console.warn('[item.model] no nodeId: ', node);
            }

            // Iterate through properties in node
            for (const property in node) {
              if (property) {
                const o = node[property];

                // For @id, @type
                if (typeof(property) === 'string') {
                  properties.push({
                    g: graphId,
                    s: nodeId,
                    p: property,
                    o: o
                  });
                } else {

                  let value: string;
                  if ('@value' in o) {
                    value = o['@value'];
                    properties.push({ [property]: value });
                  } else if ('@id' in o) {
                    console.warn('item.model: skipping @id', o, property);
                  } else {
                    console.warn('item.model: no data found', o, property);
                  }
                }

              }
            }
          }
        }
      }

    }

    if (properties.length === 0) {
      console.warn('item.model properties empty: ', this._data, properties);
    }
    return properties;
  }


  get data(): object {
    return this._data;

  }

  get uri(): string {
    /*
     * The URI is composed of the application's domain as a prefix, and a unique
     * identifier (currently UUIDv1
     */
    // console.warn(`Possible misuse of URI with ${uuid} at `, new Error().stack);

    return this.prefix + this.uuid;
  }

  get typeUrl(): string {
    /*
     * All items must have a primary type specified. We may support multiple
     * types in the future
     */
    if (this.data) {
      return this.data['@type'];
    } else {
      console.warn('[item.model] no type', this.data);
      return Item.DEFAULT_TYPE;
    }
  }

  // constructor(data: string|JsonLD = null, prefix = Item.DEFAULT_PREFIX) {
  constructor(typeUrl: string, prefix = Item.DEFAULT_PREFIX) {

    this.prefix = prefix;
    this.uuid = uuid.v1();
    this._data = { ... NAMED_GRAPH_TEMPLATE, '@type': typeUrl };

  }

  async load(data: string|JsonLD = null): Promise<any> {

    if (data) {
      /*
       * JSON-LD parsing / validation
       * - Ensure a single subject
       * - If existing '@id', change to 'sameAs' property
       * - Add '@id' property
       * - Add 'observed' meta-data
       */
      const expanded = await jsonld.expand(data);

      // There should be one primary graph subject per Item
      if (expanded.length !== 1) {
        throw new Error('Input JSON-LD requires exactly ONE primary subject'
          + `. expanded JSON-LD length: ${expanded.length}.`);
      }
      // We shouldn't have LTP meta-data yet
      const observed = Item.LTP + 'observed';
      if (observed in expanded[0]) {
        throw new Error('Input JSON-LD already contains LTP meta-data?');
      }

      /*
       * Now we can simply flatten the object. Our primary subject can
       * always be retrieved by its '@id' matching the item uri.
       */

      if ('@id' in expanded[0]) {
        // throw new Error('@id at top-level not yet supported.');
        console.warn('@id at top-level not yet supported.');
        /*
          this.addProperty(`${Item.DC}creator`, expanded[0]['@id']);
          this.addProperty(`${Item.DC}created`, new Date(Date.now()));
          this.addProperty(`${Item.PROV}wasDerivedFrom`, expanded[0]['@id']);
         */
      } else {
        expanded[0]['@id'] = this.uri;
      }

      /*
       * We can use the W3C Provenance ontology (PROV-O) to preserve the
       * sourcing information for our data. Considering the following
       * input:
       *
       *  <ltp:100>    <a>                <Person>
       *  <ltp:100>    <name>             "Jane Doe"
       *  <ltp:100>    <address>          <ltp:101>
       *  <ltp:100>    <telephone>        "(212) 123-4567"
       *  <ltp:100>    <worksFor>         <ltp:102>
       *  <ltp:101>    <a>                <PostalAddress>
       *  <ltp:102>    <streetAddress>    "7 S. Broadway"
       *  <ltp:101>    <postalCode>       "10012"
       *  <ltp:102>    <a>                <Company>
       *  <ltp:102>    <name>             "Penguin Books"
       *
       * We want to treat this as a single item, although we may later
       * derive value from linking to other resources; relevant
       * information about the company, Jane's friends and colleagues,
       * even publications that she may have written.
       *
       * Additionally, if any of the data is later invalidated, we want to
       * know why, and what the source of the incorrect data was.
       *
       * Above, the 'subject' of our Item is <ltp:100>
       *
       * If this information came from a referenceable entity (URL) for
       * example, a JSON-LD source document with an '@id' <ex:100> present
       * then we can say:
       *
       * <ltp:100>    <prov:wasDerivedFrom>    <ex:100>
       * <ltp:101>    <prov:wasDerivedFrom>    <ex:100>
       * <ltp:102>    <prov:wasDerivedFrom>    <ex:100>
       *
       * If the information came from an offline source, we could create
       * an entity to represent that source, or just add a relationship to
       * the activity that resulted in this data, e.g.:
       *
       * <ltp:100>    <prov:wasGeneratedBy>    <ex:100>
       * <ltp:101>    <prov:wasGeneratedBy>    <ex:100>
       * <ltp:102>    <prov:wasGeneratedBy>    <ex:100>
       *
       *
       * Reference:
       * https://www.slideshare.net/dgarijo/provo-tutorial-dc2013-conference
       *
       * To do so, we add a predicate to each entity in our graph
       *
       */

      const flat = await jsonld.flatten(expanded);
      /*
       * Attach our named graph template to this item
       */
      this._data['graphMap'] = {
        '_:b0': flat
      };


    }
  }
}

export class JsonLD {
  '@type': string;
}

export const NAMED_GRAPH_TEMPLATE = {
  '@context': {
    '@version': 1.1,
    'owl':      'http://www.w3.org/2002/07/owl#',
    'dc':       'http://purl.org/dc/elements/1.1/',
    'dct':      'http://purl.org/dc/terms/',
    'ltp':      'http://ltp.shawnlower.net/i/',
    'prov':     'http://www.w3.org/ns/prov#',
    'schema':   'http://schema.org/',

    graphMap: {
      '@id': 'http://ltp.shawnlower.net/v/observations',
      '@container': ['@graph', '@id']
    }
  },
  graphMap: {
  }
};
