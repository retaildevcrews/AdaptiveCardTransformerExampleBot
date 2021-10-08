# Adaptive Card Transformer Sample Bot

## Overview

This is DocBot, a sample Teams bot implementation that simulates scheduling a Doctor's appointment.

This project represents a scenario where a backend API handles all of the dialog flow logic. All user responses are forwarded to the API and all of the API's responses are transformed/adapted to be displayed to the user as [Adaptive Cards](https://adaptivecards.io/). To achieve this, the bot leverages the [Adaptive Card Tranformer](https://github.com/retaildevcrews/AdaptiveCardTransformer).

This repository contains a sample [Microsoft Teams bot](https://docs.microsoft.com/en-us/microsoftteams/platform/bots/what-are-bots), backend API, and set of plugins to use with `adaptive-card-transformer`.

## Development

### Development Container

1. Install the [Remote-Containers VSCode extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
1. Open the solution using the devcontainer, the ci tools and solution dependencies will be installed on the devcontainer build
1. If the devcontainer is slow, take a look at some of the suggestions [here](https://code.visualstudio.com/docs/remote/containers-advanced#_improving-container-disk-performance) eg: switching to `delegated` mount consistency in macOS really helps. The `node_modules` are mounted in a volume to speed up the overall build of the container.
1. When making a commit the pre-commit hook will run `detect-secrets.sh`. If you want to run the pre-commit hook manually run `pre-commit run --all-files`

### Setup Development Bot

1. Clone the repository

1. (optional) Open the repository in the dev container using VSCode

1. Deploy Azure Bot (Azure Portal)

   - Create Bot name
   - Select Resource Group
   - Use Standard pricing tier
   - Select default "Create new Microsoft App ID"
   - Settings > Configuration > Messaging endpoint
     - `https://<ngrok_tunnel_hostname>/api/messages`
     - Example: `https://pinkalpaca-chatbot.ngrok.io/api/messages`

1. Go to the src directory

   ```bash
   cd src/
   ```

1. Run `cp .env.example .env` and fill in more information in '.env' file:

   - `Microsoft App ID` can be found in Settings > Configuration
   - Next to `Microsoft App ID` > Manage > New client secret > copy value for `MicrosoftAppPassword`

1. Run `cp ngrok.example.yml ngrok.yml` and fill in the ngrok `authtoken` and `hostname`

   - The ngrok account owner that setup the domain should have this information

1. Install modules

   ```bash
   npm install
   ```

1. Start the bot and the api

   ```bash
   npm start
   ```

1. In a separate terminal (still within the dev container), start the `ngrok` tunnel

   ```bash
   ngrok start --all -config=ngrok.yml
   ```

1. Enable Teams Bot Channel

   - Azure Bot (previous step) > Settings > Channels > Microsoft Teams > Save > Terms of Service
     - Keep default "Microsoft Teams Commercial (most common) selected
   - Azure Bot > Settings > Channels > Microsoft Teams

1. Ready to test through Microsoft Teams! Remember to have ngrok and the bot server running when testing.

## Testing

The bot leverages [ts-jest](https://www.npmjs.com/package/ts-jest) on top of [Jest](https://jestjs.io/) for unit testing. This provides all the benefits of Jest (simplicity, rich functionality, built-in code coverage metrics) along with the complete TypeScript support of `ts-jest` (type-checking).

To run unit tests:

```sh
npm test # run all unit tests

npm test -- SomeTestFile # run unit tests in SomeTestFile

npm run test-coverage # run all unit tests with code coverage report
```

## Enhance CI Pipeline

### Run Woke with Custom Rulesets from Azure Bob Storage

[Woke](https://github.com/get-woke/woke) is a linting tool used to detect non-inclusive language in your source code and recommends alternative terms to use. A "ruleset" (a yaml file) defines the terms that woke will lint for. This repository currently runs woke with woke's default ruleset, which lints for non-inclusive terms.

In addition to the default ruleset, you can also define and apply custom rulesets to Woke. For example, you can use a custom ruleset to enforce branding terms. Custom rulesets can be stored in an Azure Storage Container. To access a custom ruleset locally from Azure Blob Storage, you will need to generate a SAS token on the ruleset file and set the token value in the '.env' file.

To use a custom ruleset from Azure Blob Storage and run Woke:

1. Add `AZURE_STORAGE_SAS_TOKEN` to .env file

1. Fill in the value for `AZURE_STORAGE_SAS_TOKEN` in '.env' with your generated sas token.

1. Add this line to `./scripts/run-ci.sh` to pull custom ruleset from Azure Blob Storge:
   `az storage blob download --account-name wokeruleset --container-name custom-ruleset --name ruleset.yaml --file customRuleSet.yaml --sas-token "$AZURE_STORAGE_SAS_TOKEN"`

1. Add this line `./scripts/run-ci.sh` to run woke with custom ruleset:
   `woke -c customRuleSet.yaml --exit-1-on-failure`
