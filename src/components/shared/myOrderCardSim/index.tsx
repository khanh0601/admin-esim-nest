import React from "react";
import Breadcrumb from "../global/Breakcrum";
import OrderListCardSim from "./orderListCardSim";

export default function OrderCardSimPage() {
    return (
        <div>
            <Breadcrumb title="My Order Card SIM" path={[
                { label: "Home", href: "/" },
                { label: "My Order Card SIM"}
            ]} />
            <OrderListCardSim />
        </div>
    );
}

