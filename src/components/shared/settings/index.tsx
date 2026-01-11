import React from "react";
import Breadcrumb from "../global/Breakcrum";
import FormSetting from "./form";
export default function SettingPage() {
    return (
        <div>
            <Breadcrumb title="Settings" path={[
                { label: "Home", href: "/admin/notice" },
                { label: "Settings"}
            ]} />
            <div className="mt-6">
                <FormSetting />
            </div>
        </div>
    );
}