import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function FmInRwtpPage() {
  return (
    <MeterPageContent
      title="FM In RWTP"
      description="Pencatatan flowmeter inlet RWTP."
      meterKeys={['fm_in_rwtp']}
    />
  )
}
