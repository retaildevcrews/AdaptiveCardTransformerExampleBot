# Yeoman Generator Design

## Yeoman Workflow

Running tasks in Yeoman sequentially is alright if there’s a single generator. However, since we will be calling the [botbuilder generator](https://github.com/microsoft/BotBuilder-Samples/tree/main/generators/generator-botbuilder) in our adapter generator, we will need to follow Yeoman's run loop, which is a queue system with priority support. Priorities are defined in your code as special prototype method names. Any method not using the special prototype name will be pushed in the default group. Any private methods (pefixed by an underscore (e.g. `_private_method`) will not be pushed to the `default` group.

The priority order for Yeoman is documented [here](https://yeoman.io/authoring/running-context.html).

The proposed Yeoman priority order for our generator will be as follows:

1. initializing() - we will welcome the user to our generator
1. prompting() - prompting the user for inputs. This method will call several private methods in order:
   1. `_promptingBot()` - whether or not the user wants to create a bot with botbuilder
   1. `_promptingBotbuilder()` - if they do want to create a bot, we will prompt them for neccesary inputs for the botbuidler generator.
   1. `_promptingPlugins()` - prompts for plugins to scaffold for use with adapter
1. configuring - N/A
1. default() - `generateBotbuilder()` does not use method name, so it will be pushed to `default`. If the user responded `yes` to `_promptingBot()`, `generateBotbuilder()` will run the botbuilder generator given responses from the `_promptingBotbuilder()` method.
1. writing() - we will write the user selected plugins and pluginConfig, given responses from `_promptingPlugins()`. The botbuilder generator will also write bot files as in this step.
1. conflicts - N/A until install step
1. install() - for the purposes of the adapter generator, we will do our overwrite of bot code and bot `package.json` (with dependency on the `adaptive-card-tranformer`) in the install step, as bot files do not exist until after the `writing()` step is completed.
1. end() - thank the user for using the generator and add any additional steps

## Calling Botbuilder Generator from our Generator

### Overview/Problem Statement

Our yeoman generator is private, yet we would like to call the public [botbuilder generator](https://github.com/microsoft/BotBuilder-Samples/tree/main/generators/generator-botbuilder) from our yeoman generator. By calling the botbuilder generator from our yeoman generator, developers will be able to scaffold their bot (with a dependency on the adapter package), as well as scaffold the desired plugins to use with the adapter package.

### Solution

Yeoman offers multiple ways for generators to build upon common ground. The `composeWith` method allows the generator to run side-by-side with another generator (or subgenerator). That way it can use features from the other generator instead of having to do it all by itself. Refer to Yeoman's composibility [documentation](https://yeoman.io/authoring/composability.html).

`composeWith` takes two parameters: `generatorPath` - A full path pointing to the generator you want to compose with (usually using require.resolve()) and `options` - An Object containing options to pass to the composed generator once it runs.

Run on its own, the botbuilder generator prompts users for their `botname`, `description`, `language`, and `template` (echo, core, empty). Once answered, the botbuilder generator creates a directory with the user inputed `botname` and copies all of the needed files into that directory.

The desired Yeoman workflow for our generator would be to:

1. Ask the user if they have a bot already, or if they would like to create a bot using the botbuilder generator
1. If they would like to create a bot, we would call the botbuilder generator from our generator
1. Add the adapter dependency to the bot and override the index.js file in the bot to call the adapter
1. Ask the user if they would like to add any plugins - if so, create the files/directory structure needed for template selector, pre-processor, and post-processor

Rather than have the botbuilder generator prompt the user, we would prefer that our generator prompt the user. Therefore, our generator can store user responses and govern next actions depending on these user responses. Overriding the index.js file (step 3 above) from our generator would require knowedge of the user's response to `language` and `template` for their bot as well as location of the bot files (`botname` directory).

Thus, we will need to leverage the `composeWith` `options` parameter. We will need to create prompts in our generator to prompt the user for `botname`, `description`, `language`, and `template`. We will need to pass our user responses to the botbuilder generator and disable prompting from the botbuilder generator directly.

To do so, we will leverage the `--noprompt` found in the botbuilder generator source [code](https://github.com/microsoft/BotBuilder-Samples/tree/main/generators/generator-botbuilder). Sudo code below:

```javascript
this.composeWith(require.resolve("generator-botbuilder/generators/app"), {
 noprompt: true,
 botname: this.botname,
 description: this.description,
 language: this.language,
 template: this.template,
})
```

To see how this was implemented, please refer to sample [Yeoman Adapter Code]

[Yeoman Adapter Code]: [./generator-adaptive-card-transformer/generators/index.js]

## Packaging

### Overview/Problem Statement

The solution project is anticipated to consist of several isolated yet interdependent components:

1. the adaptive card transformer package
1. the yeoman generator package
1. the 'example' project

The 'example' project has a dependency upon both the adaptive card transformer package and the yeoman generator package. At the time of this writing, the final disposition of various of the elements of the overall project/solution has not yet been decided/concluded. Open questions include the following:

- Licensing (Open-Source, closed-source, other)
- Package distribution mechanisms (public package repo e.g., [npmjs.org](https://npmjs.org), private/corporate package repo)

To support the package-level dependency structures necessary to produce a complete, functional 'example' project, it is required to devise and implement an _interim_ strategy that will permit the design-time resolution of the package dependencies _before_ the final disposition of their publication (or not) can be determined. Once the unresolved licensing and package distribution questions are formally answered, the packages can be migrated to a more permanent infrastructure that is consistent with the eventual answers to those questions.

Several options are possible for this interim package hosting strategy as follows:

### Option 1: Host packages at [npmjs.org](https://npmjs.org)

The common use-case for package resolution in node-based project via `npm` is for npm to resolve packages published to [npmjs.org](https://npmjs.org). [npmjs.org](https://npmjs.org) supports both the more familiar 'public' packages (having unrestricted visibility), but also supports 'private' packages (having visibility restricted to only authorized users).

Following are several challenges with this approach:

- hosting public packages presumes the licensing issue(s) have been resolved (and _in favor_ of a license e.g., Open-Source that would support the package being made public)
- support for private packages on npmjs.org is only available to _paying_ (commercial) accounts/customers, making pursuit of this variant complicated and time-consuming

### Option 2: Host packages at self-hosted npm package repository

Multiple options exist for self-hosted npm package repositories which could then be deployed on a private network behind a firewall to prevent unauthorized access. Options for this approach run the gamut from lighter-weight/open-source offerings e.g., [verdaccio.org](https://verdaccio.org/) to more expensive commercial/for-fee offerings.

Following are several challenges with this approach:

- this approach presumes that the licensing issue(s) have been resolved (and decided _against_ a license e.g., Open-Source that would support the package being made public)
- the location of the private network into which this option would be deployed would need to be determined/decided
- the responsibility for the maintenance/support of the package repository would need to be determined/assigned

### Option 3: Initially host package in Git(Hub) repositories

For some time now (since v1.0.26) `npm` has supported package resolution directly from one or more git(hub) repositories (see [this blog post](http://debuggable.com/posts/private-npm-modules:4e68cc7d-1ac4-42d9-995a-343dcbdd56cb) and [this doc page](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#dependencies) for more detail).

Enabling this requires the following syntax be used to register the package dependencies in the _consuming_ application's `package.json` file:

```javascript
{
    // ...
    "dependencies" : {
        // ...
        "adaptive-card-transformer" : "https://github.com/retaildevcrews/AdaptiveCardTransformer.git"
    }
}
```

With this entry present in the `package.json` file, the command `npm install` will resolve the "adaptive-card-transformer" dependency directly from the referenced repository, installing it into the local `node_modules` folder as expected in a "standard" install experience.

A similar approach could be used to resolve the Yeoman Generator package dependency.

Following are several advantages with this approach:

- no change to the current state (re: privacy/visibility/licensing) of the packages/source code is necessary to support this option
- this option can be pursued/implemented independent of the resolution of the pending/unresolved licensing/distribution decisions
- the only change(s) needed if/when decisions on the pending licensing/distribution issues are resolved is to edit the `package.json` file(s) of any consuming applications to remove the reference to the git(hub) repository(ies) and replace them with references the 'final' package publishing location(s).

### Decisions/Conclusions

Option 3 is determined to be the least-invasive, least-complicated, lowest-friction approach to 'simulate' the same package resolution experience as would be possible once the pending licensing/distribution issues are resolved.

## Publishing and Developer Consumption

### Overview

The proposed yeoman generator (henceforth 'generator') will need to be made available for consumption by software developers. For _publicly-available_ generators, this process typically involves the following coarse-grained flow:

1. Develop the generator.
1. Publish the generator as an NPM package to [npmjs.org](https://npmjs.org).
1. Add the generator to [the master list of generators on the Yeoman site](https://yeoman.io/generators/) (to improve visibility/awareness to the yeoman-using developer community).

Using the generator then typically involves the following:

1. Engineer discovers the generator (by searching either [npmjs.org](https://npmjs.org) or [the master list of generators on the Yeoman site](https://yeoman.io/generators/))
1. Engineer installs the generator package from npm (via e.g., `npm install generator-adaptive-card-transformer`)
1. Engineer runs the generator via yeoman (e.g., `yo adaptivecardgenerator`, the package-name _minus_ the `generator-` prefix)

### Interim Packaging & Publishing Approach

In the case of this proposed generator, owing to the inconclusive nature of the decisions around its final distribution, etc. (see [Packaging](#packaging) section for more details), this approach is inappropriate to implement at the time of this writing.

In its place, following is the proposed _interim_ publishing process recommended prior to the formal resolution of the pending licensing/distribution issues:

1. Develop the generator as planned.
1. The completed generator will _not_ be published to [npmjs.org](https://npmjs.org). Instead, the generator will be retained only in its design-time Git(Hub) repository (e.g., the repo containing the 'example' project). Engineers desiring to install/consume it will retrieve the package directly from that location sim. to the approach proposed for retrieving the adapter package itself (although as a `tarball` instead of direct retrieval as a `git pull`, see below for more details).
1. The completed generator will _not_ be added to the master list of generators on the Yeoman site unless/until it is determined that the generator is to be licensed/distributed publicly.
1. If/when the final decision re: licensing/distribution of the generator is reached, one of the following actions can be pursued as appropriate:

   | Decision                                      | Actions                                                     |
   | --------------------------------------------- | ----------------------------------------------------------- |
   | Open-Source license, public distribution      | revert to 'typical' publication steps for public generators |
   | Closed-Source license, no public distribution | package and publish to appropriate private NPM repository   |

### Consuming the Generator

The pattern for consuming the generator (prior to its final disposition being determined) will be as follows:

1. Engineer installs Yeoman as usual (e.g., `npm install -g yo`).
1. Engineer manually edits `package.json` of consuming project to provide URL to a tarball containing the generator package, e.g.,

   ```javascript
   {
       // ...
       "devDependencies" : {
           // ...
           "generator-adaptive-card-transformer" : "https://github.com/retaildevcrews/wd-bot/releases/tarball/v1.0.0"
       }
   }
   ```

   _Note that due to the structure of the `example` repository not having the `package.json` of the generator located in the root of the repository as expected by `npm` when retrieving a Yeoman generator, the proposed URL structure for the generator dependency above resolves instead to a `tarball file` containing the package rather than the `.git` repository URL as proposed elsewhere in this doc for the adapter package itself. If/when the generator source were to be extracted from the example repo to a separate repository of its own (having its own `package.json` in it own root folder), this work-around would cease to be required and a `.git`-based URL could be employed instead (same as for the adapter package itself)._

1. Engineer runs `npm install` to resolve the dependency from its Git(Hub) repository location and hydrate the local `node_modules` folder with the package.
1. Engineer runs `yo adaptive-card-transformer` to invoke the generator.
   - Note that per the Yeoman documentation, the generator package declared in the host `package.json` _must_ be named "generator-XYZ" for the `yo` command to resolve it from the `node_modules` folder as in the above sample invocation.
