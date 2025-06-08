import React from "react";
import Breadcrumb from "../global/Breakcrum";
import FormSetting from "./form";
export default function SettingPage() {
    return (
        <div>
            <Breadcrumb title="Settings" path={[
                { label: "Home", href: "/" },
                { label: "Settings"}
            ]} />
            <FormSetting />
        </div>
    );
}