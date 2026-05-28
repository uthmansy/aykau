"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { Layout, Menu, MenuProps, theme } from "antd";
import { Footer, Header } from "antd/es/layout/layout";
// import Sider from "antd/es/layout/Sider";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AppHeader from "@/components/layout/AppHeader";

const items = Array.from({ length: 5 }).map((_, index) => ({
  key: index + 1,
  label: `nav ${index + 1}`,
}));

// const items2: MenuProps["items"] = [
//   UserOutlined,
//   LaptopOutlined,
//   NotificationOutlined,
// ].map((icon, index) => {
//   const key = String(index + 1);

//   return {
//     key: `sub${key}`,
//     icon: React.createElement(icon),
//     label: `subnav ${key}`,
//     children: Array.from({ length: 4 }).map((_, j) => {
//       const subKey = index * 4 + j + 1;
//       return {
//         key: subKey,
//         label: `option${subKey}`,
//       };
//     }),
//   };
// });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await authService.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };

    checkUser();
  }, []);

  const currentYear = new Date().getFullYear();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <AppHeader />

      <Layout>
        {/* <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderInlineEnd: 0 }}
            items={items2}
          />
        </Sider> */}
        <Layout.Content style={{ padding: 20 }}>{children}</Layout.Content>
      </Layout>
      <Footer style={{ textAlign: "center" }}>
        Aykau ©{currentYear} All rights reserved.
      </Footer>
    </Layout>
  );
}
