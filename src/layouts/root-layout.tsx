import Header from "@/components/shared/header";
import SidebarLeft from "@/components/shared/sidebarleft";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className=" bg-gray-100 min-h-[calc(100vh-4.75rem)]">
            <Header />
            <div className="flex wrapper h-full mt-19 ">
                <SidebarLeft />
                <main className="wrapper flex-1 px-14 overflow-hidden pb-10 ">{children}</main>
            </div>
        </div>
    );
}
