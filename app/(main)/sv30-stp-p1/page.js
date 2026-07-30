import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function Sv30StpP1Page() {
  return (
    <MeterPageContent
      title="SV30 STP (P1)"
      description="Pencatatan SV30 (sludge volume 30 menit) STP — WWTP Plant 1."
      meterKeys={['sv30_stp']}
    />
  )
}
