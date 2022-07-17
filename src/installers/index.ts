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
    /** @deprecated: use `installed` instead */
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
  const pkgJson = (await fs.readJSON(
    path.join(projectDir, "package.json"),
  )) as T3AppPackageJson;
  return {
    nextAuth: {
      inUse: pkgJson.createT3App?.packages?.nextAuth?.installed ?? false,
      installed: pkgJson.createT3App?.packages?.nextAuth?.installed ?? false,
      installing: packages.includes("nextAuth"),
      installer: nextAuthInstaller,
    },
    prisma: {
      inUse: pkgJson.createT3App?.packages?.prisma?.installed ?? false,
      installed: pkgJson.createT3App?.packages?.prisma?.installed ?? false,
      installing: packages.includes("prisma"),
      installer: prismaInstaller,
    },
    tailwind: {
      inUse: pkgJson.createT3App?.packages?.tailwind?.installed ?? false,
      installed: pkgJson.createT3App?.packages?.tailwind?.installed ?? false,
      installing: packages.includes("tailwind"),
      installer: tailwindInstaller,
    },
    trpc: {
      inUse: pkgJson.createT3App?.packages?.trpc?.installed ?? false,
      installed: pkgJson.createT3App?.packages?.trpc?.installed ?? false,
      installing: packages.includes("trpc"),
      installer: trpcInstaller,
    },
  };
};
