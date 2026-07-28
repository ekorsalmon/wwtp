import MeterPageContent from '@/components/MeterPageContent'

export default function Sv30WwtpPage() {
  return (
    <MeterPageContent
      title="SV30 WWTP"
      description="Pencatatan SV30 (sludge volume 30 menit) WWTP."
      meterKeys={['sv30_wwtp']}
    />
  )
}
