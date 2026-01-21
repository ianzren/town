import { JSDOM } from 'jsdom'
import { DateTime } from 'luxon'
import type { VenueEvent } from '../types'

export async function fetchExampleVenueEvents(): Promise<VenueEvent[]> {
	try {
		const response = await fetch('https://example-venue.com/events')
		const html = await response.text()

		const events: VenueEvent[] = []
		const dom = new JSDOM(html)

		for (const entry of dom.window.document.querySelectorAll('.event')) {
			const thumbnailUrl = entry.querySelector('img')?.attributes.getNamedItem('src')?.value || null
			const artist = entry.querySelector('.artist')?.textContent?.trim()
			const url = entry.querySelector('a')?.attributes.getNamedItem('href')?.value
			const dateStr = entry.querySelector('.date')?.textContent?.trim()

			if (!artist || !url || !dateStr) continue

			const showTime = DateTime.fromFormat(
				dateStr,
				'dd MMM yyyy HH:mm',
				{ zone: 'Europe/London' }
			).toJSDate()

			events.push({
				venue: 'Example Venue',
				artist,
				opener: null,
				tour: null,
				showTime,
				thumbnailUrl,
				url
			})
		}

		return events
	} catch (error) {
		console.error('Failed to fetch Example Venue events:', error)
		return []
	}
}
