import { Divider } from "antd";

export default function AuthDivider() {
  return (
    <Divider className="my-6! [&_.ant-divider-inner-text]:font-inter! [&_.ant-divider-inner-text]:text-[11px]! [&_.ant-divider-inner-text]:font-bold! [&_.ant-divider-inner-text]:text-outline! [&_.ant-divider-inner-text]:uppercase! [&_.ant-divider-inner-text]:tracking-[0.2em]!">
      Or continue with email
    </Divider>
  );
}
