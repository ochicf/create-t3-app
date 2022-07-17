import path from "path";
import fs from "fs-extra";
import { type PackageJson } from "type-fest";
import { InstallerOptions, AvailablePackages } from "../installers/index.js";
import { getVersion } from "../utils/getT3Version.js";

// All properties are treated as optional since apps created with previous
// versions of the CLI may not have them.
export interface CreateT3AppInfo {
  version?: string;
  createdAt?: string;
  updatedAt?: null | string;
  packages?: {
    [key in AvailablePackages]?: {
      installed: boolean;
    };
  };
}

export interface T3AppPackageJson extends PackageJson {
  createT3App?: CreateT3AppInfo;
}

export const writePackageJsonCreateT3AppInfo = async (
  options: InstallerOptions,
) => {
  const { projectDir, packages } = options;

  const pkgJsonPath = path.join(projectDir, "package.json");
  const pkgJson = (await fs.readJSON(pkgJsonPath)) as T3AppPackageJson;

  const createT3AppInfo: Required<CreateT3AppInfo> = {
    version: getVersion(),
    createdAt:
      pkgJson.createT3App?.createdAt ??
      (await fs
        .stat(pkgJsonPath)
        .then((stats) => stats.birthtime.toISOString())),
    updatedAt: pkgJson.createT3App?.createdAt ? new Date().toISOString() : null,
    packages: Object.entries(packages ?? {}).reduce(
      (acc, [name, { installing, installed }]) => ({
        ...acc,
        [name]: { installed: installing || installed },
      }),
      {},
    ),
  };

  pkgJson.createT3App = createT3AppInfo;

  await fs.writeJSON(pkgJsonPath, pkgJson, {
    spaces: 2,
  });
};
