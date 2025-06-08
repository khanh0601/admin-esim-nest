import Link from "next/link";
import Image from "next/image";
const Header = () => {
    return (
        <header className="w-full bg-white  shadow-md z-10 py-4 bg-white-900 px-8 fixed top-0 left-0">
            <div className="wrapper flex-between relative">
                <div className="flex-start">
                    <Link href="/" className="flex-start me-8 w-36 flex">
                        <Image src={"/esim-nest-logo.svg"} width={100} height={100} alt="logo" className="w-full"/>
                    </Link>
                </div>
                
            </div>
        </header>
    );
};

export default Header;
