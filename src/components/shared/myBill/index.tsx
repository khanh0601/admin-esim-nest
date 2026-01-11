import React from "react";
import Breadcrumb from "../global/Breakcrum";
import ListBill from "./bill";
export default function BillPage() {
    return (
        <div>
            <Breadcrumb title="My Bill" path={[
                { label: "Home", href: "/" },
                { label: "My Bill"}
            ]} />
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <ListBill />
            </div>
        </div>
    );
}