"use client";

import { Input } from "antd";
import { InputHTMLAttributes, useState } from "react";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

interface AuthInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  label: string;
  icon?: "mail" | "lock" | "person";
  type?: "text" | "email" | "password";
  error?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
}

const iconMap = {
  mail: <MailOutlined className="text-outline text-base" />,
  lock: <LockOutlined className="text-outline text-base" />,
  person: <UserOutlined className="text-outline text-base" />,
};

export default function AuthInput({
  label,
  icon,
  type = "text",
  error,
  className = "",
  value,
  onChange,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const prefixIcon = icon ? (
    <span className="text-outline">{iconMap[icon]}</span>
  ) : null;

  const suffixIcon = isPassword ? (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-outline hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0"
    >
      {showPassword ? (
        <EyeInvisibleOutlined className="text-base" />
      ) : (
        <EyeOutlined className="text-base" />
      )}
    </button>
  ) : null;

  return (
    <div className="space-y-1.5">
      <label className="block font-inter text-label-md font-semibold text-on-surface">
        {label}
      </label>
      <Input
        type={inputType}
        value={value}
        onChange={onChange}
        prefix={prefixIcon}
        suffix={suffixIcon}
        status={error ? "error" : undefined}
        placeholder={props.placeholder}
        className={`h-12! pl-12! pr-4! bg-surface-container-lowest! border-outline-variant! rounded-lg! font-inter! text-body-md! focus:border-primary! focus:ring-1! focus:ring-primary/30! ${
          error ? "border-error!" : ""
        } ${className}`}
      />
      {error && <p className="font-inter text-label-sm text-error">{error}</p>}
    </div>
  );
}
