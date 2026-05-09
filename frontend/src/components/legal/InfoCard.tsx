export default function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border border-white/10 p-5 space-y-2"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {children}
    </div>
  )
}
