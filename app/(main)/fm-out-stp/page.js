import MeterPageContent from '@/components/MeterPageContent'

export default function FmOutStpPage() {
  return (
    <MeterPageContent
      title="FM Out STP"
      description="Pencatatan flowmeter outlet air limbah STP, Plant 1 dan Plant 2."
      meterKeys={['fm_out_stp', 'fm_out_stp_p2']}
    />
  )
}
