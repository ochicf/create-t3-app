import j from "jscodeshift";
import {
  StatementOperationConfig,
  shouldPerformStatementOperation,
  addStatementOnce,
} from "./statementOperations";

export interface CurryArrowFunctionHelpersConfig {
  collection: j.Collection;
  name: string;
}

export interface CurryArrowFunctionHelpersReturn {
  findVariableDeclaration(): j.Collection<j.VariableDeclaration>;
  ensureAsync(): j.Collection<j.ArrowFunctionExpression>;
  insertBeforeReturnStatement(
    source: string,
    config?: StatementOperationConfig<j.ASTNode>,
  ): j.Collection<j.ReturnStatement>;
  addReturnStatementProperty(
    source: string,
    config?: StatementOperationConfig<j.ObjectExpression>,
  ): j.Collection<j.ObjectExpression>;
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

  function insertBeforeReturnStatement(
    source: string,
    config?: StatementOperationConfig<j.ASTNode>,
  ): j.Collection<j.ReturnStatement> {
    const collection = findVariableDeclaration().find(j.ReturnStatement).at(0);
    return shouldPerformStatementOperation<j.ASTNode>(
      source,
      collection.paths(),
      { once: addStatementOnce, ...config },
    )
      ? collection.insertBefore(source)
      : collection;
  }

  function addReturnStatementProperty(
    source: string,
    config?: StatementOperationConfig<j.ObjectExpression>,
  ): j.Collection<j.ObjectExpression> {
    const collection = findVariableDeclaration()
      .find(j.ReturnStatement)
      .find(j.ObjectExpression);
    const astPath = collection.paths()[0];

    if (
      astPath &&
      shouldPerformStatementOperation(source, [astPath], {
        once: addStatementOnce,
        ...config,
      })
    ) {
      astPath.node.properties.push(
        // TODO: validate that statement is of of the accepted types?
        // @ts-expect-error: expects specific types but it does work with string (at least with the ones wee need ATM)
        source,
      );
    }
    return collection;
  }
}
