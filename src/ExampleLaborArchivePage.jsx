import LaborArchiveRoot from "./components/LaborArchiveRoot";
import laborArchiveData from "./archive/laborArchiveData.example";

export default function ExampleLaborArchivePage() {
  return (
    <LaborArchiveRoot
      title="The Labor History of the Harbor"
      subtitle="Flipbook browsing, search, and full reader mode for a scanned labor history archive."
      collections={laborArchiveData}
    />
  );
}
