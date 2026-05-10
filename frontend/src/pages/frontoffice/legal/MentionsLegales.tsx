import { useTranslation } from 'react-i18next'
import LegalLayout from './LegalLayout'
import Section from '@/components/legal/Section'
import Accent from '@/components/legal/Accent'
import LegalFooter from '@/components/legal/LegalFooter'

export default function MentionsLegales() {
  const { t } = useTranslation()
  const s = (key: string) => t(`legal.mentions.${key}`)
  const fields1 = t('legal.mentions.s1.fields', { returnObjects: true }) as { label: string; value: string }[]
  const fields2 = t('legal.mentions.s2.fields', { returnObjects: true }) as { label: string; value: string }[]

  return (
    <LegalLayout title={s('title')}>
      <Section title={s('s1.title')}>
        <div
          className="rounded-xl border border-white/10 p-6"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields1.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">{label}</p>
                <p className="text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title={s('s2.title')}>
        <div
          className="rounded-xl border border-white/10 p-6"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields2.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">{label}</p>
                <p className="text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title={s('s3.title')}>
        <p>{s('s3.p1')}</p>
        <p>{s('s3.p2')}</p>
        <p>{s('s3.p3')}</p>
      </Section>

      <Section title={s('s4.title')}>
        <p>{s('s4.p1')}</p>
        <p>{s('s4.p2')}</p>
        <p>{s('s4.p3')}</p>
        <p>{s('s4.p4')}</p>
      </Section>

      <Section title={s('s5.title')}>
        <p>{s('s5.p1')}</p>
      </Section>

      <Section title={s('s6.title')}>
        <p>{s('s6.p1')}</p>
      </Section>

      <Section title={s('s7.title')}>
        <p>{s('s7.p1')}</p>
        <p>{s('s7.p2')}</p>
      </Section>

      <Section title={s('s8.title')}>
        <p>{s('s8.p1')}</p>
      </Section>

      <Section title={s('s9.title')}>
        <div
          className="rounded-xl border border-white/10 p-5 space-y-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <p><span className="text-white/40">{s('s9.general')}</span>{' '}<Accent>{t('legal.contactEmail')}</Accent></p>
          <p><span className="text-white/40">{s('s9.privacy')}</span>{' '}<Accent>{t('legal.privacyEmail')}</Accent></p>
          <p><span className="text-white/40">{s('s9.address')}</span>{' '}<span className="text-white">{s('s9.addressValue')}</span></p>
        </div>
      </Section>

      <LegalFooter>{s('footerNote')}</LegalFooter>
    </LegalLayout>
  )
}
