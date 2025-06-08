import React from "react";
import Breadcrumb from "../global/Breakcrum";
import Content from "./content";
export default function Notice() {
    return (
        <div>
            <Breadcrumb title="Important Notice" path={[
                { label: "Home", href: "/" },
                { label: "Important Notice"}
            ]} />
            <Content />
        </div>
    );
}