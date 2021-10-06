import {
	ActivityHandler,
	Attachment,
	CardFactory,
	MessageFactory,
	TurnContext,
} from "botbuilder"
import axios from "axios"
import adapter from "@retaildevcrews/adaptive-card-transformer"
import Logger from "./logging"
import pluginConfig from "./pluginConfig.json"

/**
 * @interface apiResponse Specifies that the data payload being passed into the adapter requires a specific property.
 *
 * This/these required properties are required to ensure that the template selector plugin is able to properly identify the correct card template.
 * Refer to the template selector plugin for more details on how this is used.
 */
interface apiResponse {
	cardTemplateType: string
}

/**
 * Bot Framework chatbot that walks the user through scheduling a doctors appointment. The bot leverages the adaptive card adapter and showcases some
 * the different card templates that can be used along with a data driven pattern. This bot leverages an example backend API to drive dialog flow/content.
 */
export class DocBot extends ActivityHandler {
	previousCard: Attachment
	previousId: string

	constructor() {
		super()

		// needed for hiding containers in Adaptive Cards
		this.previousCard = null
		this.previousId = null

		// see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
		this.onMessage(async (context, next) => {
			// relay user response directly to backend API
			if (process.env.BACKEND_API === undefined) {
				// for this example bot, a localhost endpoint is used to receive dialog payloads
				// this call should be replaced with the appropriate dialog conversation service
				const BACKEND_API_ERROR = "BACKEND_API environment variable not set"
				Logger.error(BACKEND_API_ERROR)
				throw new Error(BACKEND_API_ERROR)
			}

			await axios
				.post(process.env.BACKEND_API, context.activity)
				.then(async (res) => {
					// receive the backend response which will be used to populate adaptive cards before being presented to the user
					const responses: apiResponse[] = res.data["responses"]

					// hide buttons on previous card if card exists
					await this.sendUpdateCard(context)

					// the bot is able to process and send multiple responses (dependant on the dialog service logic)
					// this loop ensures that all responses are transformed via the adapter and sent to the user sequentially
					for (const response of responses) {
						// assumed pre condition: all dialog payloads are valid
						// it would be good to perform validations on the payload to ensure it is ready to be consumed by the adapter
						Logger.debug("PRE-ADAPTER: " + JSON.stringify(response))

						// invoke the adapter with each response
						const cardJson = await adapter(response, pluginConfig)
						// utilize the adaptive card factory to generate an activity attachment which is ready to be sent to the user (replied by the bot)
						const card = CardFactory.adaptiveCard(cardJson)
						Logger.debug("POST-ADAPTER: " + JSON.stringify(card))

						// respond to the user with the attachment card
						const sent = await context.sendActivity({ attachments: [card] })

						this.previousCard = card
						this.previousId = sent.id
					}
				})
				.catch(async (error) => {
					// catch errors from the dialog api service
					if (error?.response?.status === 400) {
						await context.sendActivity(MessageFactory.text(error.response.data))
						Logger.error(
							"Reponse Status == 400. Error:  " + error.response.data,
						)
					} else {
						await context.sendActivity(
							MessageFactory.text("The bot encountered an error."),
						)
						Logger.error(error.toString())
					}
				})

			// by calling next() you ensure that the next BotHandler is run
			await next()
		})

		// handle new members being added to the chat - generic example to welcome user
		this.onMembersAdded(async (context, next) => {
			const membersAdded = context.activity.membersAdded
			const welcomeText = "Hello and welcome!"
			for (const member of membersAdded) {
				if (member.id !== context.activity.recipient.id) {
					await context.sendActivity(
						MessageFactory.text(welcomeText, welcomeText),
					)
				}
			}
			// by calling next() you ensure that the next BotHandler is run
			await next()
		})
	}

	/**
	 * Update most recent card to hide a card element based on unique ID
	 *
	 * @param context TurnContext object from the Bot
	 * @returns void
	 */
	async sendUpdateCard(context: TurnContext): Promise<void> {
		if (!(this.previousCard && this.previousId)) {
			return
		}

		// look for ID of "controls" in this implementation
		const controls = this.previousCard.content.body.find(
			(element) => element.id === "controls",
		)
		if (controls !== undefined) {
			controls.isVisible = false
		}

		const message = MessageFactory.attachment(this.previousCard)
		message.id = this.previousId
		await context.updateActivity(message)
	}
}
