import React from "react";
import Breadcrumb from "../global/Breakcrum";
import MyQuotation from "./myquotation";
export default function Notice() {
    return (
        <div>
            <Breadcrumb title="My Quotation" path={[
                { label: "Home", href: "/" },
                { label: "My Quotation"}
            ]} />
            <MyQuotation />
        </div>
    );
}