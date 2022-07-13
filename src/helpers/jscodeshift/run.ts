import path from "path";
// @ts-expect-error: not typed in @types/jscodeshift
import { run as jscodeshift } from "jscodeshift/src/Runner.js";
import { PKG_ROOT } from "../../consts.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransformOptions = Record<any, any>;

export interface Config<TO extends TransformOptions> {
  paths: string[];
  transform: string;
  transformOptions?: TO;
  dry?: boolean;
  print?: boolean;
  silent?: boolean;
  verbose?: 0 | 1 | 2;
}

export interface TransformResult {
  stats: Record<string, unknown>;
  timeElapsed: string;
  error: number;
  ok: number;
  nochange: number;
  skip: 0;
}

/**
 * Wrapped function to define a clearer interface and set some defaults
 * that we need for all codemods we apply.
 */
export function run<TO extends TransformOptions>(
  config: Config<TO>,
): Promise<TransformResult> {
  const { transform, transformOptions, paths, ...jscodeshiftConfig } = config;
  const parameters = {
    ...transformOptions,
    silent: true,
    ...jscodeshiftConfig,
    babel: true,
    parser: "ts",
    parserConfig: path.join(PKG_ROOT, "tsconfig.json"),
    extensions: "ts,js",
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return jscodeshift(transform, paths, parameters);
}

export default run;
