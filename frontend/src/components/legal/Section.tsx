export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-space-grotesk text-xl font-bold text-white">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
