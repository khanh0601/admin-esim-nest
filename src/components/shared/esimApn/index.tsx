// app/(admin)/excel-preview/page.tsx
import ExcelViewer from "./ExcelViewer";
import Breadcrumb from "../global/Breakcrum";
export default function EsimApnPage() {
  return (
    <div>
      <Breadcrumb title="ESIM APN" path={[
              { label: "Home", href: "/" },
              { label: "ESIM APN"}
          ]} />
      <ExcelViewer
        fileUrl="https://sim-nest.com/wp-content/uploads/2025/06/esim_data.xlsx"
        fileName="esim-apn"
      />
    </div>
  );
}
