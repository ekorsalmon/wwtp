import MeterPageContent from '@/components/MeterPageContent'

export default function Sv30StpPage() {
  return (
    <MeterPageContent
      title="SV30 STP"
      description="Pencatatan SV30 (sludge volume 30 menit) STP."
      meterKeys={['sv30_stp']}
    />
  )
}
