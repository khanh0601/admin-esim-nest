import React from "react";
import Breadcrumb from "../global/Breakcrum";
import Content from "./content";
export default function Notice() {
    return (
        <div>
            <Breadcrumb title="Thông báo quan trọng" path={[
                { label: "Trang chủ", href: "/" },
                { label: "Thông báo quan trọng"}
            ]} />
            <Content />
        </div>
    );
}