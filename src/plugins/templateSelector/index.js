"use strict"

const fs = require("fs").promises
const path = require("path")
const config = require("./templateConfig.json")

/**
 * Determines which adaptive card template to use, given the dialogPayload
 * Function looks for cardTemplateType field from the dialogPayload to detemine the return template
 *
 * @param dialogPayload Data payload which will be used to transform the adaptive card
 * @returns Adaptive Card Template
 */
async function templateSelector(dialogPayload) {
	if (dialogPayload.cardTemplateType in config) {
		const file = await fs.readFile(
			path.join(__dirname, config[dialogPayload.cardTemplateType]),
			"utf8",
		)
		const template = JSON.parse(file)
		return template
	} else {
		throw new Error(
			`No template of type \"${dialogPayload.cardTemplateType}\" found`,
		)
	}
}

module.exports = templateSelector
