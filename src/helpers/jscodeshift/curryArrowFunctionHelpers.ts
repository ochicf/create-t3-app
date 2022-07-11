import j, { Collection, Statement } from "jscodeshift";

export interface CurryArrowFunctionHelpersConfig {
  collection: Collection;
  name: string;
}

export interface CurryArrowFunctionHelpersReturn {
  findVariableDeclaration(): Collection<j.VariableDeclaration>;
  ensureAsync(): Collection<j.ArrowFunctionExpression>;
  insertBeforeReturnStatement(
    statement: Statement,
  ): Collection<j.ReturnStatement>;
  addReturnStatementProperty(
    statement: Statement,
  ): Collection<j.ObjectExpression>;
}

export default function curryArrowFunctionHelpers({
  collection: root,
  name,
}: CurryArrowFunctionHelpersConfig): CurryArrowFunctionHelpersReturn {
  return {
    findVariableDeclaration,
    ensureAsync,
    insertBeforeReturnStatement,
    addReturnStatementProperty,
  };

  function findVariableDeclaration() {
    return root.find(j.VariableDeclaration, {
      declarations: [{ id: { name } }],
    });
  }

  function ensureAsync() {
    const collection = findVariableDeclaration().find(
      j.ArrowFunctionExpression,
    );
    const astPath = collection.paths()[0];
    if (astPath) {
      astPath.value.async = true;
    }
    return collection;
  }

  function insertBeforeReturnStatement(statement: Statement) {
    return findVariableDeclaration()
      .find(j.ReturnStatement)
      .at(0)
      .insertBefore(statement);
  }

  function addReturnStatementProperty(statement: Statement) {
    const collection = findVariableDeclaration()
      .find(j.ReturnStatement)
      .find(j.ObjectExpression);
    const astPath = collection.paths()[0];
    if (astPath) {
      astPath.node.properties.push(
        // TODO: validate that statement is of of the accepted types?
        statement as Parameters<typeof astPath.node.properties.push>[0],
      );
    }
    return collection;
  }
}
