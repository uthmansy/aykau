"use client";

import { useEffect, useState } from "react";
import { Skeleton, Empty, App, Modal, InputNumber, Button } from "antd";
import {
  WalletOutlined,
  StarOutlined,
  PlusCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  BankOutlined,
  PercentageOutlined,
  SwapOutlined,
  FilterOutlined,
  DownloadOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import BuyCreditsModal from "@/components/ui/wallet/BuyCreditsModal";

export default function WalletPage() {
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);

  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (userId) fetchWalletData();
  }, [userId]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      await supabase.rpc("reconcile_wallet", { p_user_id: userId });
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();
      setWallet(walletData);

      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      setTransactions(txData || []);
    } catch (error) {
      message.error("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRealPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0)
      return message.warning("Please enter a valid amount.");
    setProcessing(true);
    try {
      const user = useAuthStore.getState().user;
      const callbackUrl = `${window.location.origin}/dashboard/payment/processing?intent=add_funds`;
      const { data, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            amount: paymentAmount,
            email: user?.email,
            callback_url: callbackUrl,
            metadata: { user_id: user?.id, type: "fiat_deposit" },
          },
        }
      );
      if (error) throw error;
      window.location.href = data.authorizationUrl;
    } catch (error: any) {
      message.error("Failed to initialize payment.");
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) =>
    `₦${Number(amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getTxDetails = (type: string) => {
    switch (type) {
      case "fiat_deposit":
        return {
          icon: <PlusCircleOutlined />,
          title: "Fiat Deposit",
          color: "text-success-emerald",
          bg: "bg-success-emerald/10",
          sign: "+",
        };
      case "escrow_release":
        return {
          icon: <UnlockOutlined />,
          title: "Escrow Released",
          color: "text-success-emerald",
          bg: "bg-success-emerald/10",
          sign: "+",
        };
      case "escrow_refund":
        return {
          icon: <SwapOutlined />,
          title: "Escrow Refund",
          color: "text-success-emerald",
          bg: "bg-success-emerald/10",
          sign: "+",
        };
      case "credit_purchase":
        return {
          icon: <StarOutlined />,
          title: "Credits Purchased",
          color: "text-success-emerald",
          bg: "bg-success-emerald/10",
          sign: "+",
        };
      case "escrow_hold":
        return {
          icon: <LockOutlined />,
          title: "Escrow Funded",
          color: "text-primary",
          bg: "bg-primary/10",
          sign: "-",
        };
      case "withdrawal":
        return {
          icon: <BankOutlined />,
          title: "Withdrawal",
          color: "text-error",
          bg: "bg-error/10",
          sign: "-",
        };
      case "credit_spend":
        return {
          icon: <StarOutlined />,
          title: "Credits Spent",
          color: "text-on-surface-variant",
          bg: "bg-on-surface-variant/10",
          sign: "-",
        };
      case "platform_fee":
        return {
          icon: <PercentageOutlined />,
          title: "Platform Fee",
          color: "text-on-surface-variant",
          bg: "bg-on-surface-variant/10",
          sign: "-",
        };
      default:
        return {
          icon: <WalletOutlined />,
          title: "Transaction",
          color: "text-on-surface-variant",
          bg: "bg-on-surface-variant/10",
          sign: "",
        };
    }
  };

  if (loading) {
    return (
      <div className="p-10 max-w-5xl mx-auto space-y-8">
        <Skeleton.Input active className="w-48 h-8 mb-4 rounded-lg!" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton.Button active className="!w-full !h-64 !rounded-2xl" />
          <Skeleton.Button active className="!w-full !h-64 !rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-64px)] overflow-hidden bg-surface">
      {/* Left Pane: Balances & Promotions */}
      <aside className="w-full md:w-[40%] flex-none p-4 md:p-10 overflow-y-auto border-r border-outline-variant/30 bg-surface">
        <div className="space-y-8 max-w-lg md:max-w-2xl mx-auto md:mx-0">
          <header>
            <h1 className="font-manrope text-[32px] font-semibold text-primary leading-tight">
              Wallet
            </h1>
            <p className="text-on-surface-variant font-inter text-base mt-2">
              Manage your balances and view transaction history.
            </p>
          </header>

          {/* Fiat Balance Card */}
          <div className="bg-surface-glass backdrop-blur-glass border border-white/20 shadow-[var(--shadow-level-1)] p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  Fiat Balance
                </span>
                <WalletOutlined className="text-2xl text-primary/40" />
              </div>
              <div className="mb-8">
                <span className="font-manrope text-[48px] font-bold text-primary leading-none">
                  {formatCurrency(wallet?.fiat_balance)}
                </span>
              </div>
              <Button
                type="primary"
                block
                size="large"
                icon={<PlusCircleOutlined />}
                onClick={() => setIsAddFundsOpen(true)}
                className="rounded-lg! h-auto! py-3! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
              >
                Add Funds
              </Button>
            </div>
          </div>

          {/* Credit Balance Card */}
          <div className="bg-surface-glass backdrop-blur-glass border border-white/20 shadow-[var(--shadow-level-1)] p-8 rounded-2xl relative overflow-hidden group border-primary/10!">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  Credit Balance
                </span>
                <StarOutlined className="text-2xl text-secondary/40" />
              </div>
              <div className="mb-8">
                <span className="font-manrope text-[48px] font-bold text-primary leading-none">
                  {Number(wallet?.credit_balance || 0).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="font-manrope text-[24px] text-on-surface-variant ml-2">
                  Credits
                </span>
              </div>
              <Button
                block
                size="large"
                icon={<StarOutlined />}
                onClick={() => setShowBuyCreditsModal(true)}
                className="rounded-lg! h-auto! py-3! border-2! border-primary! text-primary! hover:bg-primary/5! bg-transparent! font-inter! text-[14px]! font-medium!"
              >
                Buy Credits
              </Button>
            </div>
          </div>

          {/* Promo Banner */}
          <section className="bg-surface-glass backdrop-blur-glass border border-white/20 shadow-[var(--shadow-level-1)] rounded-2xl overflow-hidden flex flex-col">
            <div className="h-40 relative bg-gradient-to-br from-primary/20 to-secondary/20" />
            <div className="p-6 flex flex-col justify-center">
              <span className="text-secondary font-inter text-[12px] font-semibold uppercase tracking-wider mb-2">
                Smart Savings
              </span>
              <h3 className="font-manrope text-[24px] font-semibold text-primary mb-2 leading-tight">
                Automate your service payments
              </h3>
              <p className="text-on-surface-variant font-inter text-base mb-4 leading-relaxed">
                Users who keep a minimum credit balance of 1,000 credits enjoy
                10% off all transaction fees across the Luminous Marketplace.
              </p>
              <a
                href="#"
                className="text-primary font-inter text-[14px] font-medium flex items-center gap-2 hover:underline"
              >
                Learn more about Luminous Rewards{" "}
                <ArrowRightOutlined className="text-[18px]" />
              </a>
            </div>
          </section>
        </div>
      </aside>

      {/* Right Pane: Transaction History */}
      <main className="w-full md:w-[60%] flex-1 bg-surface-container-lowest overflow-y-auto">
        <div className="p-4 md:p-10 max-w-4xl mx-auto flex-1 flex flex-col">
          <section className="flex-1 space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-surface-container-lowest/80 backdrop-blur-md py-4 z-20 border-b border-outline-variant/20 mb-6">
              <h2 className="font-manrope text-[24px] font-semibold text-primary">
                Transaction History
              </h2>
              <div className="flex gap-2">
                <button className="bg-surface border border-outline-variant/30 text-primary px-4 py-2 rounded-lg font-inter text-[14px] font-medium hover:bg-primary/5 transition-all flex items-center gap-2">
                  <FilterOutlined className="text-[16px]" /> Filter
                </button>
                <button className="bg-surface border border-outline-variant/30 text-primary px-4 py-2 rounded-lg font-inter text-[14px] font-medium hover:bg-primary/5 transition-all flex items-center gap-2">
                  <DownloadOutlined className="text-[16px]" /> Statement
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="py-20">
                  <Empty description="No transactions yet" />
                </div>
              ) : (
                transactions.map((tx) => {
                  const details = getTxDetails(tx.type);
                  const isPositive = details.sign === "+";
                  const statusColor =
                    tx.status === "completed"
                      ? "bg-success-emerald/10 text-success-emerald"
                      : tx.status === "pending"
                        ? "bg-primary-container/10 text-primary"
                        : "bg-error/10 text-error";

                  return (
                    <div
                      key={tx.id}
                      className="group relative bg-surface border border-outline-variant/20 rounded-2xl p-5 transition-all hover:border-primary/40 hover:shadow-md cursor-pointer overflow-hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full ${details.bg} flex items-center justify-center text-xl flex-none ${details.color}`}
                        >
                          {details.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-inter text-[14px] font-medium text-on-surface truncate">
                              {details.title}
                            </h4>
                            <span
                              className={`font-inter text-[14px] font-semibold ${isPositive ? "text-success-emerald" : "text-on-surface-variant"}`}
                            >
                              {details.sign}
                              {tx.currency === "credit"
                                ? `${Math.abs(tx.amount).toFixed(2)} Credits`
                                : formatCurrency(tx.amount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-on-surface-variant font-inter text-[12px] font-medium">
                              {tx.description || "Transaction"} •{" "}
                              {new Date(tx.created_at).toLocaleDateString(
                                "en-NG",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${statusColor}`}
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details on Hover */}
                      <div className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-5 transition-all duration-300 overflow-hidden border-t border-outline-variant/10 pt-4 flex gap-8">
                        <div>
                          <p className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
                            Reference ID
                          </p>
                          <p className="font-inter text-[14px] font-mono text-on-surface mt-1">
                            {tx.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
                            Type
                          </p>
                          <p className="font-inter text-[14px] text-on-surface mt-1">
                            {details.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Add Funds Modal */}
      <Modal
        title="Add Funds to Wallet"
        open={isAddFundsOpen}
        onCancel={() => setIsAddFundsOpen(false)}
        footer={null}
        destroyOnHidden
        styles={{
          body: { borderRadius: "16px", padding: "32px" },
        }}
      >
        <div className="py-4">
          <p className="font-inter text-base text-on-surface-variant block mb-6">
            Enter the amount you want to deposit via Paystack.
          </p>
          <InputNumber
            size="large"
            className="w-full! h-12! rounded-lg! text-lg! font-inter!"
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
            onClick={handleRealPayment}
            className="mt-6! h-12! rounded-lg! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium!"
          >
            Proceed to Paystack
          </Button>
          <p className="text-on-surface-variant text-xs block text-center mt-4 font-inter">
            *Currently simulating payment for testing.
          </p>
        </div>
      </Modal>

      <BuyCreditsModal
        open={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        onSuccess={fetchWalletData}
      />
    </div>
  );
}
