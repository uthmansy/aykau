"use client";

import {
  App,
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Input,
  Layout,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import NotificationBell from "../ui/NotificationBell";
import ChatBell from "../ui/chat/ChatBell";

const { Header } = Layout;

export default function AppHeader() {
  const router = useRouter();
  const { message } = App.useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    {
      key: "withdrawals",
      label: "Withdrawals",
      path: "/dashboard/withdrawals",
    },
  ];

  const profileMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { type: "divider" as const },
    { key: "logout", icon: <LogoutOutlined />, danger: true, label: "Logout" },
  ];

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  // Close mobile menu when navigating
  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <>
      <Header className="sticky top-0 z-50 h-16! leading-16! p-0! bg-surface-glass! backdrop-blur-glass! border-b! border-outline-variant/30!">
        <div className="flex items-center justify-between h-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
          {/* Logo */}
          <Link href="/dashboard" className="shrink-0">
            <span className="font-manrope text-2xl font-bold text-primary">
              aykau
            </span>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <nav className="flex items-center gap-6">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    className={`text-sm font-medium pb-1 border-b-2 transition-all duration-200 no-underline ${
                      active
                        ? "border-secondary text-secondary"
                        : "border-transparent text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  placeholder="Search professionals..."
                  prefix={<SearchOutlined className="text-outline" />}
                  className="w-60! bg-surface-container! rounded-full! border-none! py-1! px-3! text-sm!"
                />
              </div>

              <NotificationBell />
              <ChatBell />

              <Dropdown
                menu={{ items: profileMenuItems, onClick: handleMenuClick }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="cursor-pointer transition-opacity duration-200">
                  <Avatar
                    size={36}
                    icon={<UserOutlined />}
                    className="bg-surface-container! text-on-surface-variant! ring-2! ring-on-surface-variant/10!"
                  />
                </div>
              </Dropdown>
            </div>
          </div>

          {/* Mobile Actions: Bells + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationBell />
            <ChatBell />
            <Button
              type="text"
              icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-on-surface-variant! text-xl!"
              aria-label="Toggle menu"
            />
          </div>
        </div>
      </Header>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <span className="font-manrope text-xl font-bold text-primary">
            Menu
          </span>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={300}
        className="mobile-drawer"
        styles={{
          body: { padding: "16px 20px" },
          header: { borderBottom: "1px solid var(--outline-variant)" },
        }}
      >
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search professionals..."
            prefix={<SearchOutlined className="text-outline" />}
            className="w-full! bg-surface-container! rounded-full! border-none! py-2! px-4!"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mb-6">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.key}
                href={item.path}
                onClick={handleNavClick}
                className={`px-4 py-3 rounded-lg font-medium transition-colors no-underline ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-outline-variant my-4" />

        {/* Profile Actions */}
        <div className="flex flex-col gap-1">
          <Link
            href="/profile"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors no-underline"
          >
            <UserOutlined />
            <span className="font-medium">Profile</span>
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors no-underline"
          >
            <SettingOutlined />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={async () => {
              setMobileMenuOpen(false);
              await handleMenuClick({ key: "logout" });
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-colors text-left w-full font-medium border-none bg-transparent cursor-pointer"
          >
            <LogoutOutlined />
            <span>Logout</span>
          </button>
        </div>
      </Drawer>
    </>
  );
}
