export const apiPayload = {
	responses: [
		{
			cardTemplateType: "text",
			text: `Your appointment has been confirmed!`,
			subtext: "card will not show due to showSubtext=false",
			showSubtext: false,
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
				text: "Your appointment has been confirmed!",
				wrap: true,
				size: "Medium",
			},
			{
				type: "TextBlock",
				text: "*card will not show due to showSubtext=false*",
				wrap: true,
				size: "default",
				weight: "lighter",
				isVisible: false,
			},
		],
	},
}
