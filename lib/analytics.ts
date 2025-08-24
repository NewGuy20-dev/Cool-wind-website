export type AnalyticsEvent = {
	event: string
	params?: Record<string, any>
}

function pushToDataLayer(evt: AnalyticsEvent) {
	if (typeof window === 'undefined') return
	;(window as any).dataLayer = (window as any).dataLayer || []
	;(window as any).dataLayer.push({ event: evt.event, ...evt.params })
}

export const analytics = {
	partsInquiryClick() {
		pushToDataLayer({ event: 'parts_inquiry_click', params: { event_category: 'parts_business', event_label: 'parts_quote_request', value: 1 } })
	},
	serviceBookingClick() {
		pushToDataLayer({ event: 'service_booking_click', params: { event_category: 'service_business', event_label: 'repair_booking', value: 1 } })
	},
	phoneCallClick(label = 'header_phone') {
		pushToDataLayer({ event: 'phone_call_click', params: { event_category: 'contact', event_label: label, value: 1 } })
	},
	whatsappClick(label = 'floating_whatsapp') {
		pushToDataLayer({ event: 'whatsapp_click', params: { event_category: 'contact', event_label: label, value: 1 } })
	},
	formSubmission(formType: string, isUrgent: boolean) {
		pushToDataLayer({ event: 'form_submission', params: { event_category: 'lead_generation', event_label: 'contact_form', form_type: formType, is_urgent: isUrgent } })
	},
	quoteRequestClick(label = 'floating_quote') {
		pushToDataLayer({ event: 'quote_request_click', params: { event_category: 'quote_business', event_label: label, value: 1 } })
	},
}