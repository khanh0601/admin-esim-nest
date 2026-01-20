import React from "react";
import Breadcrumb from "../global/Breakcrum";
import OrderList from "./orderList";
export default function OrderPage() {
    return (
        <div>
            <Breadcrumb title="Đơn hàng eSIM" path={[
                { label: "Trang chủ", href: "/" },
                { label: "Đơn hàng eSIM"}
            ]} />
            <OrderList />
        </div>
    );
}