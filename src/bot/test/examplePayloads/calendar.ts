export const apiPayload = {
	responses: [
		{
			cardTemplateType: "calendar",
			text: "Please select the day to schedule your appointment.",
			errorMessage: "Provide a valid date.",
			isRequired: true,
			value: "2021-08-30",
			max: "2021-12-31",
			min: "2021-08-30",
		},
	],
}

export const expectedResponse = {
	contentType: "application/vnd.microsoft.card.adaptive",
	content: {
		$schema: "http://adaptivecards.io/schemas/adaptive-card.json",
		type: "AdaptiveCard",
		version: "1.3",
		body: [
			{
				type: "TextBlock",
				size: "Medium",
				text: "Please select the day to schedule your appointment.",
				wrap: true,
			},
			{
				type: "TextBlock",
				text: "*Select a date between 2021-08-30 and 2021-12-31.*",
				wrap: true,
				size: "default",
				weight: "lighter",
			},
			{
				type: "Input.Date",
				id: "date",
				label: "Select from below:",
				placeholder: "Enter a date",
				min: "2021-08-30",
				max: "2021-12-31",
				value: "2021-08-30",
				isRequired: true,
				errorMessage: "Provide a valid date.",
			},
			{
				type: "ActionSet",
				id: "controls",
				isVisible: true,
				actions: [{ type: "Action.Submit", title: "OK" }],
			},
		],
		actions: [],
	},
}
