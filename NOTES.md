Notes on designing a very minimal web application.

- We'll be using [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) for our implementation

# Setup

```bash
$ npm i @angular/cli
$ ng new ltp-app --routing --directory app
$ cd app; npm audit
```


# Design notes

## Modal Editor

We want a modal for creating a new item and editing existing.

This is really just the default app..let? for the page. It could hypothetically
be used to provide a view/control for any application


Reqs:
1) Take arbitrary text
2) Accept a url
3) Set the type
4) Alter the view based on type

Interaction workflow:
- init (via hotkey / button)
- text box appears, input focused

```bash
|----------------------------------------------------------------------------|
| (T)ype: text snippet <http://schema.org/Note>                              |
|----------------------------------------------------------------------------|
|  Text (i)nput: [                                                         ] |
|                [                                                         ] |
|                [ Buy laundry detergent                                   ] |
|----------------------------------------------------------------------------|
| 1) To-do item                                                              |
| 2) Note                                                                    |
|----------------------------------------------------------------------------|
| (L)inks:                                                                   |
|----------------------------------------------------------------------------|
```
- user enters some text
- Suggest content types
- User optionally selects a more specific type using hotkey (e.g. M-a)
    - Additional fields appear (most-common fields, with [..more..] for all
    - When no input field has focus, '/' allows searching through fields, or
      activating the 'link' action ('l'). When field IS focused, the same
      hotkey apply, pre-fixed with M- (alt)
- User presses <enter> to submit form
- Item created
- Item added to activity
- Item selected within activity, for next action (e.g.: 'l' to link, 'e' to
  re-open editor modal, '!' to execute shell command, etc)

## Implementation

- We have 3 things:
    - The data source (may be empty initially), or:
        - JSON-LD source, (e.g. from LTP API)
        - RDFa from a website
    - The view
        - Can be HTML/RDFa, but must be editable
- Once we have a semantic type (e.g. http://schema.org/Restaurant)


## JSON-LD -> RDFa (dynamically generated view)

- For each key in our JSON-LD document:
    - If scalar (string/number)
        - Generate span: <span property="{{ key }}"><input type="text">

Schema handling
Using example from http://schema.org/Car

The SKU is defined:
1) In the JSON document content as { sku: 'xxxxx' }
2) In the schema with:
    - rangeIncludes: schema:text

- JSON-LD has a set of properties:
    - Property key: SKU

- Start with the ID: blank node, filename, url, etc
  - We need a type:


=== Notes

- We need to parse such that we preserve order, e.g.:
 { '@context': ...,
   '@id': "http://example.org/cars/for-sale#tesla",
   '@type': 'gr:offering',
   'gr:includes': { // vehicle // }
 }

is not the same as flattened():

 @graph": [
    { "@id": "_:b0", "gr:hasCurrency": "USD", "gr:hasCurrencyValue": "85000" },
    { "@id": "_:b1", "@type": [ "gr:Individual", "pto:Vehicle" ],
  ]

As we certainly don't want the price at the top of the page, we want the item with the price nested

Flattened:

  - First get the context and graph
    - Types of context
      - IRI,         "@context":  "http://schema.org/",
      - Object k/v:  "@context":  "gr":  "http://purl.org/goodrelations/v1#",
      - Object,      "@context":  {      "name": "http://schema.org/name",
                                         "description": "http://schema.org/description",
                                         "image": { "@id": "http://schema.org/image", "@type": "@id" } }
      - Mix of Object + Object k/v
    },



for item in graph:
  elType = getType(item) // ['string', 'number', 'url', 'image']
  dataType = ..


getType(item) {
  if (item['@type']) {
    // At this point, we're either a literal or a complex type
    t = item('@type');
    switch typeof(t) {
      case 'string':
        console.log(`Item ${t} is a string.`);
        break;
        
      case 'number':
        console.log(`Item ${t} is a number.`);
        break;
        
      case 'boolean':
        console.log(`Item ${t} is a boolean.`);
        break;
        
  } else if (item['type'] {
  /*
   * Example with type 
   *     {
   *       "@context": "http://schema.org/",
   *       "@graph": [
   *         {
   *           "id": "_:b0",
   *           "type": "Person",
   *           "name": "Jane Doe",
   *         }
   *       ]
   *     }
   */


  } else {
  /*
   * Example with neither
   *
   *  "@context": {
   *       "ical": "http://www.w3.org/2002/12/cal/ical#",
   *   },
   *   "@graph": [
   *     {
   *       "@id": "_:b0",
   *       "ical:summary": "Lady Gaga Concert"
   *       "ical:location": "New Orleans Arena, New Orleans, Louisiana, USA",
   *     }
   *
   * We should probably just fail, but could infer and
   *   1) If predicates are fragments, then check that w/o is a valid resource type?
   */
  }

# References
## Distillers
- http://rdf.greggkellogg.net/distiller?command=serialize&format=jsonld&output_format=rdfa&raw
- https://www.w3.org/2012/pyRdfa/

# Item definition

For everything that we'd like to store, we need to define what the 'thing'
actually is.

Example: There's an NBA game today feat the Miami Heat v Phil 76ers.

The primary subject is the game, however the teams themselves, as well
as the game's location are also subjects. Simply flattening the item
into a list of new items is not always useful.

Instead, an Item defines what the primary topic will be.

class Item {
    uri: string;       // A URI that identifies the item; generally this will
                       // take the form of a dereferenceable URL. Knowledge
                       // solely of the URL would then allow one to completely
                       // reconstruct the item.
                       //
    subjectOf: string  // A URI that refers to the actual resource
                       //
    observed: string   // The datetime when the item was initially encountered.
                       // This is often distinct from the creation time,
                       // modification time, etc.
}


Inputs:
    - Text note
        - # Pseudocode:
          ```javascript
          makeItemFromString(content: string) {
            timestamp Timestamp = now();
            const jlo: JsonLdObject = makeJLO('schema:NoteDigitalDocument',
                { dateCreated: timestamp, keywords=[], text=content });
            objStore = new fakeObjstore();
            uri = objStore.post(jlo).response.location;
            item = makeItem(subject: string = uri, observed = timestamp);
          ```
    - URL
        - # Pseudocode:
          ```javascript
             makeItemFromUrl(url) {
               // Extract human and/or computer-readable content from URL
               // This is being done interactively, so at a minimum, we can
               // expect the URL to be dereferenceable to something.
               for (let contentType in [ 'text/html', 'application/ld+json' ]) {
                 http.get(url, content_type).then()..
               const jlo: JsonLdObject = makeJLO('schema:',
          ```
        -

Tests:
    - Person
    - Place
    - Creative Works
        - Book
        - Movie
        - Photo
    - To Do Item
    - Goal
    
    
    


# Dereferencing schemas

URI
    - Context
        - schema.org
        - FOAF

Process:

const uri = 'http://dbpedia.org/page/Walt_Disney'

/*
 * Fetching with curl and no special args, we get:
 * Content-Type: text/html
 * Link: ... lots of links to alternate machine readable formats, e.g.
 * ld+json, sparql endpoints, rdf/xml, etc
 */

const mime_types = [
  'application/ld+json',
  'application/rdf+xml'
];

for (let mime in mime_types) {
    const resp = get_mime(mime, url);
}


