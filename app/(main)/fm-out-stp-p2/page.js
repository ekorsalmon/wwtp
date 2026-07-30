import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function FmOutStpP2Page() {
  return (
    <MeterPageContent
      title="FM Out STP (P2)"
      description="Pencatatan flowmeter outlet air limbah STP — WWTP Plant 2."
      meterKeys={['fm_out_stp_p2']}
    />
  )
}
