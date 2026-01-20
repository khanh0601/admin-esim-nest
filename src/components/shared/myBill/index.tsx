import React from "react";
import Breadcrumb from "../global/Breakcrum";
import ListBill from "./bill";
export default function BillPage() {
    return (
        <div>
            <Breadcrumb title="Hóa đơn của tôi" path={[
                { label: "Trang chủ", href: "/" },
                { label: "Hóa đơn của tôi"}
            ]} />
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <ListBill />
            </div>
        </div>
    );
}