const cheerio = require('cheerio');
const colors = require('colors');
const fs = require('fs');
const jsonld = require('jsonld');
const vkbeautify = require('vkbeautify');

exports.defContexts = {
    schema: 'http://schema.org/'
};

exports.exDoc = `
  {
    "@context": {
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "xsd": "http://www.w3.org/2001/XMLSchema#"
    },
    "@graph": [
        {
            "@id": "_:Ne6419922e55c40359874c97597d0c386",
            "@type": "http://schema.org/Person",
            "http://schema.org/name": "Jane Doe"
        },
        {
            "@id": "",
            "http://www.w3.org/ns/rdfa#usesVocabulary": {
                "@id": "http://schema.org/"
            }
        },
        {
            "@id": "_:Nf0e14f1d03014fd29c6a8f979ec49342",
            "@type": "http://schema.org/Person",
            "http://schema.org/name": "John Deere"
        }
    ]
  }
`;

interface JsonLD {
  '@context'?: any;
  '@graph'?: any;
  '@type'?: string;
  '@id'?: string;
  // @ts-ignore
  [any];
}

  /*
interface Section {
  typeUrl?: string;
  elements?: [string];
  sections: {
    [key: string]: Section;
  };
}
   */
interface Section {
  typeUrl?: string;
  elements: [string | null];
  sections?: [Section | null];
}


module.exports = jsonld2rdfa;

function getContext(context_url: string): Object {
  /*
   * Returns an object containing the full context
   */

  if (!context_url) {
    // Empty context_url
    return {};
  }

  const context = {
    'person': fs.readFileSync('./data/person.schema.json').toString()
  };

  return context;
}

function warn(msg) {
  console.log(colors.red(msg));
}

function error(msg) {
  console.log(
    colors.bold(
      colors.red(msg)
  ));
}

function initDoc(data: JsonLD) {
  /*
   * Pass in a JSON-LD document, and initialize the document with it
   *
   */

  const DEFAULT_TYPE = 'http://schema.org/NoteDigitalDocument';

  console.log(colors.red('Document sections: '));
  for (const key in data) {
    if (key) {
      console.log(colors.red('\t' + key));
    }
  }

  // Create a new, empty document/DOM tree
  const $ = cheerio.load(`<div id="content">`);
  $('#content').append('<form class="form-horizontal" id="contentForm">');

  // First, we need an ID for our document
  let docID: string;
  if (data['@id']) {
    docID = data['@id'];
  } else {
    docID = 'http://shawnlower.net/_id/123';
  }
  $('#content').attr('about', docID);
  $('#content').attr('class', 'form-group');

    /*
     * Pull in basic CSS styling
     */
    const bootstrap_theme_url = 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css';
    const bootstrap_url = 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css';

    $('head').append(`<link rel="stylesheet" href="${bootstrap_url}">`);
    $('head').append(`<link rel="stylesheet" href="${bootstrap_theme_url}">`);

  // Get the context (one or more URLs) for the document
  const ctx: [string] = data['@context'];

  // For cases where there's a single context, e.g.:
  //
  // {
  //   "@context": "http://schema.org/",
  //   "@type": "Person",
  //   "name": "Jane Doe",
  //   "jobTitle": "Professor",
  //   "telephone": "(425) 123-4567",
  //   "url": "http://www.janedoe.com"
  // }

  // If we only have a single context URL, set it on the document itself
  if (typeof ctx === 'string') {
    $('body').attr('vocab', ctx);
  } else if (Array.isArray(ctx)) {
    // TODO
    warn('Doing nothing with an array of context items');

  } else {
    // If our context contains CURIEs, then we can add them as namespaces
    // in the document
    // e.g. <html xmlns="http://www.w3.org/1999/xhtml"
    //            xmlns:foaf=http://xmlns.com/foaf/0.1/">

    $('html').attr('xmlns', 'http://www.w3.org/1999/xhtml');
    for (const curie in <Object>ctx) {
      // Skip non-string, e.g.   @context: { "image": { @id: ... } }
      if (curie && typeof ctx[curie] === 'string') {
        console.log('Adding', curie);
        $('html').attr(`xmlns:${curie}`, ctx[curie]);
      }
      // for .. in wrapper
    }

  }

  // We also need a top-level type. JSON doesn't require this, but if we get
  // some random @graph or collection of nodes, then we'll just call it a
  // Thing, and let the user sort it out later
  let docType: string = data['@type'];
  if (!data['@type']) {
    warn(`No type definition found in document. Inspecting...`);

    // const subject = getSubjectForGraph(<JsonLD>data).then(() => { ugh });
    const subject = findGraphSubject(<JsonLD>data);

    if (subject && subject['@type']) {
      docType = subject['@type'];
      console.log(`Assuming ${docType} from subject ${subject['@id']}`);
    } else {
      warn(`Unable to find type definition. Using ${DEFAULT_TYPE}`);
      docType = DEFAULT_TYPE;
    }
  }
  $('#content').attr('typeof', docType);

  return $;
}

function writeSection(
  $, section, key: string, value: string) {

  // getKeyLabel();  // map e.g. dateCreated -> 'Creation Date'
  const keyLabel = getLabelForProperty(key);

  // getHelpText();  // Description of the field
  const helpText = 'Description of ' + key;

  /*
   * Give each control a unique 'id', so we can address them
   */
  const path = `${section.attr('id')}_${key}`;

  /*
   * Create the outer div for our group of key=value form elements
   */
  section.append(`<div id="${path}" class="form-group">`);

  /*
   * Get an object representing the div
   * (todo: why doesn't append() return that?)
   */
  const div = $(`#${path}`);

  // Append our label
  div.append(`<label for=${path} class="col-sm-2 control-label">${keyLabel}`);

  // Create the div + input control
  div.append(`<div class="col-sm-10"><input id="${path}" class="form-control" property="${key}" value="${value}"></div>`);

  return section;

}

async function jsonld2rdfa (data: JsonLD, $) {
  /*
   * Return a generically formatted RDFa document from a given JSON-LD input
   *
   */

  /*
   * Our structure comes from either a graph of nodes, or a set of nodes
   * at the top level.
   */

  // If this is a graph, just recurse, passing our contexts
  if ( data['@graph'] ) {
    return parseGraph(data, $);
  } else {
    return parseNotGraph(data, $);
  }
}

function parseGraph(data: JsonLD, $: Object): any {

  // console.log(colors.red('Parsing graph'), data);

  const currentSection: Section = {
    elements: [null],
    sections: [null]
  };

  const items = <JsonLD[]>data['@graph'];
  console.log(`Recursing graph with ${items.length} items.`);
  for (const item of items) {
    if (item) {
      console.log(colors.green('Item:', JSON.stringify(item, null, 2)));
      const section = jsonld2rdfa({
        ...item,
        '@context': data['@context']
      }, $);
    }
  }
  return $;
}

function parseNotGraph(data: JsonLD, $, parentSection: string = null,
                       currentPath: string = null): any {
  /*
   * Parent section refers to the container to create items in.
   * Default is '#content'
   */

  const DEFAULT_SECTION = '#contentForm';

  console.log(colors.red('Parsing non-graph'), data);

  /*
   * We want to handle the following types:
   * - Image -> <img>
   * - URL: -> <a>
   * - text: <span>
   */
  // We're not a graph, so we expect a type and some values

  let section; // $('section')

  if (!parentSection) {
    section = $(DEFAULT_SECTION);
  } else {
    const sectionName = data['@id'];
    if (!sectionName) { console.log('todo: no section name'); }
    section = $(parentSection).append(`<div id="${sectionName}">`);
  }

  let typeUrl: string;
  if (data['@type'] || data['type']) {
    typeUrl = data['@type'] ? data['@type'] : data['type'];
  }

  for (const key in data) {
    // Handle any additional JSON-LD keys
    if (key) {

      // Handle types
      if (key.startsWith('@')) {
        console.log('skipping', key);
      } else {
        /*
         * Arrays are nested at most once
         */
        if (Array.isArray(data[key])) {
          data[key].forEach(value => {
            if (typeof [key] === 'object') {
              console.log('Creating new div for', data[key]);
              if (currentPath) {
                currentPath = `${currentPath}.${key}`;
              } else {
                currentPath = key;
              }
              parseNotGraph(data[key], $, section);
            } else {
              writeSection($, section, key, value);
            }
          });
        } else if (typeof data[key] === 'object') {
          console.log('Creating new div for', data[key]);

          // Item IDs include the full path, e.g. person.address
          if (currentPath) {
            currentPath = `${currentPath}.${key}`;
          } else {
            currentPath = key;
          }
          parseNotGraph(data[key], $);
        } else {
          writeSection($, section, key, data[key]);
        }
      }

    }
    // wrapped for .. in
  }
  return $;
}

function getLabelForProperty(key: string): string {
  return key;
}


async function getSubjectForGraph(doc) {
  /*
   * return an object containing the subject of our graph, or null
   * if it can't be determined.
   */

  if ('@graph' in doc) {
    return findGraphSubject(doc);
  } else {
    let newdoc: string;
    try {
      newdoc = await jsonld.flatten(doc);
      return findGraphSubject(<JsonLD>newdoc);
    } catch (rejectedValue) {
      console.log('Unable to flatten doc');
    }
  }

}

function findGraphSubject(source: JsonLD) {

  /*
   * Receive a flattened tree, i.e. one with a '@graph' element
   * containing a set of items. Return the ID that does not appear in the
   * right-hand-side of a (s,p,o) triple.
   *
   */

  const g = source['@graph'];
  if (!g) {
    return null;
  }

  const flattenArray = a => {
    const flatArray = [];

    if (!Array.isArray(a)) {
      return [a];
    } else {
      return a.map(e => flattenArray(e));
    }
  };

  const getRecursive = (o: any, key: string): any[] => {

    const results = (o[key] ? [o[key]] : []);

    if (Array.isArray(o) && o.length > 0) {
      o.map(k => {
        getRecursive(k, key)
          .filter(r => r.length > 0)
          .forEach(r => results.push(r));
      });
      // console.log('Returning from array with', results);
    } else if (typeof o === 'object') {
      Object.keys(o).forEach(k => {
          getRecursive(o[k], key)
            .filter(r => r.length > 0)
            .forEach(r => results.push(r));
      });
    } else {
      // console.log('returning', results);
    }

    return results;

  };

  // Get IDs that occur at top-level
  const idsTop = g.map(i => i['@id'] && i['@id']);

  // Filter out any IDs that occur as references in children
  const items = g.filter(item => {
    for (const i of idsTop) {
      if (i && item['@id'] !== i) {
        return getRecursive(item, '@id').indexOf(i) > -1;
      }
    }
  });

  if (items.length === 1) {
    return items[0];
  }
  return null; // sadness

}

(function main() {
  const filename = process.argv[2];

  let data: {};

  if (filename) {
    const file = fs.readFileSync(filename);

    console.log('Parsing ', filename);
    data = JSON.parse(file);
  } else {
    data = JSON.parse(this.exDoc);
  }
  const $ = initDoc(data); // cheerio doc
  jsonld2rdfa(data, $).then(doc => {
      const str: string = vkbeautify.xml(doc.xml());
      console.log(colors.magenta(str));
      fs.writeFileSync('index.html', str);
    });
})();
