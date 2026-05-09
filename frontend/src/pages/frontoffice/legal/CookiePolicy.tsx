import { useTranslation } from 'react-i18next'
import LegalLayout from './LegalLayout'
import Section from '@/components/legal/Section'
import BulletList from '@/components/legal/BulletList'
import Accent from '@/components/legal/Accent'
import LegalFooter from '@/components/legal/LegalFooter'
import CookieCard from '@/components/legal/CookieCard'

export default function CookiePolicy() {
  const { t } = useTranslation()
  const s = (key: string) => t(`legal.cookies.${key}`)
  const arr = (key: string) => t(`legal.cookies.${key}`, { returnObjects: true }) as string[]
  const thirdPartyRows = t('legal.cookies.s3.rows', { returnObjects: true }) as { name: string; purpose: string; policy: string }[]

  return (
    <LegalLayout title={s('title')}>
      <Section title={s('s1.title')}>
        <p>{s('s1.p1')}</p>
        <p>{s('s1.p2')}</p>
      </Section>

      <Section title={s('s2.title')}>
        <div className="space-y-4">
          <CookieCard color="bg-green-400" title={s('s2.necessary.title')} badge={s('s2.necessary.badge')}>
            <p>{s('s2.necessary.p1')}</p>
            <BulletList items={arr('s2.necessary.items')} />
            <p className="text-white/40 text-sm">{s('s2.necessary.duration')}</p>
          </CookieCard>

          <CookieCard color="bg-[#7b61ff]" title={s('s2.functional.title')} badge={s('s2.functional.badge')}>
            <p>{s('s2.functional.p1')}</p>
            <BulletList items={arr('s2.functional.items')} />
            <p className="text-white/40 text-sm">{s('s2.functional.duration')}</p>
          </CookieCard>
        </div>
      </Section>

      <Section title={s('s3.title')}>
        <p>{s('s3.p1')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/15">
                <th className="text-left py-3 pr-4 font-semibold text-white">{s('s3.colName')}</th>
                <th className="text-left py-3 pr-4 font-semibold text-white">{s('s3.colPurpose')}</th>
                <th className="text-left py-3 font-semibold text-white">{s('s3.colPolicy')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {thirdPartyRows.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4 text-white">{row.name}</td>
                  <td className="py-3 pr-4 text-white/70">{row.purpose}</td>
                  <td className="py-3 text-[#7b61ff]">{row.policy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={s('s4.title')}>
        <p>{s('s4.p1')}</p>
        <p>{s('s4.p2')}</p>
        <BulletList items={arr('s4.browsers')} />
        <p>{s('s4.p3')}</p>
      </Section>

      <Section title={s('s5.title')}>
        <p>{s('s5.p1')}</p>
      </Section>

      <Section title={s('s6.title')}>
        <p>{s('s6.p1')}</p>
      </Section>

      <Section title={s('s7.title')}>
        <p>{s('s7.p1')} <Accent>{t('legal.privacyEmail')}</Accent></p>
      </Section>

      <LegalFooter>{s('footerNote')}</LegalFooter>
    </LegalLayout>
  )
}
