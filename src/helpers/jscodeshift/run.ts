import * as childProcess from "child_process";

export type TransformOptionsValue =
  | null
  | undefined
  | string
  | number
  | boolean;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface TransformOptions<TO extends Record<string, unknown>> {
  // @ts-expect-error: had to use interface otherwise does not work
  [key: keyof TO]: TransformOptionsValue;
}

export interface Config<TO extends TransformOptions<Record<string, unknown>>> {
  paths: string[];
  transform: string;
  transformOptions?: TO;
  dry?: boolean;
  print?: boolean;
  silent?: boolean;
  verbose?: 0 | 1 | 2;
}

/**
 * Redefined function because I could not import jscodeshift's Runner and make it
 * work as per explained in docs (see https://github.com/facebook/jscodeshift#usage-js).
 *
 * I've also taken this opportunity to define a clearer interface and set some defaults
 * that we need for all codemods we apply.
 */
export function run<TO extends TransformOptions<Record<string, unknown>>>(
  config: Config<TO>,
) {
  const { transformOptions, paths, ...jscodeshiftConfig } = config;
  const parameters = {
    ...transformOptions,
    silent: true,
    ...jscodeshiftConfig,
    parser: "ts",
    extensions: "ts",
  };
  return new Promise((resolve, reject) => {
    childProcess.exec(
      [
        `jscodeshift`,
        ...Object.entries(parameters).reduce<string[]>(
          (acc, [key, value]) => [...acc, namedParam(key, value)],
          [],
        ),
        ...paths,
      ].join(" "),
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      },
    );
  });
}

export default run;

export function namedParam(key: string, value: TransformOptionsValue): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? `--${key}` : "";
  }
  return `--${key}=${value}`;
}
