import Link from "next/link";

function Footer() {

    const icp_moe = "https://icp.gov.moe/?keyword=20229994";

    return (
        <footer className="bg-gray-900 text-white p-4">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} MFJip. All rights reserved.</p>
                <p><Link href={icp_moe} className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">萌ICP备20229994号</Link></p>
            </div>
        </footer>
    )
};

export default Footer;

