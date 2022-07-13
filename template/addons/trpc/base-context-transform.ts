import { API, FileInfo } from "jscodeshift";
import addImports from "jscodeshift-add-imports";

// @ts-expect-error: importing with .js extension causes jscodeshift to not find the module
import curryArrowFunctionHelpers from "../../../src/helpers/jscodeshift/curryArrowFunctionHelpers.ts";

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
  const ts = j.template.statement;
  const root = j(file.source);

  const createContextHelpers = curryArrowFunctionHelpers({
    collection: root,
    name: "createContext",
  });

  if (options.usingAuth) {
    addImports(root, [
      ts`import { unstable_getServerSession as getServerSession } from "next-auth";`,
      ts`import { authOptions as nextAuthOptions } from "../../pages/api/auth/[...nextauth]";`,
    ]);
    createContextHelpers.ensureAsync();
    createContextHelpers.insertBeforeReturnStatement(/* ts */ `
      const session =
        req && res && (await getServerSession(req, res, nextAuthOptions));
    `);
    createContextHelpers.addReturnStatementProperty(/* ts */ `session`);
  }

  if (options.usingPrisma) {
    addImports(root, ts`import { prisma } from "../db/client";`);
    createContextHelpers.addReturnStatementProperty(/* ts */ `prisma`);
  }

  return root.toSource();
}
