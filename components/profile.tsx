// components/ProfileImage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "@/lib/actions/auth.action";

const ProfileImage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(); // Firebase logout
      router.push("/sign-in"); // Redirect to sign-in page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="flex items-center gap-2">
        <Image
          src="/user-avatar.png" // Replace with user profile image
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-primary shadow-lg rounded-lg border">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;