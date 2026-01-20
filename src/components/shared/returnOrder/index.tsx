import React from "react";
import Breadcrumb from "../global/Breakcrum";
import ReturnManagementPage from "./listReturn";
export default function ReturnOrderPage() {
    return (
        <div>
            <Breadcrumb title="Đơn hàng trả lại" path={[
                { label: "Trang chủ", href: "/" },
                { label: "Đơn hàng trả lại"}
            ]} />
            <ReturnManagementPage />
        </div>
    );
}