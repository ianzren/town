import { EventList } from "@/components/EventList";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#171b1f] text-[#dee2e6]">
      <main className="max-w-[1200px] mx-auto px-2.5 py-5 leading-normal">
        <h1 className="text-[#ff2f78] font-bold text-5xl text-center m-0">
          Gigs in Town
        </h1>
        <p className="text-center text-xl text-zinc-400 m-0 mb-5">
          Local shows around London
        </p>

        <EventList />
      </main>
    </div>
  );
}
