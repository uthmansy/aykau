"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Tabs, App, Skeleton, Tag } from "antd";
import {
  StarOutlined,
  WalletOutlined,
  CreditCardOutlined,
  CheckCircleFilled,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

interface CreditPackage {
  id: string;
  name: string;
  credits_amount: number;
  price_naira: number;
  discount_percentage: number;
  display_order: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  jobId?: string;
}

export default function BuyCreditsModal({
  open,
  onClose,
  onSuccess,
  jobId,
}: Props) {
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);
  const userEmail = useAuthStore((state) => state.user?.email);

  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null
  );
  const [fiatBalance, setFiatBalance] = useState<number>(0);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [activeTab, setActiveTab] = useState<"fiat" | "paystack">("paystack");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchPackages();
      fetchWalletBalances();
      setPurchaseSuccess(false);
      setSelectedPackage(null);
    }
  }, [open, userId]);

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const { data } = await supabase
        .from("credit_packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setPackages(data || []);
      if (data && data.length > 0)
        setSelectedPackage(data.length > 1 ? data[1] : data[0]);
    } catch (error) {
      message.error("Failed to load credit packages.");
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchWalletBalances = async () => {
    try {
      const { data } = await supabase
        .from("wallets")
        .select("fiat_balance, credit_balance")
        .eq("user_id", userId)
        .single();
      setFiatBalance(Number(data?.fiat_balance || 0));
      setCreditBalance(Number(data?.credit_balance || 0));
    } catch (error) {}
  };

  const handleFiatPurchase = async () => {
    if (!selectedPackage || fiatBalance < selectedPackage.price_naira) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("buy_credits_with_fiat", {
        p_package_id: selectedPackage.id,
      });
      if (error) throw error;
      message.success(`${selectedPackage.credits_amount} credits added!`);
      setPurchaseSuccess(true);
      fetchWalletBalances();
      onSuccess?.();
      setTimeout(() => onClose(), 2000);
    } catch (error: any) {
      message.error("Failed to purchase credits.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPurchase = async () => {
    if (!selectedPackage) return;
    setLoading(true);
    try {
      let callbackUrl = `${window.location.origin}/dashboard/payment/processing?intent=credit_purchase`;
      if (jobId) callbackUrl += `&unlock_job=${jobId}`;
      const { data, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            amount: selectedPackage.price_naira,
            email: userEmail,
            callback_url: callbackUrl,
            metadata: {
              user_id: userId,
              type: "credit_purchase",
              credits_amount: selectedPackage.credits_amount,
            },
          },
        }
      );
      if (error) throw error;
      window.location.href = data.authorizationUrl;
    } catch (error: any) {
      message.error("Failed to initialize payment.");
      setLoading(false);
    }
  };

  const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
  const getEffectivePricePerCredit = (pkg: CreditPackage) =>
    Math.round(pkg.price_naira / pkg.credits_amount);

  if (purchaseSuccess) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={440}
        centered
        styles={{
          body: {
            borderRadius: "16px",
            padding: "40px",
          },
        }}
      >
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-success-emerald/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircleFilled className="text-5xl text-success-emerald" />
          </div>
          <h3 className="font-manrope text-[24px] font-semibold text-primary mb-3">
            Purchase Successful!
          </h3>
          <p className="font-inter text-base text-on-surface-variant mb-8">
            {selectedPackage?.credits_amount} credits have been added to your
            wallet.
          </p>
          <div className="bg-surface-container rounded-2xl p-6 inline-block w-full max-w-xs">
            <p className="font-inter text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
              New Credit Balance
            </p>
            <p className="font-manrope text-[32px] font-bold text-primary">
              {creditBalance + (selectedPackage?.credits_amount || 0)}
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      styles={{
        body: {
          padding: "32px",
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
        },
      }}
    >
      <div className="py-2">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ThunderboltOutlined className="text-2xl text-primary" />
            <h2 className="font-manrope text-[24px] font-semibold text-primary">
              Buy Credits
            </h2>
          </div>
          <p className="font-inter text-base text-on-surface-variant">
            Credits let you unlock jobs and send quotes to customers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-2">
              <StarOutlined className="text-on-surface-variant" />
              <span className="font-inter text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Credits
              </span>
            </div>
            <p className="font-manrope text-[24px] font-bold text-primary">
              {creditBalance}
            </p>
          </div>
          <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-2">
              <WalletOutlined className="text-on-surface-variant" />
              <span className="font-inter text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Fiat Balance
              </span>
            </div>
            <p className="font-manrope text-[24px] font-bold text-primary">
              {formatNaira(fiatBalance)}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-inter text-[14px] font-semibold text-on-surface mb-4">
            Select a Package
          </h3>
          {loadingPackages ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  active
                  paragraph={{ rows: 2 }}
                  className="h-32 rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                const isPopular = pkg.name.toLowerCase().includes("popular");
                const isBestValue = pkg.name.toLowerCase().includes("best");
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all w-full ${isSelected ? "border-primary bg-primary/5 shadow-md" : "border-outline-variant/30 bg-surface hover:border-primary/40"}`}
                  >
                    {(isPopular || isBestValue) && (
                      <div
                        className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isBestValue ? "bg-success-emerald text-white" : "bg-secondary text-on-secondary"}`}
                      >
                        {pkg.name}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1 mb-2 mt-1">
                      <span className="font-manrope text-[32px] font-bold text-primary">
                        {pkg.credits_amount}
                      </span>
                      <span className="font-inter text-[14px] text-on-surface-variant font-medium">
                        credits
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-manrope text-[20px] font-semibold text-on-surface">
                        {formatNaira(pkg.price_naira)}
                      </span>
                      {pkg.discount_percentage > 0 && (
                        <Tag
                          color="success"
                          className="rounded-full! border-0! text-[10px]! px-2! py-0! m-0! font-bold!"
                        >
                          {pkg.discount_percentage}% OFF
                        </Tag>
                      )}
                    </div>
                    <p className="font-inter text-[12px] text-on-surface-variant">
                      {formatNaira(getEffectivePricePerCredit(pkg))} per credit
                    </p>
                    {isSelected && (
                      <CheckCircleFilled className="absolute top-4 right-4 text-primary text-xl" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedPackage && (
          <div className="border-t border-outline-variant/30 pt-6">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as "fiat" | "paystack")}
              items={[
                {
                  key: "paystack",
                  label: (
                    <span className="flex items-center gap-2 font-inter">
                      <CreditCardOutlined /> Pay with Card/Bank
                    </span>
                  ),
                  children: (
                    <div className="space-y-5">
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <p className="font-inter text-[14px] font-medium text-primary">
                            Pay {formatNaira(selectedPackage.price_naira)} via
                            Paystack
                          </p>
                          <p className="font-inter text-[12px] text-on-surface-variant mt-1">
                            Secure payment • Instant credit delivery
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-manrope text-[24px] font-bold text-primary">
                            +{selectedPackage.credits_amount}
                          </p>
                          <p className="font-inter text-[12px] text-on-surface-variant">
                            credits
                          </p>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={loading}
                        onClick={handlePaystackPurchase}
                        className="bg-secondary! hover:bg-secondary/90! border-none! h-12! text-base! font-inter! font-medium! rounded-lg!"
                      >
                        Proceed to Paystack
                      </Button>
                    </div>
                  ),
                },
                {
                  key: "fiat",
                  label: (
                    <span className="flex items-center gap-2 font-inter">
                      <WalletOutlined /> Pay with Wallet Balance
                    </span>
                  ),
                  children: (
                    <div className="space-y-5">
                      {fiatBalance < selectedPackage.price_naira ? (
                        <div className="bg-error/5 border border-error/20 rounded-2xl p-5">
                          <p className="font-inter text-[14px] font-medium text-error mb-1">
                            Insufficient Balance
                          </p>
                          <p className="font-inter text-[12px] text-on-surface-variant">
                            You need {formatNaira(selectedPackage.price_naira)}{" "}
                            but only have {formatNaira(fiatBalance)}.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 space-y-3">
                          <div className="flex justify-between font-inter text-[14px]">
                            <span className="text-on-surface-variant">
                              Package Cost:
                            </span>
                            <span className="font-medium text-on-surface">
                              -{formatNaira(selectedPackage.price_naira)}
                            </span>
                          </div>
                          <div className="flex justify-between font-inter text-[14px]">
                            <span className="text-on-surface-variant">
                              Current Balance:
                            </span>
                            <span className="font-medium text-on-surface">
                              {formatNaira(fiatBalance)}
                            </span>
                          </div>
                          <div className="border-t border-outline-variant/30 pt-3 flex justify-between font-inter text-[14px]">
                            <span className="text-on-surface font-medium">
                              New Balance:
                            </span>
                            <span className="font-medium text-success-emerald">
                              {formatNaira(
                                fiatBalance - selectedPackage.price_naira
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={loading}
                        disabled={fiatBalance < selectedPackage.price_naira}
                        onClick={handleFiatPurchase}
                        className="bg-secondary! hover:bg-secondary/90! border-none! h-12! text-base! font-inter! font-medium! rounded-lg! disabled:bg-outline-variant! disabled:text-on-surface-variant!"
                      >
                        Confirm Purchase
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
