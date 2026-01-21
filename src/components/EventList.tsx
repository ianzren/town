'use client'

import { useState, useEffect } from 'react'
import { VenueEvent } from '@/lib/types'
import Image from 'next/image'

interface EventListProps {
	initialEvents?: VenueEvent[]
}

export function EventList({ initialEvents = [] }: EventListProps) {
	const [events, setEvents] = useState<VenueEvent[]>(initialEvents)
	const [loading, setLoading] = useState(!initialEvents.length)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await fetch('/api/events')
				if (!response.ok) throw new Error('Failed to fetch events')
				const data = await response.json()
				setEvents(data.events.map((e: any) => ({
					...e,
					showTime: new Date(e.showTime)
				})))
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
			} finally {
				setLoading(false)
			}
		}

		if (!initialEvents.length) {
			fetchEvents()
		}
	}, [initialEvents.length])

	if (loading) {
		return <div className="text-center text-zinc-400">Loading events...</div>
	}

	if (error) {
		return <div className="text-center text-red-400">Error: {error}</div>
	}

	const now = new Date()
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

	const todayEvents = events.filter(e => e.showTime >= todayStart && e.showTime < todayEnd)
	const futureEvents = events.filter(e => e.showTime >= todayEnd)

	return (
		<div className="w-full">
			{todayEvents.length > 0 && (
				<>
					<h2 className="text-xl font-normal text-zinc-400 mb-2.5">Today</h2>
					<div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2.5 mb-10 opacity-70">
						{todayEvents.map((event, i) => (
							<EventCard key={i} event={event} compact />
						))}
					</div>
				</>
			)}

			{futureEvents.length > 0 && (
				<>
					<h2 className="text-xl font-normal text-zinc-400 mb-2.5 mt-10">Upcoming</h2>
					<div className="grid grid-cols-1 gap-2.5">
						{futureEvents.map((event, i) => (
							<EventCard key={i} event={event} />
						))}
					</div>
				</>
			)}

			{events.length === 0 && (
				<div className="text-center text-zinc-400">No upcoming events found</div>
			)}
		</div>
	)
}

interface EventCardProps {
	event: VenueEvent
	compact?: boolean
}

function EventCard({ event, compact = false }: EventCardProps) {
	const formatDate = (date: Date) => {
		const day = date.toLocaleDateString('en-GB', { weekday: 'short' })
		const dateNum = date.getDate()
		const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
		return { day, dateNum, time }
	}

	const { day, dateNum, time } = formatDate(event.showTime)
	const imageSize = compact ? 50 : 80

	return (
		<div className="flex flex-row gap-2.5 items-stretch">
			{event.thumbnailUrl ? (
				<Image
					src={event.thumbnailUrl}
					alt={event.artist}
					width={imageSize}
					height={imageSize}
					className={`rounded-[10px] object-cover opacity-50`}
					style={{ width: imageSize, height: imageSize }}
				/>
			) : (
				<div
					className="rounded-[10px] bg-zinc-800 opacity-50 flex items-center justify-center"
					style={{ width: imageSize, height: imageSize }}
				>
					<span className="text-zinc-600 text-xs">No image</span>
				</div>
			)}

			<a
				href={event.url}
				target="_blank"
				rel="noopener noreferrer"
				className={`flex-[2] p-2 rounded-[10px] flex flex-col no-underline text-zinc-200 hover:bg-[#23272d] transition-colors ${compact ? 'text-sm' : 'text-base'}`}
			>
				<h3 className={`font-bold m-0 -mt-1.5 ${compact ? 'text-sm' : 'text-base'}`}>
					{event.artist}
				</h3>
				{event.opener && (
					<p className={`m-0 ${compact ? 'text-sm' : 'text-base'}`}>
						{event.opener}
					</p>
				)}
				{event.tour && (
					<p className="text-[0.8em] text-zinc-400 m-0 mt-0.5">
						{event.tour}
					</p>
				)}
			</a>

			<div className={`flex-1 flex flex-col text-zinc-400 p-2 ${compact ? 'text-xs' : 'text-sm'}`}>
				<p className="text-lg text-zinc-300 m-0 -mt-1.5">
					{day} {dateNum}
				</p>
				<p className="m-0">{event.venue}</p>
				<p className="m-0">{time}</p>
			</div>
		</div>
	)
}
