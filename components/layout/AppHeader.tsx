import { App, Avatar, Dropdown, Layout, Menu, Space } from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import Image from "next/image";
import Link from "next/link";

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

    if (key === "profile") {
      router.push("/profile");
    }

    if (key === "settings") {
      router.push("/settings");
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      label: (
        <Link
          href="/dashboard"
          style={{
            color: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Dashboard</span>
        </Link>
      ),
      path: "/dashboard",
    },
    {
      key: "my-requests",
      label: (
        <Link
          href="/dashboard/my-requests"
          style={{
            color: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>My Requests</span>
        </Link>
      ),
      path: "/dashboard/my-requests",
    },
    {
      key: "jobs",
      label: (
        <Link
          href="/dashboard/jobs"
          style={{
            color: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Jobs</span>
        </Link>
      ),
      path: "/dashboard/jobs",
    },
    {
      key: "settings",
      label: (
        <Link
          href="/dashboard/settings"
          style={{
            color: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Settings</span>
        </Link>
      ),
      path: "/dashboard/settings",
    },
  ];

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      label: "Logout",
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "5rem",
        overflow: "hidden",
      }}
    >
      <Image
        src="/header-logo.png"
        alt="Logo"
        width={120}
        height={40}
        priority
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[
            menuItems.find((item) => item.path === pathname)?.key ?? "",
          ]}
          items={menuItems.map(({ key, label }) => ({
            key,
            label,
          }))}
          style={{ flex: 1, minWidth: 0 }}
        />

        <Dropdown
          menu={{
            //@ts-ignore
            items: profileMenuItems,
            onClick: handleMenuClick,
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Space style={{ cursor: "pointer", marginLeft: 16 }}>
            <Avatar icon={<UserOutlined />} />
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
}
