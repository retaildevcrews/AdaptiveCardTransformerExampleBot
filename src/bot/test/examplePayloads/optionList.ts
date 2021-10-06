export const apiPayload = {
	responses: [
		{
			cardTemplateType: "optionList",
			text: "Great! Please select your preferred time.",
			errorMessage: "Select a valid time.",
			isRequired: true,
			choices: [
				{
					title: "12:00 PM",
					value: 0,
				},
				{
					title: "12:30 PM",
					value: 1,
				},
				{
					title: "1:00 PM",
					value: 2,
				},
				{
					title: "1:30 PM",
					value: 3,
				},
				{
					title: "2:00 PM",
					value: 4,
				},
				{
					title: "2:30 PM",
					value: 5,
				},
				{
					title: "3:00 PM",
					value: 6,
				},
				{
					title: "3:30 PM",
					value: 7,
				},
				{
					title: "4:00 PM",
					value: 8,
				},
				{
					title: "4:30 PM",
					value: 9,
				},
				{
					title: "5:00 PM",
					value: 10,
				},
				{
					title: "5:30 PM",
					value: 11,
				},
				{
					title: "6:00 PM",
					value: 12,
				},
			],
		},
	],
}

export const expectedResponse = {
	contentType: "application/vnd.microsoft.card.adaptive",
	content: {
		$schema: "http://adaptivecards.io/schemas/adaptive-card.json",
		version: "1.3",
		type: "AdaptiveCard",
		body: [
			{
				type: "TextBlock",
				size: "Medium",
				text: "Great! Please select your preferred time.",
				wrap: true,
			},
			{
				type: "Input.ChoiceSet",
				id: "selected",
				label: "Select from below:",
				isRequired: true,
				errorMessage: "Select a valid time.",
				choices: [
					{ title: "12:00 PM", value: 0 },
					{ title: "12:30 PM", value: 1 },
					{ title: "1:00 PM", value: 2 },
					{ title: "1:30 PM", value: 3 },
					{ title: "2:00 PM", value: 4 },
					{ title: "2:30 PM", value: 5 },
					{ title: "3:00 PM", value: 6 },
					{ title: "3:30 PM", value: 7 },
					{ title: "4:00 PM", value: 8 },
					{ title: "4:30 PM", value: 9 },
					{ title: "5:00 PM", value: 10 },
					{ title: "5:30 PM", value: 11 },
					{ title: "6:00 PM", value: 12 },
				],
			},
			{
				type: "ActionSet",
				id: "controls",
				isVisible: true,
				actions: [{ type: "Action.Submit", title: "Submit" }],
			},
		],
		actions: [],
	},
}
