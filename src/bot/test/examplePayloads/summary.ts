export const apiPayload = {
	responses: [
		{
			cardTemplateType: "summary",
			title: "Appointment Summary",
			details: [
				{
					key: "Date",
					value: "2021-09-03",
				},
				{
					key: "Time",
					value: "4:30 PM",
				},
				{
					key: "Doctor",
					value: "McDoctorson",
				},
			],
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
				text: "Appointment Summary",
				size: "Medium",
				wrap: true,
			},
			{
				type: "FactSet",
				facts: [
					{ title: "Date:", value: "2021-09-03" },
					{ title: "Time:", value: "4:30 PM" },
					{ title: "Doctor:", value: "McDoctorson" },
				],
			},
			{
				type: "ActionSet",
				id: "controls",
				isVisible: true,
				actions: [
					{
						type: "Action.Submit",
						title: "Confirm",
						data: { response: "confirm" },
					},
					{
						type: "Action.Submit",
						title: "Cancel",
						data: { response: "cancel" },
					},
				],
			},
		],
		actions: [],
	},
}
