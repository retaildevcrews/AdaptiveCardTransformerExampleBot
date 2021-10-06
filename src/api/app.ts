import express, { Request, Response } from "express"
import cors from "cors"
import morganMiddleware from "./logging/morganMiddleware"
import { Activity } from "botbuilder"
import greeting from "./sampleData/greeting.json"
import appointmentDates from "./sampleData/appointmentDatesCalendar.json"
import appointmentTimes from "./sampleData/appointmentTimes.json"
import appointmentDoctors from "./sampleData/appointmentDoctors.json"
import Logger from "./logging/logger"

// setup express endpoint
const app = express()
app.use(morganMiddleware)
app.use(cors())
app.use(express.json())
const port = process.env.BACKEND_PORT || 3000

// in memory conversation state object (development purpose only)
const convos = {}

/**
 * @interface ChoiceSelection Describes the adaptive card choice data object
 */
interface ChoiceSelection {
	title: string
	value: number
}

/**
 * Given an array of choices, get the title (name of the choice)
 *
 * @param id Index of the item of interest
 * @param items Array of choices
 * @returns Title of the choice with the given index
 */
const getTitleFromId = (id: number, items: ChoiceSelection[]): string => {
	return items.find(({ value }) => value === id).title
}

app.get("/", function (req: Request, res: Response) {
	res.send({
		type: "text",
		content: "Hello World!",
	})
})

app.post("/", function (req: Request, res: Response) {
	const activity: Activity = req.body

	// Initial convo - create state for conversation based off of bot activity identifier
	const convoId = activity.conversation.id

	// Keyword to start the example flow
	if (activity.text === "start") {
		// send a greeting messaege
		// prompt the user to select a date via calendar selection
		convos[convoId] = { turn: 0 }
		res.send({
			responses: [greeting, appointmentDates],
		})
	} else if (activity.text === undefined && convos[convoId]?.turn === 0) {
		// prompt the user to select a time via dropdown list
		convos[convoId].turn = 1
		convos[convoId].appointment = {
			date: activity.value.date,
		}
		res.send({
			responses: [appointmentTimes],
		})
	} else if (activity.text === undefined && convos[convoId]?.turn === 1) {
		// prompt the user to select a name via option buttons
		convos[convoId].turn = 2
		convos[convoId].appointment["time"] = getTitleFromId(
			+activity.value.selected,
			appointmentTimes.choices,
		)
		res.send({
			responses: [appointmentDoctors],
		})
	} else if (activity.text === undefined && convos[convoId]?.turn === 2) {
		// prompt the user to confirm via summary buttons
		convos[convoId].turn = 3
		convos[convoId].appointment["doctor"] = getTitleFromId(
			+activity.value.response,
			appointmentDoctors.choices,
		)
		const { date, time, doctor } = convos[convoId].appointment
		res.send({
			// note that this response payload is dynamically created based off of
			// the conversation history and previously selected values
			responses: [
				{
					cardTemplateType: "summary",
					title: "Appointment Summary",
					details: [
						{
							key: "Date",
							value: date,
						},
						{
							key: "Time",
							value: time,
						},
						{
							key: "Doctor",
							value: doctor,
						},
					],
				},
			],
		})
	} else if (activity.value !== undefined && convos[convoId]?.turn === 3) {
		// Display the final selected choice from the user
		const responseValue = activity.value.response
		res.send({
			responses: [
				{
					cardTemplateType: "text",
					text: `Your appointment has been ${responseValue}ed!`,
					subtext: "card will not show due to showSubtext=false",
					showSubtext: false,
				},
			],
		})
		// clear the conversation state
		convos[convoId] = undefined
	} else {
		// given the conversation turn and response type, prompt the user to select a response from the adaptive card
		// note that adaptive cards and regular text responses are returned differently back to the bot
		// the turn checks above determine if an adaptive card response activity was sent back based on the `activity.text`
		if (convos[convoId]?.turn === 0) {
			res.status(400).send("Please choose a date from above.")
		} else if (convos[convoId]?.turn === 1) {
			res.status(400).send("Please choose a time from above.")
		} else if (convos[convoId]?.turn === 2) {
			res.status(400).send("Please choose a doctor from above.")
		} else if (convos[convoId]?.turn === 3) {
			res.status(400).send('Please choose "Confirm" or "Cancel" above.')
		} else {
			res.status(400).send("Type 'start' to make an appointment")
		}
	}
})

// listen on the specified port for incoming requests from the bot
app.listen(port, () => {
	Logger.info("application is running on port " + port)
})
