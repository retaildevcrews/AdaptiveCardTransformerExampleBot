/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import * as path from "path"
import { config } from "dotenv"
import {
	ActivityHandler,
	ActivityTypes,
	TestAdapter,
	TurnContext,
} from "botbuilder"
import { DocBot } from "../bot"
import * as Calendar from "./examplePayloads/calendar"
import * as OptionButtons from "./examplePayloads/optionButtons"
import * as OptionList from "./examplePayloads/optionList"
import * as Summary from "./examplePayloads/summary"
import * as Text from "./examplePayloads/text"
import * as ErrorPayload from "./examplePayloads/errorPayload"

jest.setTimeout(10000)

describe("bot integration tests", () => {
	const ENV_FILE = path.join(__dirname, "test.env")
	config({ path: ENV_FILE })

	// Set up TestAdapter to simulate a user sending messages
	// TurnContext is being passed a static Activity as the input is arbitrary
	// the bot reponse is dependant on the api response which is mocked
	const testAdapter = new TestAdapter()
	const processActivity = async (bot: ActivityHandler): Promise<void> => {
		const context = new TurnContext(testAdapter, {
			type: ActivityTypes.Message,
		})
		await bot.run(context)
	}

	const mockAxios = new MockAdapter(axios)

	test("non-adaptive card", async () => {
		mockAxios
			.onPost(process.env.BACKEND_API)
			.reply(400, "Type 'start' to make an appointment")

		// Instantiate bot
		const frontendBot = new DocBot()

		// Send activity to bot
		await processActivity(frontendBot)

		// Assert we get the right response
		const reply = testAdapter.activityBuffer.shift()
		expect(reply.text).toEqual("Type 'start' to make an appointment")
	})

	test("template not found from adapter", async () => {
		mockAxios
			.onPost(process.env.BACKEND_API)
			.reply(200, ErrorPayload.apiPayload)
		const frontendBot = new DocBot()
		await processActivity(frontendBot)
		const reply = testAdapter.activityBuffer.shift()
		expect(reply.text).toEqual("The bot encountered an error.")
	})

	test("calendar adaptive card", async () => {
		await comparePayloadAndResponse(Calendar)
	})

	test("optionButtons adaptive card", async () => {
		await comparePayloadAndResponse(OptionButtons)
	})

	test("optionLists adaptive card", async () => {
		await comparePayloadAndResponse(OptionList)
	})

	test("summary adaptive card", async () => {
		await comparePayloadAndResponse(Summary)
	})

	test("text adaptive card", async () => {
		await comparePayloadAndResponse(Text)
	})

	const comparePayloadAndResponse = async (example: {
		apiPayload: any
		expectedResponse: any
	}) => {
		mockAxios.onPost(process.env.BACKEND_API).reply(200, example.apiPayload)

		const frontendBot = new DocBot()

		// send activity to bot
		await processActivity(frontendBot)

		// assert we get the right response
		const reply = testAdapter.activityBuffer.shift()
		expect(reply.attachments[0]).toEqual(example.expectedResponse)
	}
})
