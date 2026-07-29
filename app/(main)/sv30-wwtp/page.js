import MeterPageContent from '@/components/MeterPageContent'

export const dynamic = 'force-dynamic'

export default function Sv30WwtpPage() {
  return (
    <MeterPageContent
      title="SV30 WWTP"
      description="Pencatatan SV30 (sludge volume 30 menit) WWTP, Plant 1 dan Plant 2."
      meterKeys={['sv30_wwtp', 'sv30_wwtp_p2']}
    />
  )
}
