import MeterPageContent from '@/components/MeterPageContent'

export default function AbtPage() {
  return (
    <MeterPageContent
      title="ABT"
      description="Pencatatan flow meter ABT, MESS, dan Pos Security. Dibaca harian."
      meterKeys={['abt1', 'abt2', 'abt4', 'mess1', 'mess2', 'pos_security']}
    />
  )
}
