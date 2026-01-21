import { NextResponse } from "next/server";
import { fetchAllEvents } from "@/lib/aggregate";

let cachedEvents: Awaited<ReturnType<typeof fetchAllEvents>> = [];
let lastFetch: number = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = Date.now();

    if (now - lastFetch > CACHE_DURATION || cachedEvents.length === 0) {
      console.log("Fetching new events...");
      cachedEvents = await fetchAllEvents();
      lastFetch = now;
    }

    const upcomingEvents = cachedEvents.filter(
      (event) => event.showTime.getTime() - now > 60 * 60 * 1000,
    );

    return NextResponse.json({
      events: upcomingEvents,
      lastUpdated: lastFetch,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
