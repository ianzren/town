import * as cheerio from 'cheerio'
import { DateTime } from 'luxon'
import type { VenueEvent } from '../types'

export async function fetchVillageUndergroundEvents(): Promise<VenueEvent[]> {
	try {
		const response = await fetch('https://villageunderground.co.uk/events/')
		const html = await response.text()

		const events: VenueEvent[] = []
		const $ = cheerio.load(html)

		const eventItems = $('.list--events li')

		eventItems.each((_, item) => {
			try {
				const $item = $(item)
				const link = $item.find('a')
				const url = link.attr('href')
				const artist = $item.find('.list--events__item__title').text().trim()
				const dateTimeElement = $item.find('time[itemprop="startDate"]')
				const datetime = dateTimeElement.attr('datetime')
				const thumbnailUrl = $item.find('img').attr('src') || null

				if (!artist || !url || !datetime) return

				const showTime = DateTime.fromISO(datetime, { zone: 'Europe/London' })

				if (!showTime.isValid) {
					console.warn('Invalid date format:', datetime)
					return
				}

				events.push({
					venue: 'Village Underground',
					artist,
					opener: null,
					tour: null,
					showTime: showTime.toJSDate(),
					thumbnailUrl,
					url: url.startsWith('http') ? url : `https://villageunderground.co.uk${url}`
				})
			} catch (err) {
				console.error('Error parsing event:', err)
			}
		})

		console.log(`Fetched ${events.length} events from Village Underground`)
		return events
	} catch (error) {
		console.error('Failed to fetch Village Underground events:', error)
		return []
	}
}
