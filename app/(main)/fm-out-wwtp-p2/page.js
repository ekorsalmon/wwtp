import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function FmOutWwtpP2Page() {
  return (
    <MeterPageContent
      title="FM Out WWTP (P2)"
      description="Pencatatan flowmeter outlet air limbah WWTP — WWTP Plant 2."
      meterKeys={['fm_out_wwtp_p2']}
    />
  )
}
