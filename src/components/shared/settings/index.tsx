import React from "react";
import Breadcrumb from "../global/Breakcrum";
import FormSetting from "./form";
export default function SettingPage() {
    return (
        <div>
            <Breadcrumb title="Cài đặt" path={[
                { label: "Trang chủ", href: "/admin/notice" },
                { label: "Cài đặt"}
            ]} />
            <div className="mt-6">
                <FormSetting />
            </div>
        </div>
    );
}