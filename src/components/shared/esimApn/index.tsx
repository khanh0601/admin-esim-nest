// app/(admin)/excel-preview/page.tsx
import ExcelViewer from "./ExcelViewer";
import Breadcrumb from "../global/Breakcrum";
export default function EsimApnPage() {
  return (
    <div>
      <Breadcrumb title="eSIM APN" path={[
              { label: "Trang chủ", href: "/" },
              { label: "eSIM APN"}
          ]} />
      <ExcelViewer
        fileUrl="https://sim-nest.com/wp-content/uploads/2025/06/APN-list-1.xlsx"
        fileName="esim-apn"
      />
    </div>
  );
}
