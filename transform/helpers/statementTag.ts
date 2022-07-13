import j, { Statement } from "jscodeshift";

export interface StatementTag {
  (str: string): Statement;
  (...any: any[]): Statement;
}

export const jts: StatementTag = j.template.statement;

export default jts;
