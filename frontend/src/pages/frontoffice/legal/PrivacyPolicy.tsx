import { useTranslation } from 'react-i18next'
import LegalLayout from './LegalLayout'
import Section from '@/components/legal/Section'
import BulletList from '@/components/legal/BulletList'
import InfoCard from '@/components/legal/InfoCard'
import Accent from '@/components/legal/Accent'
import LegalFooter from '@/components/legal/LegalFooter'

export default function PrivacyPolicy() {
  const { t } = useTranslation()
  const s = (key: string) => t(`legal.privacy.${key}`)
  const arr = (key: string) => t(`legal.privacy.${key}`, { returnObjects: true }) as string[]
  const rows = t('legal.privacy.s4.rows', { returnObjects: true }) as { purpose: string; basis: string }[]

  return (
    <LegalLayout title={s('title')}>
      <Section title={s('s1.title')}>
        <p>{s('s1.p1')}</p>
        <p>{s('s1.p2')}</p>
      </Section>

      <Section title={s('s2.title')}>
        <p>{s('s2.p1')}</p>
        <p>{s('s2.p2')}</p>
        <p className="text-white/50 italic text-sm">{s('s2.dpo')}</p>
      </Section>

      <Section title={s('s3.title')}>
        <p>{s('s3.intro')}</p>
        <div className="space-y-4">
          {(['id', 'address', 'order', 'auth', 'logs'] as const).map((key) => (
            <InfoCard key={key}>
              <h3 className="font-semibold text-white">{s(`s3.${key}.title`)}</h3>
              <p>{s(`s3.${key}.content`)}</p>
            </InfoCard>
          ))}
        </div>
      </Section>

      <Section title={s('s4.title')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/15">
                <th className="text-left py-3 pr-6 font-semibold text-white">{s('s4.colPurpose')}</th>
                <th className="text-left py-3 font-semibold text-white">{s('s4.colBasis')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 pr-6 text-white/70">{row.purpose}</td>
                  <td className="py-3 text-[#7b61ff]">{row.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={s('s5.title')}>
        <p>{s('s5.intro')}</p>
        <BulletList items={arr('s5.items')} />
      </Section>

      <Section title={s('s6.title')}>
        <p>{s('s6.intro')}</p>
        <BulletList items={arr('s6.items')} />
        <p>{s('s6.p1')}</p>
      </Section>

      <Section title={s('s7.title')}>
        <p>{s('s7.intro')}</p>
        <BulletList items={arr('s7.items')} />
        <p>{s('s7.p1')}</p>
      </Section>

      <Section title={s('s8.title')}>
        <p>{s('s8.p1')}</p>
        <p>{s('s8.p2')}</p>
      </Section>

      <Section title={s('s9.title')}>
        <p>{s('s9.p1')}</p>
      </Section>

      <Section title={s('s10.title')}>
        <p>{s('s10.p1')}</p>
      </Section>

      <LegalFooter>
        {s('footerNote')} <Accent>{t('legal.privacyEmail')}</Accent>
      </LegalFooter>
    </LegalLayout>
  )
}
