import * as cheerio from "cheerio";
import { DateTime } from "luxon";
import type { VenueEvent } from "../types";

export async function fetchCorsicaStudiosEvents(): Promise<VenueEvent[]> {
  try {
    const response = await fetch(
      "https://www.corsicastudios.com/calendar/corsica-studios",
    );
    const html = await response.text();

    const events: VenueEvent[] = [];
    const $ = cheerio.load(html);

    let nuxtData: any = null;
    $("script").each((_, script) => {
      const content = $(script).html();
      if (content && content.includes("window.__NUXT__")) {
        try {
          const windowObj: any = {};
          const func = new Function(
            "window",
            content + "; return window.__NUXT__;",
          );
          nuxtData = func(windowObj);
        } catch (e) {
          console.error("Failed to extract NUXT data:", e);
        }
      }
    });

    if (!nuxtData) {
      console.error("Could not find __NUXT__ data on Corsica Studios page");
      return [];
    }

    const eventResults = nuxtData?.data?.[0]?.events?.results;
    if (!eventResults || !Array.isArray(eventResults)) {
      console.error("Could not find events in __NUXT__ data");
      return [];
    }

    for (const event of eventResults) {
      try {
        const eventData = event.data;
        const uid = event.uid;

        let title = "";
        if (Array.isArray(eventData.title) && eventData.title.length > 0) {
          title = eventData.title[0].text || "";
        } else if (typeof eventData.title === "string") {
          title = eventData.title;
        }

        const roster = eventData.roster || [];
        let artist = title;
        if (roster.length > 0) {
          const artistNames = roster
            .map((a: any) => {
              if (typeof a === "string") return a;
              if (a.artist?.data?.title?.[0]?.text)
                return a.artist.data.title[0].text;
              if (a.name) return a.name;
              return null;
            })
            .filter((n: any) => n);
          if (artistNames.length > 0) {
            artist = artistNames.join(", ");
          }
        }

        if (!artist) continue;

        const eventStart = eventData.event_start;
        if (!eventStart) continue;

        const showTime = DateTime.fromISO(eventStart, { zone: "UTC" }).setZone(
          "Europe/London",
        );
        if (!showTime.isValid) continue;

        const thumbnailUrl = eventData.poster?.url || null;

        events.push({
          venue: "Corsica Studios",
          artist,
          opener: null,
          tour: null,
          showTime: showTime.toJSDate(),
          thumbnailUrl,
          url: `https://www.corsicastudios.com/${uid}`,
        });
      } catch (err) {
        console.error("Error parsing event:", err);
      }
    }

    console.log(`Fetched ${events.length} events from Corsica Studios`);
    return events;
  } catch (error) {
    console.error("Failed to fetch Corsica Studios events:", error);
    return [];
  }
}
