import { API, FileInfo } from "jscodeshift";
import addImports from "jscodeshift-add-imports";

import curryArrowFunctionHelpers from "../../../src/helpers/jscodeshift/curryArrowFunctionHelpers.js";

export interface BaseContextTransformOptions {
  usingAuth?: boolean;
  usingPrisma?: boolean;
}

export default function transformer(
  file: FileInfo,
  api: API,
  options: BaseContextTransformOptions,
) {
  const j = api.jscodeshift;
  const s = j.template.statement;
  const root = j(file.source);

  const createContextHelpers = curryArrowFunctionHelpers({
    collection: root,
    name: "createContext",
  });

  if (options.usingAuth) {
    addImports(root, [
      s`import { unstable_getServerSession as getServerSession } from "next-auth";`,
      s`import { authOptions as nextAuthOptions } from "../../pages/api/auth/[...nextauth]";`,
    ]);
    createContextHelpers.ensureAsync();
    createContextHelpers.insertBeforeReturnStatement(s`
      const session =
        req && res && (await getServerSession(req, res, nextAuthOptions));
    `);
    createContextHelpers.addReturnStatementProperty(s`session`);
  }

  if (options.usingPrisma) {
    addImports(root, s`import { prisma } from "../db/client";`);
    createContextHelpers.addReturnStatementProperty(s`prisma`);
  }

  return root.toSource();
}
