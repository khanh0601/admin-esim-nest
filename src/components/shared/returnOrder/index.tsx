import React from "react";
import Breadcrumb from "../global/Breakcrum";
import ReturnManagementPage from "./listReturn";
export default function ReturnOrderPage() {
    return (
        <div>
            <Breadcrumb title="Return Order" path={[
                { label: "Home", href: "/" },
                { label: "Return Order"}
            ]} />
            <ReturnManagementPage />
        </div>
    );
}