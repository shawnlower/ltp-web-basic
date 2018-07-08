
/*
 *
 */
  export interface IRDFSProperty {
    id: string;
    label?: string;
    comment?: string;
    domainIncludes?: Array<IRDFSClass>;
  }

  export interface IRDFSClass {
    id: string;
    comment?: string;
    label?: string;
    subClasses: Array<IRDFSClass>;
    superClasses: Array<IRDFSClass>;
    properties: Array<IRDFSProperty>;
  }
