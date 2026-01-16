import React from "react";
import Breadcrumb from "../global/Breakcrum";
import OrderList from "./orderList";
export default function OrderPage() {
    return (
        <div>
            <Breadcrumb title="My Order" path={[
                { label: "Home", href: "/" },
                { label: "My Order Esim"}
            ]} />
            <OrderList />
        </div>
    );
}