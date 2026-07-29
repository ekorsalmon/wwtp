import MeterPageContent from '@/components/MeterPageContent'

export default function Sv30StpPage() {
  return (
    <MeterPageContent
      title="SV30 STP"
      description="Pencatatan SV30 (sludge volume 30 menit) STP, Plant 1 dan Plant 2."
      meterKeys={['sv30_stp', 'sv30_stp_p2']}
    />
  )
}
