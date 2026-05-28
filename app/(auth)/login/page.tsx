"use client";

import { App, Button, Card, Form, Input } from "antd";
import { loginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);

    // Zod validation
    const result = loginSchema.safeParse(values);

    if (!result.success) {
      message.error(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    const { data, error } = await authService.login(
      values.email,
      values.password
    );

    if (error) {
      message.error(error.message);
      setLoading(false);
      return;
    }

    message.success("Login successful");

    setUser(data.user);

    router.push("/dashboard");

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <Card title="Login" style={{ width: 380 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "Minimum 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
