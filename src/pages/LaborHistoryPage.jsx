import LaborArchiveRoot from '../components/LaborArchiveRoot'
import laborArchiveData from '../archive/laborArchiveData'

export default function LaborHistoryPage() {
  return (
    <LaborArchiveRoot
      title="The Labor History of the Harbor"
      subtitle="Scanned newspapers, strike history, labor violence, and regional working class memory."
      collections={laborArchiveData}
    />
  )
}
