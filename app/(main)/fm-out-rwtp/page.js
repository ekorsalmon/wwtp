import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function FmOutRwtpPage() {
  return (
    <MeterPageContent
      title="FM Out RWTP"
      description="Pencatatan flowmeter outlet RWTP."
      meterKeys={['fm_out_rwtp']}
    />
  )
}
