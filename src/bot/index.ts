import { resolve } from "path"
import dotenv from "dotenv"
import Logger from "./logging"
import * as restify from "restify"
// the .env file is located in the root
// Construct full plugin install path from project root and relative path
dotenv.config({ path: resolve(__dirname, "../../.env") })

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { BotFrameworkAdapter } from "botbuilder"

// This bot's main dialog.
import { DocBot } from "./bot"

// Check that the environment variables are present
if (
	process.env.MicrosoftAppId === undefined ||
	process.env.MicrosoftAppPassword === undefined
) {
	const APP_SECRET_ERROR =
		"Microsoft app secrets not defined. Check environment variables"
	Logger.error(APP_SECRET_ERROR)
	throw new Error(APP_SECRET_ERROR)
}

// Create HTTP server.
const server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, () => {
	Logger.info(server.name + " listening to " + server.url)
	Logger.info(
		"Get Bot Framework Emulator: https://aka.ms/botframework-emulator",
	)
	Logger.info("To talk to your bot, open the emulator select 'Open Bot' ")
})

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
	appId: process.env.MicrosoftAppId,
	appPassword: process.env.MicrosoftAppPassword,
})

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
	// This check writes out errors to console log .vs. app insights.
	// NOTE: In production environment, you should consider logging this to Azure
	//       application insights.

	Logger.error("[onTurnError] unhandled error: ", error.message.toString())

	// Send a trace activity, which will be displayed in Bot Framework Emulator
	await context.sendTraceActivity(
		"OnTurnError Trace",
		`${error}`,
		"https://www.botframework.com/schemas/error",
		"TurnError",
	)

	// Send a message to the user
	await context.sendActivity("The bot encountered an error or bug.")
	await context.sendActivity(
		"To continue to run this bot, please fix the bot source code.",
	)
}

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler

// Create the main dialog.
const myBot = new DocBot()

// Listen for incoming requests.
server.post("/api/messages", (req, res) => {
	adapter.processActivity(req, res, async (context) => {
		// Route to main dialog.
		await myBot.run(context)
	})
})
