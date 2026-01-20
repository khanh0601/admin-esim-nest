import React from "react";
import Breadcrumb from "../global/Breakcrum";
import MyQuotation from "./myquotation";
export default function Notice() {
    return (
        <div>
            <Breadcrumb title="Sản phẩm" path={[
                { label: "Trang chủ", href: "/" },
                { label: "Sản phẩm"}
            ]} />
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <MyQuotation />
            </div>
        </div>
    );
}