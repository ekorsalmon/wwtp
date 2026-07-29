import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function FmOutWwtpPage() {
  return (
    <MeterPageContent
      title="FM Out WWTP"
      description="Pencatatan flowmeter outlet air limbah WWTP, Plant 1 dan Plant 2."
      meterKeys={['fm_out_wwtp', 'fm_out_wwtp_p2']}
    />
  )
}
