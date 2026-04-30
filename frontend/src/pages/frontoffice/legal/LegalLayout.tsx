import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      style={{ background: 'radial-gradient(circle, #1A164B 0%, #0E0B37 37%, #04021D 63%, #000005 100%)' }}
      className="min-h-screen"
    >
      <div
        style={{ background: 'linear-gradient(to right, #0B0925 0%, #29228B 40%, #0B0925 100%)' }}
        className="relative py-16 px-6 border-b border-white/10"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-white/40 hover:text-white/80 transition-colors duration-150"
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7b61ff] mb-3">
            {t('legal.tag')}
          </p>
          <h1 className="font-space-grotesk text-4xl font-black text-white">{title}</h1>
          <p className="mt-3 text-white/50 text-sm">
            {t('legal.lastUpdate', { date: t('legal.updateDate') })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14 space-y-12 text-white/75 text-[15px] leading-relaxed">
        {children}
      </div>
    </div>
  )
}
