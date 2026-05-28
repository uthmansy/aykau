import { App, Avatar, Dropdown, Layout, Menu, Space } from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import Image from "next/image";

const { Header } = Layout;

export default function AppHeader() {
  const router = useRouter();
  const { message } = App.useApp();

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
      }}
    >
      <Image
        src="/header-logo.png"
        alt="Logo"
        width={120}
        height={40}
        priority
      />
      <Menu
        theme="dark"
        mode="horizontal"
        items={[
          { key: "1", label: "Dashboard" },
          { key: "2", label: "Settings" },
        ]}
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
    </Header>
  );
}
