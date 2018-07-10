
/*
 *
 */
  export interface IRDFSProperty {
    id: string;
    label?: string;
    comment?: string;
    domainIncludes?: Array<string>;
  }

  export interface IRDFSClass {
    id: string;
    label?: string;
    comment?: string;
    subClasses: Array<IRDFSClass>;
    superClasses: Array<IRDFSClass>;
  }
