"use client";

import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Typography,
  App,
  Divider,
  Alert,
} from "antd";
import {
  BankOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  CloseCircleFilled,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

const { Text, Title } = Typography;

const NIGERIAN_BANKS = [
  { value: "Access Bank", label: "Access Bank" },
  { value: "Citibank", label: "Citibank" },
  { value: "Ecobank", label: "Ecobank" },
  { value: "Fidelity Bank", label: "Fidelity Bank" },
  { value: "First Bank of Nigeria", label: "First Bank of Nigeria" },
  {
    value: "First City Monument Bank (FCMB)",
    label: "First City Monument Bank (FCMB)",
  },
  { value: "Globus Bank", label: "Globus Bank" },
  {
    value: "Guaranty Trust Bank (GTBank)",
    label: "Guaranty Trust Bank (GTBank)",
  },
  { value: "Heritage Bank", label: "Heritage Bank" },
  { value: "Keystone Bank", label: "Keystone Bank" },
  { value: "Kuda Bank", label: "Kuda Bank" },
  { value: "Opay", label: "Opay" },
  { value: "PalmPay", label: "PalmPay" },
  { value: "Polaris Bank", label: "Polaris Bank" },
  { value: "Providus Bank", label: "Providus Bank" },
  { value: "Stanbic IBTC Bank", label: "Stanbic IBTC Bank" },
  { value: "Standard Chartered", label: "Standard Chartered" },
  { value: "Sterling Bank", label: "Sterling Bank" },
  { value: "SunTrust Bank", label: "SunTrust Bank" },
  { value: "Titan Trust Bank", label: "Titan Trust Bank" },
  { value: "Union Bank of Nigeria", label: "Union Bank of Nigeria" },
  {
    value: "United Bank for Africa (UBA)",
    label: "United Bank for Africa (UBA)",
  },
  { value: "Unity Bank", label: "Unity Bank" },
  { value: "Wema Bank", label: "Wema Bank" },
  { value: "Zenith Bank", label: "Zenith Bank" },
];

const ERROR_MESSAGES: Record<
  string,
  { title: string; message: string; type: "error" | "warning" }
> = {
  ACCOUNT_NOT_FOUND: {
    title: "Account not found",
    message:
      "We couldn't verify these details with the bank. Please check the account number matches the selected bank, and try again.",
    type: "error",
  },
  INVALID_ACCOUNT: {
    title: "Invalid account number",
    message: "Please enter a valid 10-digit account number.",
    type: "error",
  },
  DUPLICATE_ACCOUNT: {
    title: "Account already added",
    message: "You've already added this bank account to your profile.",
    type: "warning",
  },
  UNSUPPORTED_BANK: {
    title: "Bank not supported",
    message:
      "We don't support this bank yet. Please select a different bank from the list.",
    type: "warning",
  },
  BANK_REQUIRED: {
    title: "Missing information",
    message: "Please select a bank and enter your account number.",
    type: "warning",
  },
  MISSING_FIELDS: {
    title: "Missing information",
    message: "Please fill in all the required fields.",
    type: "warning",
  },
  DATABASE_ERROR: {
    title: "Something went wrong",
    message:
      "We had trouble saving your details. Please try again in a moment.",
    type: "error",
  },
  NETWORK_ERROR: {
    title: "Connection error",
    message: "Please check your internet connection and try again.",
    type: "error",
  },
  UNKNOWN_ERROR: {
    title: "Something went wrong",
    message:
      "We couldn't complete your request. Please try again or contact support if the issue persists.",
    type: "error",
  },
};

// 🟢 NEW: Helper to extract error code from Supabase FunctionsHttpError
const extractErrorFromResponse = async (
  error: any
): Promise<{ code: string; message: string }> => {
  const fallback = {
    code: "NETWORK_ERROR",
    message: "Please check your internet connection and try again.",
  };

  if (!error) return fallback;

  // If error already has a code property directly
  if (error.error && typeof error.error === "string") {
    return { code: error.error, message: error.message || fallback.message };
  }

  // If error.context exists (Supabase FunctionsHttpError)
  if (error.context) {
    try {
      // Try to parse as Response object (has .json() method)
      if (typeof error.context.json === "function") {
        const body = await error.context.json();
        if (body?.error) {
          return {
            code: body.error,
            message: body.message || fallback.message,
          };
        }
      }
      // Try as already-parsed object
      else if (error.context.error) {
        return {
          code: error.context.error,
          message: error.context.message || fallback.message,
        };
      }
    } catch (e) {
      console.error("Failed to parse error context:", e);
    }
  }

  return fallback;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBankAccountModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState<string>("");
  const [errorInfo, setErrorInfo] = useState<{
    code: string;
    title: string;
    message: string;
    type: "error" | "warning";
  } | null>(null);

  const handleFieldChange = () => {
    if (errorInfo) setErrorInfo(null);
    if (accountVerified) {
      setAccountVerified(false);
      setVerifiedAccountName("");
    }
  };

  const handleVerifyAccount = async () => {
    const accountNumber = form.getFieldValue("account_number");
    const bankName = form.getFieldValue("bank_name");

    if (!bankName) {
      setErrorInfo({
        code: "BANK_REQUIRED",
        ...ERROR_MESSAGES.BANK_REQUIRED,
      });
      return;
    }

    if (!accountNumber || accountNumber.length !== 10) {
      setErrorInfo({
        code: "INVALID_ACCOUNT",
        ...ERROR_MESSAGES.INVALID_ACCOUNT,
      });
      return;
    }

    setVerifying(true);
    setErrorInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-recipient",
        {
          body: {
            action: "resolve",
            bank_name: bankName,
            account_number: accountNumber,
          },
        }
      );

      // 🟢 FIX: Handle error response properly
      if (error) {
        const extractedError = await extractErrorFromResponse(error);
        const errorData =
          ERROR_MESSAGES[extractedError.code] || ERROR_MESSAGES.UNKNOWN_ERROR;
        setErrorInfo({
          code: extractedError.code,
          ...errorData,
        });
        return;
      }

      // Handle case where data contains error (200 status but error in body)
      if (data?.error) {
        const errorData =
          ERROR_MESSAGES[data.error] || ERROR_MESSAGES.UNKNOWN_ERROR;
        setErrorInfo({
          code: data.error,
          ...errorData,
        });
        return;
      }

      // Success path
      if (data?.success && data?.account_name) {
        setAccountVerified(true);
        setVerifiedAccountName(data.account_name);
        form.setFieldsValue({ account_name: data.account_name });
        message.success("Account verified successfully!");
      }
    } catch (error: any) {
      console.error("Verify error:", error);
      setErrorInfo({
        code: "NETWORK_ERROR",
        ...ERROR_MESSAGES.NETWORK_ERROR,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setErrorInfo(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke(
        "create-recipient",
        {
          body: {
            action: "create",
            bank_name: values.bank_name,
            account_number: values.account_number,
            account_name: values.account_name,
            user_id: user?.id,
          },
        }
      );

      // 🟢 FIX: Handle error response properly
      if (error) {
        const extractedError = await extractErrorFromResponse(error);
        const errorData =
          ERROR_MESSAGES[extractedError.code] || ERROR_MESSAGES.UNKNOWN_ERROR;
        setErrorInfo({
          code: extractedError.code,
          ...errorData,
        });
        return;
      }

      if (data?.error) {
        const errorData =
          ERROR_MESSAGES[data.error] || ERROR_MESSAGES.UNKNOWN_ERROR;
        setErrorInfo({
          code: data.error,
          ...errorData,
        });
        return;
      }

      message.success("Bank account added successfully!");
      form.resetFields();
      setAccountVerified(false);
      setVerifiedAccountName("");
      setErrorInfo(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Add bank error:", error);
      setErrorInfo({
        code: "UNKNOWN_ERROR",
        ...ERROR_MESSAGES.UNKNOWN_ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setAccountVerified(false);
    setVerifiedAccountName("");
    setErrorInfo(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
      centered
      className="add-bank-modal"
      styles={{
        body: {
          padding: 0,
          borderRadius: "16px",
          overflow: "hidden",
        },
        mask: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <div className="bg-surface-container-lowest! p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BankOutlined className="text-primary! text-xl!" />
          </div>
          <div>
            <Title
              level={4}
              className="!text-primary! !font-manrope! !font-semibold! !mb-1! !text-lg!"
            >
              Add New Bank Account
            </Title>
            <Text className="!text-on-surface-variant! !font-inter! !text-sm!">
              Enter your bank details securely.
            </Text>
          </div>
        </div>

        {/* Prominent Error Alert */}
        {errorInfo && (
          <Alert
            type={errorInfo.type}
            showIcon
            icon={
              errorInfo.type === "error" ? (
                <CloseCircleFilled />
              ) : (
                <ExclamationCircleFilled />
              )
            }
            message={
              <span className="!font-inter! !font-semibold!">
                {errorInfo.title}
              </span>
            }
            description={
              <span className="!font-inter! !text-sm!">
                {errorInfo.message}
              </span>
            }
            closable
            onClose={() => setErrorInfo(null)}
            className="!rounded-lg! !mb-6! !border-0!"
            style={{
              backgroundColor:
                errorInfo.type === "error"
                  ? "var(--error-container)"
                  : "var(--secondary-fixed)",
              color:
                errorInfo.type === "error"
                  ? "var(--on-error-container)"
                  : "var(--on-secondary-container)",
            }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFieldChange}
          requiredMark={false}
          className="space-y-1"
        >
          {/* Bank Name */}
          <Form.Item
            label={
              <span className="!text-sm! !font-inter! !font-medium! !text-on-surface! !mb-1! !block">
                Bank Name
              </span>
            }
            name="bank_name"
            rules={[{ required: true, message: "Please select your bank" }]}
            className="!mb-4!"
          >
            <Select
              placeholder="Select your bank"
              options={NIGERIAN_BANKS}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="!rounded-lg! !h-11!"
              suffixIcon={<span className="text-on-surface-variant!">▼</span>}
            />
          </Form.Item>

          {/* Account Number & Verify */}
          <Form.Item
            label={
              <span className="!text-sm! !font-inter! !font-medium! !text-on-surface! !mb-1! !block">
                Account Number
              </span>
            }
            name="account_number"
            rules={[
              { required: true, message: "Please enter account number" },
              { len: 10, message: "Account number must be 10 digits" },
              { pattern: /^[0-9]+$/, message: "Only numbers allowed" },
            ]}
            className="!mb-4!"
          >
            <Input
              placeholder="Enter 10-digit account number"
              maxLength={10}
              className="!rounded-lg! !h-11! !font-mono! !text-base!"
              suffix={
                accountVerified ? (
                  <CheckCircleFilled className="text-success! text-lg!" />
                ) : (
                  <Button
                    type="link"
                    size="small"
                    onClick={handleVerifyAccount}
                    loading={verifying}
                    className="!text-secondary! !font-semibold! !p-0! !h-auto! !text-xs! hover:!text-secondary/80!"
                  >
                    Verify
                  </Button>
                )
              }
            />
          </Form.Item>

          {/* Account Name */}
          <Form.Item
            label={
              <span className="!text-sm! !font-inter! !font-medium! !text-on-surface! !mb-1! !block">
                Account Name
              </span>
            }
            name="account_name"
            rules={[{ required: true, message: "Please enter account name" }]}
            className="!mb-2!"
            extra={
              accountVerified && verifiedAccountName ? (
                <span className="!text-success! !text-xs! !font-inter! flex items-center gap-1 mt-1">
                  <CheckCircleFilled /> Verified: {verifiedAccountName}
                </span>
              ) : null
            }
          >
            <Input
              placeholder="Click 'Verify' to auto-fill account name"
              className="!rounded-lg! !h-11! !text-base!"
              readOnly={accountVerified}
            />
          </Form.Item>

          {/* Security Note */}
          <div className="bg-surface-container-low! rounded-lg! p-3! flex items-start gap-3 mb-6!">
            <SafetyCertificateOutlined className="text-primary! text-base! mt-0.5! flex-shrink-0!" />
            <Text className="!text-xs! !text-on-surface-variant! !font-inter! !leading-relaxed!">
              Your bank details are encrypted using 256-bit SSL and stored
              securely. We only use this to process your withdrawals.
            </Text>
          </div>

          <Divider className="!my-4! !border-outline-variant/50!" />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              block
              size="large"
              className="!rounded-lg! !h-11! !font-inter! !font-medium! !text-on-surface! !border-outline! hover:!border-primary! hover:!text-primary!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              className="!bg-secondary! !border-secondary! !text-white! !font-inter! !font-semibold! !rounded-lg! !h-11! hover:!bg-secondary/90! !shadow-[0_4px_12px_rgba(165,59,21,0.2)]!"
            >
              {loading ? "Adding Account..." : "Add Bank Account"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
