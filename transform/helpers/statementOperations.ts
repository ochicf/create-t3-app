import j from "jscodeshift";

export interface StatementOperationConfig<S extends j.ASTNode> {
  /**
   * Ensures that the statement operation is only performed once.
   */
  once?: boolean | ((source: string, collection: j.Collection<S>) => boolean);
}

export function shouldPerformStatementOperation<S extends j.ASTNode>(
  source: string,
  astPaths: j.ASTPath<S>[],
  { once }: StatementOperationConfig<S> = {},
) {
  const onceFn =
    once === true
      ? () => true
      : // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        once || (() => false);

  return !onceFn(source, j(astPaths) as j.Collection<S>);
}

export function addStatementOnce<S extends j.Statement>(
  source: string,
  collection: j.Collection<S>,
) {
  return collection.toSource().includes(source);
}
