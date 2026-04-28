export default function CookieCard({
  color,
  title,
  badge,
  children,
}: {
  color: string
  title: string
  badge: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="ml-auto text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{badge}</span>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  )
}
