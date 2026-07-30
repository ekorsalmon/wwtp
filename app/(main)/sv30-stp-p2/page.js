import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function Sv30StpP2Page() {
  return (
    <MeterPageContent
      title="SV30 STP (P2)"
      description="Pencatatan SV30 (sludge volume 30 menit) STP — WWTP Plant 2."
      meterKeys={['sv30_stp_p2']}
    />
  )
}
