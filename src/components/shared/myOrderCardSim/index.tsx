import React from "react";
import Breadcrumb from "../global/Breakcrum";
import OrderListCardSim from "./orderListCardSim";

export default function OrderCardSimPage() {
    return (
        <div>
            <Breadcrumb title="Đơn hàng Card SIM" path={[
                { label: "Trang chủ", href: "/" },
                { label: "Đơn hàng Card SIM"}
            ]} />
            <OrderListCardSim />
        </div>
    );
}

