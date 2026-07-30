import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function FmOutStpP1Page() {
  return (
    <MeterPageContent
      title="FM Out STP (P1)"
      description="Pencatatan flowmeter outlet air limbah STP — WWTP Plant 1."
      meterKeys={['fm_out_stp']}
    />
  )
}
