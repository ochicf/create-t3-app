# Transform

Project containing codemods to apply to templates.

## How it works?

On its own, this project does nothing. It's only the folder were all the codemods are written.

Codemods are defined in `transform` files (hence the name of the project), and they apply some changes to the received source code.

Though any consumer code is able to pick any `transform` file and apply it to any file, usually each `transform` file will be called by code of the same domain, and will have a specific target file in mind to which was written against. For example, addons define codemods to alter the templates during the installation process, to add/remove features conditionally.

## Why a sub-project?

Codemods are run through `jscodeshift` and run in a different process, so there are some quirks when handling the files. (see [known quirks](#known-quirks))

By separating the code for transforming the files into a different project, code can be referenced through the main `tsconfig.json` file but some options can be overriden here.

## Known quirks

### Module resolution

The spawned process will not find relative files with `.js` extensions, so we must write the imports without the extension so it's resolved by the spawned process. Since the base `tsconfig.json` is configurd with `moduleResolution: "Node16"`, it prevents us from doing that, so we the `transform/tsconfig.json` overrides this setting to `"Node"`.

Also note that this issue prevents us from importing outer code from the `transform` submodule.

## Write a codemod

For now look around exsting codemods to see how they are done. This is a world on its own so you will need to get acquainted with how they work.

Some references:

- [jscodeshift](https://github.com/facebook/jscodeshift)
- [awesome-codemods](https://github.com/rajasegar/awesome-codemods#typescript)

### File structure

Ideally we would keep the same file structure as the `../template` folder. Usually transform files will match 1 to 1 to templates, so in this cases using the same name will also be recommended.

### How to call codemods

You can run codemods by running them with the `run` function in `/src/helpers/jscodeshift/run`. This is just a wrapper to the actual `jscodeshift` runner but it sets some defaults for ease of use.

See its usages in the project for more examples.
