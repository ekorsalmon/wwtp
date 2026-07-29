import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function AbtPage() {
  return (
    <MeterPageContent
      title="ABT"
      description="Pencatatan flow meter ABT, MESS, dan Pos Security. Dibaca harian."
      meterKeys={['abt1', 'abt2', 'abt4', 'mess1', 'mess2', 'pos_security']}
    />
  )
}
