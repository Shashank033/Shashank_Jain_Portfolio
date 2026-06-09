/**
 * @author Shashank Jain
 * @date 2025-05-10
 * @description This hook provides methods to interact with external APIs.
 */
 
import emailjs from "@emailjs/browser"
import {useConstants} from "/src/hooks/constants.js"
import {useUtils} from "/src/hooks/utils.js"
 
const constants = useConstants()
const utils = useUtils()
 
export const useApi = () => {
    return {
        validators,
        handlers,
        analytics
    }
}
 
const validators = {
    /**
     * @param {String} name
     * @param {String} email
     * @param {String} subject
     * @param {String} message
     */
    validateEmailRequest: (name, email, subject, message) => {
        const minWordCountForMessage = 3
 
        const validations = [
            { errorCode: constants.ErrorCodes.VALIDATION_EMPTY_FIELDS,      errorCondition: !name || !email || !subject || !message },
            { errorCode: constants.ErrorCodes.VALIDATION_EMAIL,             errorCondition: !utils.validation.validateEmail(email) },
            { errorCode: constants.ErrorCodes.VALIDATION_MESSAGE_LENGTH,    errorCondition: !utils.validation.isLongerThan(message, minWordCountForMessage),    messageParameter: minWordCountForMessage + 1},
            { errorCode: constants.ErrorCodes.VALIDATION_MESSAGE_SPAM,      errorCondition: utils.validation.isSpam(message) },
        ]
 
        const error = validations.find(validation => validation.errorCondition)
        return {
            success: !error,
            errorCode: error?.errorCode,
            errorParameter: error?.messageParameter,
            bundle: {
                name: name,
                from_name: name,
                email: email,
                from_email: email,
                custom_subject: subject,
                message: message,
                custom_source: utils.url.getAbsoluteLocation(),
                custom_source_name: "React Portfolio"
            }
        }
    }
}
 
const handlers = {
    /**
     * @return {Promise<{success: (*|boolean)}>}
     */
    dummyRequest: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700))
        window._dummyRequestSuccess = !window._dummyRequestSuccess
 
        return {
            success: window._dummyRequestSuccess
        }
    },
 
    /**
     * @param {Object} validationBundle
     * @param {String} publicKey
     * @param {String} serviceId
     * @param {String} templateId
     * @return {Promise<{success: boolean}>}
     */
    sendEmailRequest: async (validationBundle, publicKey, serviceId, templateId) => {
        emailjs.init(publicKey)
 
        const response = {success: false}
 
        try {
            const result = await emailjs.send(serviceId, templateId, validationBundle)
            response.success = result.status === 200
        } catch (error) {
            response.success = false
        }
 
        return response
    }
}
 
const analytics = {
    /**
     * @description Reports a visit using Google Analytics GA4 (gtag.js).
     * Measurement ID: G-W58CZNY26X
     * @returns {Promise<void>}
     */
    reportVisit: async() => {
        const GA_MEASUREMENT_ID = "G-W58CZNY26X"
 
        // Inject gtag.js script if not already loaded
        if (!window.gtag) {
            await new Promise((resolve) => {
                const script = document.createElement("script")
                script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
                script.async = true
                script.onload = resolve
                document.head.appendChild(script)
            })
 
            window.dataLayer = window.dataLayer || []
            window.gtag = function() { window.dataLayer.push(arguments) }
            window.gtag("js", new Date())
            window.gtag("config", GA_MEASUREMENT_ID)
        }
 
        // Report page visit
        window.gtag("event", "page_view", {
            page_location: utils.url.getAbsoluteLocation(),
            page_title: document.title
        })
    }
}