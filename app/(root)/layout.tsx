import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import ProfileImage from "@/components/profile";

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex justify-between items-center py-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/ireme-logo.svg" alt="Ireme AI Logo" width={38} height={32} />
          <h2 className="text-primary-100">Ireme AI</h2>
        </Link>

        {/* Profile Image with Dropdown */}
        <ProfileImage />
      </nav>

      {children}
    </div>
  );
};

export default Layout;
