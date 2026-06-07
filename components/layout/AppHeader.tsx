// components/layout/AppHeader.tsx
import { App, Avatar, Dropdown, Layout } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import Image from "next/image";
import Link from "next/link";
import NotificationBell from "../ui/NotificationBell";
import ChatBell from "../ui/chat/ChatBell";

const { Header } = Layout;

export default function AppHeader() {
  const router = useRouter();
  const { message } = App.useApp();
  const pathname = usePathname();

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === "logout") {
      const { error } = await authService.logout();
      if (error) {
        message.error("Failed to logout");
        return;
      }
      message.success("Logged out");
      router.push("/login");
    }
    if (key === "profile") router.push("/profile");
    if (key === "settings") router.push("/dashboard/settings");
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", path: "/dashboard" },
    {
      key: "my-requests",
      label: "My Requests",
      path: "/dashboard/my-requests",
    },
    { key: "jobs", label: "Jobs", path: "/dashboard/jobs" },
    { key: "settings", label: "Settings", path: "/dashboard/settings" },
    { key: "wallet", label: "Wallet", path: "/dashboard/wallet" },
  ];

  const profileMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { type: "divider" as const },
    { key: "logout", icon: <LogoutOutlined />, danger: true, label: "Logout" },
  ];

  return (
    <Header className="bg-slate-900! h-16! leading-16! px-0! border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-6 w-full">
        {/* 1. Logo */}
        <Link href="/dashboard" className="flex items-center shrink-0">
          <Image
            src="/header-logo.png"
            alt="Logo"
            width={120}
            height={32}
            priority
            className="object-contain"
          />
        </Link>

        {/* 2. Navigation & Actions Container */}
        <div className="flex items-center gap-6">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  // Added ! (important) to force text color and override AntD's default dark text
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/10! text-white!"
                      : "text-slate-300! hover:text-white! hover:bg-white/5!"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions (Bell + Avatar) */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            {/* Dedicated Chat Bell */}
            <ChatBell />

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Avatar Dropdown */}
            <Dropdown
              menu={{
                items: profileMenuItems,
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar
                  size={36}
                  icon={<UserOutlined />}
                  className="bg-slate-700! text-slate-200! ring-2 ring-white/10"
                />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </Header>
  );
}
