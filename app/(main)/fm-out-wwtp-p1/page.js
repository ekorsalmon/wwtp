import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function FmOutWwtpP1Page() {
  return (
    <MeterPageContent
      title="FM Out WWTP (P1)"
      description="Pencatatan flowmeter outlet air limbah WWTP — WWTP Plant 1."
      meterKeys={['fm_out_wwtp']}
    />
  )
}
