import type { VenueEvent } from "./types";
import { fetchVillageUndergroundEvents } from "./sources/village-underground";
import { fetchCorsicaStudiosEvents } from "./sources/corsica-studios";

export async function fetchAllEvents(): Promise<VenueEvent[]> {
  const allVenues = await Promise.all([
    fetchVillageUndergroundEvents(),
    fetchCorsicaStudiosEvents(),
  ]);
  const orderedEvents = allVenues
    .flat()
    .toSorted((a, b) => a.showTime.getTime() - b.showTime.getTime());

  for (let i = 1; i < orderedEvents.length; i++) {
    const [prev, current] = [orderedEvents[i - 1], orderedEvents[i]];
    if (
      prev.venue === current.venue &&
      prev.showTime.getTime() === current.showTime.getTime() &&
      (prev.artist.includes(current.artist) ||
        current.artist.includes(prev.artist))
    ) {
      orderedEvents.splice(i, 1);
      i--;
    }
  }

  return orderedEvents;
}
