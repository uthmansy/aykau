// app/(dashboard)/dashboard/wallet/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Skeleton,
  Tag,
  Empty,
  App,
  Button,
  Modal,
  InputNumber,
} from "antd";
import {
  WalletOutlined,
  StarOutlined,
  PlusCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  BankOutlined,
  PercentageOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import BuyCreditsModal from "@/components/ui/wallet/BuyCreditsModal";

const { Title, Text } = Typography;

export default function WalletPage() {
  const { message, modal } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);

  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

  // Modal States
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchWalletData();
    }
  }, [userId]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // 1. Reconcile wallet to ensure balance is 100% accurate from the ledger
      await supabase.rpc("reconcile_wallet", { p_user_id: userId });

      // 2. Fetch updated wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();

      setWallet(walletData);

      // 3. Fetch recent transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      setTransactions(txData || []);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      message.error("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 SIMULATED PAYMENT FLOW (Will be replaced by Paystack later)
  const handleRealPayment = async (
    type: "fiat_deposit" | "credit_purchase"
  ) => {
    if (!paymentAmount || paymentAmount <= 0) {
      message.warning("Please enter a valid amount.");
      return;
    }

    setProcessing(true);

    try {
      const user = useAuthStore.getState().user;

      // 🟢 Point to bridge page with appropriate intent
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/payment/processing?intent=${
              type === "fiat_deposit" ? "add_funds" : "credit_purchase"
            }`
          : "https://yourdomain.com/dashboard/payment/processing?intent=add_funds";

      const { data: intentData, error: intentError } =
        await supabase.functions.invoke("create-payment-intent", {
          body: {
            amount: paymentAmount,
            email: user?.email,
            callback_url: callbackUrl,
            metadata: {
              user_id: user?.id,
              type: type,
              credits_amount:
                type === "credit_purchase" ? paymentAmount : undefined,
            },
          },
        });

      if (intentError) throw intentError;

      window.location.href = intentData.authorizationUrl;
    } catch (error: any) {
      console.error("Payment error:", error);
      message.error("Failed to initialize payment. Please try again.");
      setProcessing(false);
    }
  };
  // Helper to format currency (Naira)
  const formatCurrency = (amount: number) => {
    return `₦${Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Helper to get transaction display details
  const getTxDetails = (type: string) => {
    switch (type) {
      case "fiat_deposit":
        return {
          icon: <PlusCircleOutlined />,
          title: "Fiat Deposit",
          color: "text-green-600",
          bg: "bg-green-50",
          sign: "+",
        };
      case "escrow_release":
        return {
          icon: <UnlockOutlined />,
          title: "Escrow Released",
          color: "text-green-600",
          bg: "bg-green-50",
          sign: "+",
        };
      case "escrow_refund":
        return {
          icon: <SwapOutlined />,
          title: "Escrow Refund",
          color: "text-green-600",
          bg: "bg-green-50",
          sign: "+",
        };
      case "credit_purchase":
        return {
          icon: <StarOutlined />,
          title: "Credits Purchased",
          color: "text-green-600",
          bg: "bg-green-50",
          sign: "+",
        };

      case "escrow_hold":
        return {
          icon: <LockOutlined />,
          title: "Escrow Funded",
          color: "text-gray-600",
          bg: "bg-gray-100",
          sign: "-",
        };
      case "withdrawal":
        return {
          icon: <BankOutlined />,
          title: "Withdrawal",
          color: "text-gray-600",
          bg: "bg-gray-100",
          sign: "-",
        };
      case "credit_spend":
        return {
          icon: <StarOutlined />,
          title: "Credits Spent",
          color: "text-gray-600",
          bg: "bg-gray-100",
          sign: "-",
        };
      case "platform_fee":
        return {
          icon: <PercentageOutlined />,
          title: "Platform Fee",
          color: "text-gray-600",
          bg: "bg-gray-100",
          sign: "-",
        };

      default:
        return {
          icon: <WalletOutlined />,
          title: "Transaction",
          color: "text-gray-600",
          bg: "bg-gray-100",
          sign: "",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            className="!rounded-full !text-[10px] !uppercase !m-0 !border-0"
          >
            Completed
          </Tag>
        );
      case "pending":
        return (
          <Tag
            icon={<ClockCircleOutlined />}
            color="warning"
            className="!rounded-full !text-[10px] !uppercase !m-0 !border-0"
          >
            Pending
          </Tag>
        );
      case "failed":
        return (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            className="!rounded-full !text-[10px] !uppercase !m-0 !border-0"
          >
            Failed
          </Tag>
        );
      default:
        return (
          <Tag className="!rounded-full !text-[10px] !uppercase !m-0 !border-0">
            {status}
          </Tag>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton.Input active className="w-48 h-8 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton.Button active className="!w-full !h-48 !rounded-2xl" />
          <Skeleton.Button active className="!w-full !h-48 !rounded-2xl" />
        </div>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Title level={3} className="!text-gray-900 !mb-1">
          Wallet
        </Title>
        <Text className="!text-gray-500">
          Manage your balances and view transaction history.
        </Text>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fiat Balance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <WalletOutlined className="text-xl text-gray-700" />
            </div>
            <Text className="!text-gray-500 !font-medium uppercase text-xs! tracking-wide">
              Fiat Balance
            </Text>
          </div>
          <Title level={3} className="!text-gray-900 !mb-6">
            {formatCurrency(wallet?.fiat_balance)}
          </Title>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => setIsAddFundsOpen(true)}
            className="!bg-gray-900 hover:!bg-gray-800 !border-0 !text-white !rounded-xl !h-11 !w-full !font-medium !shadow-none"
          >
            Add Funds
          </Button>
        </div>

        {/* Credit Balance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <StarOutlined className="text-xl text-gray-700" />
            </div>
            <Text className="!text-gray-500 !font-medium uppercase text-xs! tracking-wide">
              Credit Balance
            </Text>
          </div>
          <Title level={3} className="!text-gray-900 !mb-6">
            {Number(wallet?.credit_balance || 0).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}{" "}
            Credits
          </Title>
          <Button
            icon={<StarOutlined />}
            onClick={() => setShowBuyCreditsModal(true)}
            className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 text-gray-900 rounded-xl h-11 w-full font-medium shadow-none"
          >
            Buy Credits
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <Title level={5} className="!text-gray-900 !mb-0">
            Recent Transactions
          </Title>
        </div>

        <div className="divide-y divide-gray-100">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Empty
                description="No transactions yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            transactions.map((tx) => {
              const details = getTxDetails(tx.type);
              const isPositive = details.sign === "+";

              return (
                <div
                  key={tx.id}
                  className="p-4 md:p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${details.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={`text-lg! ${details.color}`}>
                      {details.icon}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Text
                      strong
                      className="!text-gray-900 block text-sm! truncate"
                    >
                      {details.title}
                    </Text>
                    <Text className="!text-gray-400 text-xs! block truncate">
                      {tx.description || "No description"} •{" "}
                      {new Date(tx.created_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </div>

                  <div className="hidden sm:block">
                    {getStatusBadge(tx.status)}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <Text
                      strong
                      className={`block text-sm ${
                        isPositive ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {details.sign}
                      {formatCurrency(tx.amount)}
                    </Text>
                    {tx.currency === "credit" && (
                      <Text className="!text-gray-400 text-[10px] uppercase">
                        Credits
                      </Text>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🟢 ADD FUNDS MODAL */}
      <Modal
        title="Add Funds to Wallet"
        open={isAddFundsOpen}
        onCancel={() => setIsAddFundsOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <div className="py-4">
          <Text className="!text-gray-500 block mb-4">
            Enter the amount you want to deposit via Paystack.
          </Text>
          <InputNumber
            size="large"
            className="!w-full !h-12 !rounded-lg !text-lg"
            placeholder="e.g. 10000"
            min={100}
            value={paymentAmount}
            onChange={(val) => setPaymentAmount(val)}
            prefix="₦"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value!.replace(/\₦\s?|(,*)/g, "") as any}
          />
          <Button
            type="primary"
            size="large"
            block
            loading={processing}
            onClick={() => handleRealPayment("fiat_deposit")}
            className="!mt-6 !h-12 !rounded-lg !bg-gray-900 hover:!bg-gray-800 !border-0 !font-medium"
          >
            Proceed to Paystack
          </Button>
          <Text className="!text-gray-400 !text-xs block text-center mt-4">
            *Currently simulating payment for testing. Paystack integration
            coming soon.
          </Text>
        </div>
      </Modal>

      {/* 🟢 BUY CREDITS MODAL */}
      <Modal
        title="Buy aykau Credits"
        open={isBuyCreditsOpen}
        onCancel={() => setIsBuyCreditsOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <div className="py-4">
          <Text className="!text-gray-500 block mb-4">
            Credits can be used to boost your job posts or pay for premium
            features.
          </Text>
          <InputNumber
            size="large"
            className="!w-full !h-12 !rounded-lg !text-lg"
            placeholder="e.g. 500"
            min={10}
            value={paymentAmount}
            onChange={(val) => setPaymentAmount(val)}
            suffix="Credits"
          />
          <Button
            type="primary"
            size="large"
            block
            loading={processing}
            onClick={() => handleRealPayment("credit_purchase")}
            className="!mt-6 !h-12 !rounded-lg !bg-gray-900 hover:!bg-gray-800 !border-0 !font-medium"
          >
            Purchase Credits
          </Button>
          <Text className="!text-gray-400 !text-xs block text-center mt-4">
            *Currently simulating payment for testing. Paystack integration
            coming soon.
          </Text>
        </div>
      </Modal>
      <BuyCreditsModal
        open={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        onSuccess={() => {
          fetchWalletData();
        }}
      />
    </div>
  );
}
