"use client";

import { useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import { registerSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);

    // Confirm password check
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      setLoading(false);
      return;
    }

    // Zod validation
    const result = registerSchema.safeParse({
      email: values.email,
      password: values.password,
    });

    if (!result.success) {
      message.error(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    const { error } = await authService.register(values.email, values.password);

    if (error) {
      message.error(error.message);
      setLoading(false);
      return;
    }

    message.success("Account created successfully");

    router.push("/login");

    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 100,
      }}
    >
      <Card title="Create Account" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Email is required",
              },
              {
                type: "email",
                message: "Enter a valid email",
              },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Password is required",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please confirm your password",
              },
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Create Account
          </Button>
        </Form>
      </Card>
    </div>
  );
}
