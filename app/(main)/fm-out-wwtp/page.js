import MeterPageContent from '@/components/MeterPageContent'

export default function FmOutWwtpPage() {
  return (
    <MeterPageContent
      title="FM Out WWTP"
      description="Pencatatan flowmeter outlet air limbah WWTP."
      meterKeys={['fm_out_wwtp']}
    />
  )
}
