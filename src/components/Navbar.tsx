import Link from "next/link";

export default function Navbar() {
    const links = [
        {
            name: "Home",
            href: "/"
        },
        {
            name: "Blog",
            href: "/blog"
        },
        {
            name: "Links",
            href: "/links"
        },
        {
            name: "Notes",
            href: "/notes"
        }
    ]


    return (
        <section className="w-full mt-2">
            <nav className="flex justify-between items-center">
                <Link href="/" className="font-bold">MFJip</Link>
                <ul className="text-dark-50 font-orbitron font-light select-none text-[1.3em] flex gap-4 items-center mr-5">
                    {links.map(link => (
                        <li key={link.name}>
                            <Link href={link.href} className="hover:underline">{link.name}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </section>
    )
}