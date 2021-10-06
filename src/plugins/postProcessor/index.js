/**
 * Following the template transformation, the postProcessor manipulates the adaptiveCard before it is returned to the bot.
 *
 * @param data DiagloadPayload
 * @param template Selected template
 * @param adaptiveCard Populated adaptiveCard (post applying dialogPayload to template)
 * @returns Manipulated adaptiveCard
 */
function postProcess(data, template, adaptiveCard) {
	// manipulate adaptiveCard here

	return adaptiveCard
}
module.exports = postProcess
