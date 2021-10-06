export const apiPayload = {
	responses: [
		{
			cardTemplateType: "optionButtons",
			text: "Great! Please choose your doctor.",
			choices: [
				{
					title: "Frankenstein",
					value: 0,
				},
				{
					title: "Strange",
					value: 1,
				},
				{
					title: "Strangelove",
					value: 2,
				},
				{
					title: "Doolittle",
					value: 3,
				},
				{
					title: "Who",
					value: 4,
				},
				{
					title: "McDoctorson",
					value: 5,
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
				text: "Great! Please choose your doctor.",
				wrap: true,
			},
			{
				type: "ActionSet",
				id: "controls",
				isVisible: true,
				actions: [
					{
						type: "Action.Submit",
						title: "Frankenstein",
						data: { response: 0 },
					},
					{ type: "Action.Submit", title: "Strange", data: { response: 1 } },
					{
						type: "Action.Submit",
						title: "Strangelove",
						data: { response: 2 },
					},
					{ type: "Action.Submit", title: "Doolittle", data: { response: 3 } },
					{ type: "Action.Submit", title: "Who", data: { response: 4 } },
					{
						type: "Action.Submit",
						title: "McDoctorson",
						data: { response: 5 },
					},
				],
			},
		],
		actions: [],
	},
}
