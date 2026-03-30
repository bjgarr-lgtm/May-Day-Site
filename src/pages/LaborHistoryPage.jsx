import LaborArchiveRoot from "../components/LaborArchiveRoot";
import data from "../archive/laborArchiveData";

export default function LaborHistoryPage() {
  return <LaborArchiveRoot collections={data} />;
}