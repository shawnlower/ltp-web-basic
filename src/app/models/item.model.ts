// Our 'Item' class stores a JSON payload, as well as the content (dataType) of the item
// The JSON payload is a JSON-LD object

export class Item {
  constructor(
    public url: string,
    public dataType: string,
    public json: object) { }
}


