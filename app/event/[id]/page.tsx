export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Event: {params.id}</h2>
      <p>Prediction form will go here.</p>
    </div>
  )
}
