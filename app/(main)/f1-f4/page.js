import MeterPageContent from '@/components/MeterPageContent'

export default function F1F4Page() {
  return (
    <MeterPageContent
      title="F1 & F4"
      description="Pencatatan flow meter toilet, air minum, cuci sikat, dan kantin area F4 & P1. Dibaca harian."
      meterKeys={[
        'f4_toilet1',
        'f4_toilet2',
        'f4_air_minum',
        'f4_cuci_sikat',
        'p1_air_minum',
        'p1_toilet',
        'p1_cuci_sikat',
        'p1_kantin1',
        'p1_kantin5',
      ]}
    />
  )
}
