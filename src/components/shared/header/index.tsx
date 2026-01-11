"use client";

import Link from "next/link";
import Image from "next/image";
import UserDropdown from "./UserDropdown";
import { useAuthStore } from "@/lib/stores";

const Header = () => {
    const { isAuthenticated } = useAuthStore();
    
    return (
        <header className="w-full bg-white shadow-md z-10 py-4 bg-white-900 px-8 fixed top-0 left-0">
            <div className="wrapper flex justify-between items-center relative">
                <div>
                    <Link href="/" className="flex items-center me-8 w-36">
                        <Image src={"/esim-nest-logo.svg"} width={100} height={100} alt="logo" className="w-full"/>
                    </Link>
                </div>
                
                {isAuthenticated && (
                    <div className="flex items-center">
                        <UserDropdown />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
