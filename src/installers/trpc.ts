import type { Installer } from "./index.js";
import path from "path";
import fs from "fs-extra";
import { BaseContextTransformOptions } from "../../template/addons/trpc/base-context-transform.js";
import { PKG_ROOT } from "../consts.js";
import { run as jscodeshift } from "../helpers/jscodeshift/run.js";
import { runPkgManagerInstall } from "../utils/runPkgManagerInstall.js";

export const trpcInstaller: Installer = async ({
  projectDir,
  pkgManager,
  packages,
  noInstall,
}) => {
  await runPkgManagerInstall({
    pkgManager,
    projectDir,
    packages: [
      "react-query",
      "superjson",
      "@trpc/server",
      "@trpc/client",
      "@trpc/next",
      "@trpc/react",
      "zod",
    ],
    devMode: false,
    noInstallMode: noInstall,
  });
  const usingAuth = packages?.nextAuth.inUse;
  const usingPrisma = packages?.prisma.inUse;

  const trpcAssetDir = path.join(PKG_ROOT, "template/addons/trpc");

  const apiHandlerSrc = path.join(trpcAssetDir, "api-handler.ts");
  const apiHandlerDest = path.join(projectDir, "src/pages/api/trpc/[trpc].ts");

  const utilsSrc = path.join(trpcAssetDir, "utils.ts");
  const utilsDest = path.join(projectDir, "src/utils/trpc.ts");

  const contextFile = "base-context.ts";
  const contextSrc = path.join(trpcAssetDir, contextFile);
  const contextDest = path.join(projectDir, "src/server/router/context.ts");

  if (usingAuth) {
    const authRouterSrc = path.join(trpcAssetDir, "auth-router.ts");
    const authRouterDest = path.join(projectDir, "src/server/router/auth.ts");
    await fs.copy(authRouterSrc, authRouterDest);
  }

  const indexRouterFile = usingAuth
    ? "auth-index-router.ts"
    : "index-router.ts";
  const indexRouterSrc = path.join(trpcAssetDir, indexRouterFile);
  const indexRouterDest = path.join(projectDir, "src/server/router/index.ts");

  const exampleRouterFile = usingPrisma
    ? "example-prisma-router.ts"
    : "example-router.ts";
  const exampleRouterSrc = path.join(trpcAssetDir, exampleRouterFile);
  const exampleRouterDest = path.join(
    projectDir,
    "src/server/router/example.ts",
  );

  await Promise.all([
    fs.copy(apiHandlerSrc, apiHandlerDest),
    fs.copy(utilsSrc, utilsDest),
    fs.copy(contextSrc, contextDest),
    fs.copy(indexRouterSrc, indexRouterDest),
    fs.copy(exampleRouterSrc, exampleRouterDest),
  ]);

  await jscodeshift<BaseContextTransformOptions>({
    paths: [contextDest],
    transform: path.join(trpcAssetDir, "base-context-transform.ts"),
    transformOptions: {
      usingAuth,
      usingPrisma,
    },
  });
};
