import { useTranslation } from 'react-i18next'
import LegalLayout from './LegalLayout'
import Section from '@/components/legal/Section'
import BulletList from '@/components/legal/BulletList'
import Accent from '@/components/legal/Accent'
import LegalFooter from '@/components/legal/LegalFooter'

export default function CGV() {
  const { t } = useTranslation()
  const s = (key: string) => t(`legal.cgv.${key}`)
  const arr = (key: string) => t(`legal.cgv.${key}`, { returnObjects: true }) as string[]

  return (
    <LegalLayout title={s('title')}>
      <Section title={s('s1.title')}>
        <p>{s('s1.p1')}</p>
        <p>{s('s1.p2')}</p>
      </Section>

      <Section title={s('s2.title')}>
        <p>{s('s2.p1')}</p>
        <p>{s('s2.p2')}</p>
      </Section>

      <Section title={s('s3.title')}>
        <p>{s('s3.p1')}</p>
        <p>{s('s3.p2')}</p>
      </Section>

      <Section title={s('s4.title')}>
        <p>{s('s4.intro')}</p>
        <BulletList items={arr('s4.items')} />
        <p>{s('s4.p1')}</p>
      </Section>

      <Section title={s('s5.title')}>
        <p>{s('s5.p1')}</p>
        <p>{s('s5.p2')}</p>
      </Section>

      <Section title={s('s6.title')}>
        <p>{s('s6.p1')}</p>
        <p>{s('s6.p2')}</p>
      </Section>

      <Section title={s('s7.title')}>
        <p>{s('s7.p1')}</p>
        <p>{s('s7.p2')}</p>
        <p>{s('s7.p3')}</p>
      </Section>

      <Section title={s('s8.title')}>
        <p>{s('s8.p1')}</p>
        <p>{s('s8.p2')}</p>
      </Section>

      <Section title={s('s9.title')}>
        <p>{s('s9.p1')}</p>
        <p>{s('s9.p2')}</p>
      </Section>

      <Section title={s('s10.title')}>
        <p>{s('s10.p1')}</p>
        <p>{s('s10.p2')}</p>
      </Section>

      <Section title={s('s11.title')}>
        <p>{s('s11.p1')}</p>
      </Section>

      <Section title={s('s12.title')}>
        <p>{s('s12.p1')}</p>
        <p>{s('s12.p2')}</p>
      </Section>

      <Section title={s('s13.title')}>
        <p>{s('s13.p1')}</p>
      </Section>

      <LegalFooter>
        {s('footerNote')} <Accent>{t('legal.contactEmail')}</Accent>
      </LegalFooter>
    </LegalLayout>
  )
}
