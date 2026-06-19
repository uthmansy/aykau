"use client";

import { useState } from "react";
import {
  UserOutlined,
  ToolOutlined,
  BellOutlined,
  LockOutlined,
  CreditCardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import ProfileSettings from "@/components/ui/settings/ProfileSettings";
import ProfessionalSettings from "@/components/ui/settings/ProfessionalSettings";

type SettingsSection =
  | "profile"
  | "professional"
  | "notifications"
  | "security"
  | "account";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const menuItems = [
    { key: "profile", label: "Profile", icon: <UserOutlined /> },
    { key: "professional", label: "Professional", icon: <ToolOutlined /> },
    { key: "notifications", label: "Notifications", icon: <BellOutlined /> },
    { key: "security", label: "Security", icon: <LockOutlined /> },
    {
      key: "account",
      label: "Account & Billing",
      icon: <CreditCardOutlined />,
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-[280px] hidden lg:flex flex-col shrink-0">
          <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-4 h-fit sticky top-24">
            <div className="px-4 py-2 mb-2">
              <h1 className="font-manrope text-[24px] font-semibold text-primary leading-tight">
                Settings
              </h1>
              <p className="font-inter text-[14px] text-on-surface-variant mt-1">
                Manage your account preferences
              </p>
            </div>

            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key as SettingsSection)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
                    activeSection === item.key
                      ? "border-l-4 border-primary bg-primary/5 text-primary font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-primary border-l-4 border-transparent"
                  }`}
                >
                  <span className="text-[18px]">{item.icon}</span>
                  <span className="font-inter text-[14px] font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/5 transition-all w-full text-left">
                <LogoutOutlined className="text-[18px]" />
                <span className="font-inter text-[14px] font-medium">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-grow max-w-4xl">
          {activeSection === "profile" && <ProfileSettings />}
          {activeSection === "professional" && <ProfessionalSettings />}

          {["notifications", "security", "account"].includes(activeSection) && (
            <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                {activeSection === "notifications" && (
                  <BellOutlined className="text-primary text-2xl" />
                )}
                {activeSection === "security" && (
                  <LockOutlined className="text-primary text-2xl" />
                )}
                {activeSection === "account" && (
                  <CreditCardOutlined className="text-primary text-2xl" />
                )}
              </div>
              <h3 className="font-manrope text-[20px] font-semibold text-primary mb-2 capitalize">
                {activeSection} Settings
              </h3>
              <p className="font-inter text-[14px] text-on-surface-variant">
                This section is currently under construction. Check back soon!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
