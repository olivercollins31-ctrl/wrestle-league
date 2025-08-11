import { supabase } from '@/lib/supabaseClient';

export default async function Dashboard() {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      {events && events.length > 0 ? (
        <ul>
          {events.map((event) => (
            <li key={event.id} className="mb-2">
              <a href={`/event/${event.id}`} className="text-blue-500 underline">
                {event.name} - {new Date(event.event_date).toLocaleDateString()}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming events.</p>
      )}
    </div>
  );
}
