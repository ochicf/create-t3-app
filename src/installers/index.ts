import path from "path";
import fs from "fs-extra";
import { T3AppPackageJson } from "../helpers/writePackageJsonCreateT3AppInfo.js";
import { PackageManager } from "../utils/getUserPkgManager.js";
import { nextAuthInstaller } from "./next-auth.js";
import { prismaInstaller } from "./prisma.js";
import { tailwindInstaller } from "./tailwind.js";
import { trpcInstaller } from "./trpc.js";

// Turning this into a const allows the list to be iterated over for programatically creating prompt options
// Should increase extensability in the future
export const availablePackages = [
  "nextAuth",
  "prisma",
  "tailwind",
  "trpc",
] as const;

export type AvailablePackages = typeof availablePackages[number];

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  projectName?: string;
}

export type Installer = (opts: InstallerOptions) => Promise<void>;

export type PkgInstallerMap = {
  [pkg in AvailablePackages]: {
    inUse: boolean;
    installed: boolean;
    installing: boolean;
    installer: Installer;
  };
};

export const buildPkgInstallerMap = async ({
  projectDir,
  packages,
}: {
  projectDir: string;
  packages: AvailablePackages[];
}): Promise<PkgInstallerMap> => {
  const pkgJson = (await fs
    .readJSON(path.join(projectDir, "package.json"))
    .catch(() => null)) as null | T3AppPackageJson;

  return availablePackages.reduce(
    (acc, pkg) => {
      const installed =
        pkgJson?.createT3App?.packages?.[pkg]?.installed ?? false;
      const installing = packages.includes(pkg);
      return {
        ...acc,
        [pkg]: {
          ...acc[pkg],
          inUse: installing || installed,
          installed,
          installing,
        },
      };
    },
    {
      nextAuth: {
        inUse: false,
        installed: false,
        installing: false,
        installer: nextAuthInstaller,
      },
      prisma: {
        inUse: false,
        installed: false,
        installing: false,
        installer: prismaInstaller,
      },
      tailwind: {
        inUse: false,
        installed: false,
        installing: false,
        installer: tailwindInstaller,
      },
      trpc: {
        inUse: false,
        installed: false,
        installing: false,
        installer: trpcInstaller,
      },
    },
  );
};
