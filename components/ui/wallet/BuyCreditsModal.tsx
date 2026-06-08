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

  // Fetch packages and wallet balances
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
      const { data, error } = await supabase
        .from("credit_packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPackages(data || []);

      // Auto-select the "Popular" package (second one) or first one
      if (data && data.length > 0) {
        setSelectedPackage(data.length > 1 ? data[1] : data[0]);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      message.error("Failed to load credit packages.");
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchWalletBalances = async () => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("fiat_balance, credit_balance")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setFiatBalance(Number(data?.fiat_balance || 0));
      setCreditBalance(Number(data?.credit_balance || 0));
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  // Pay with Fiat Balance
  const handleFiatPurchase = async () => {
    if (!selectedPackage) return;

    if (fiatBalance < selectedPackage.price_naira) {
      message.error("Insufficient fiat balance. Please add funds first.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc("buy_credits_with_fiat", {
        p_package_id: selectedPackage.id,
      });

      if (error) throw error;

      message.success(
        `${selectedPackage.credits_amount} credits added to your wallet!`
      );
      setPurchaseSuccess(true);
      fetchWalletBalances();
      onSuccess?.();

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Purchase error:", error);
      if (error.message?.includes("insufficient_fiat")) {
        message.error("Insufficient fiat balance.");
      } else {
        message.error("Failed to purchase credits. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Pay with Paystack
  const handlePaystackPurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    try {
      // 🟢 UPDATED: Include job ID in callback URL
      let callbackUrl =
        typeof window !== "undefined"
          ? window.location.href.split("?")[0] + "?credit_purchase=success"
          : "";

      if (jobId) {
        callbackUrl += `&unlock_job=${jobId}`;
      }

      const { data: intentData, error: intentError } =
        await supabase.functions.invoke("create-payment-intent", {
          body: {
            amount: selectedPackage.price_naira,
            email: userEmail,
            metadata: {
              user_id: userId,
              type: "credit_purchase",
              credits_amount: selectedPackage.credits_amount,
              package_name: selectedPackage.name,
              callback_url: callbackUrl, // 🟢 Updated callback URL
            },
          },
        });

      if (intentError) throw intentError;

      window.location.href = intentData.authorizationUrl;
    } catch (error: any) {
      console.error("Paystack error:", error);
      message.error("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

  const getEffectivePricePerCredit = (pkg: CreditPackage) => {
    return Math.round(pkg.price_naira / pkg.credits_amount);
  };

  // Success State
  if (purchaseSuccess) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={440} centered>
        <div className="py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircleFilled className="text-5xl text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Purchase Successful!
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedPackage?.credits_amount} credits have been added to your
            wallet.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 inline-block">
            <p className="text-sm text-gray-500 mb-1">New Credit Balance</p>
            <p className="text-3xl font-bold text-gray-900">
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
      className="buy-credits-modal"
    >
      <div className="py-2">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ThunderboltOutlined className="text-xl text-gray-900" />
            <h2 className="text-2xl font-bold text-gray-900">Buy Credits</h2>
          </div>
          <p className="text-sm text-gray-500">
            Credits let you unlock jobs and send quotes to customers.
          </p>
        </div>

        {/* Current Balances */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <StarOutlined className="text-gray-500" />
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Credits
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">{creditBalance}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <WalletOutlined className="text-gray-500" />
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Fiat Balance
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatNaira(fiatBalance)}
            </p>
          </div>
        </div>

        {/* Package Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Select a Package
          </h3>

          {loadingPackages ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  active
                  paragraph={{ rows: 2 }}
                  className="h-28 rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                const isPopular = pkg.name.toLowerCase() === "popular";
                const isBestValue = pkg.name.toLowerCase() === "best value";
                const effectivePrice = getEffectivePricePerCredit(pkg);

                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-gray-900 bg-gray-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    {/* Badge */}
                    {(isPopular || isBestValue) && (
                      <div
                        className={`absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          isBestValue
                            ? "bg-green-600 text-white"
                            : "bg-gray-900 text-white"
                        }`}
                      >
                        {pkg.name}
                      </div>
                    )}

                    {/* Credits Amount */}
                    <div className="flex items-baseline gap-1 mb-1 mt-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {pkg.credits_amount}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        credits
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatNaira(pkg.price_naira)}
                      </span>
                      {pkg.discount_percentage > 0 && (
                        <Tag
                          color="green"
                          className="text-[10px] rounded-full border-0 px-1.5 py-0 m-0"
                        >
                          {pkg.discount_percentage}% OFF
                        </Tag>
                      )}
                    </div>

                    {/* Effective Price */}
                    <p className="text-xs text-gray-500">
                      {formatNaira(effectivePrice)} per credit
                    </p>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <CheckCircleFilled className="absolute top-3 right-3 text-gray-900 text-lg" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Method Tabs */}
        {selectedPackage && (
          <div className="border-t border-gray-200 pt-5">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as "fiat" | "paystack")}
              items={[
                {
                  key: "paystack",
                  label: (
                    <span className="flex items-center gap-2">
                      <CreditCardOutlined />
                      Pay with Card/Bank
                    </span>
                  ),
                  children: (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-900 font-medium">
                            Pay {formatNaira(selectedPackage.price_naira)} via
                            Paystack
                          </p>
                          <p className="text-xs text-blue-700 mt-0.5">
                            Secure payment • Instant credit delivery
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-900">
                            +{selectedPackage.credits_amount}
                          </p>
                          <p className="text-xs text-blue-700">credits</p>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={loading}
                        onClick={handlePaystackPurchase}
                        className="bg-gray-900 hover:bg-gray-800 border-0 h-12 text-base font-medium rounded-lg"
                      >
                        Proceed to Paystack
                      </Button>
                    </div>
                  ),
                },
                {
                  key: "fiat",
                  label: (
                    <span className="flex items-center gap-2">
                      <WalletOutlined />
                      Pay with Wallet Balance
                    </span>
                  ),
                  children: (
                    <div className="space-y-4">
                      {fiatBalance < selectedPackage.price_naira ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-sm text-amber-900 font-medium mb-1">
                            Insufficient Balance
                          </p>
                          <p className="text-xs text-amber-700">
                            You need {formatNaira(selectedPackage.price_naira)}{" "}
                            but only have {formatNaira(fiatBalance)}. Please add
                            funds to your wallet first.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Package Cost:</span>
                            <span className="font-medium text-gray-900">
                              -{formatNaira(selectedPackage.price_naira)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Current Balance:
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatNaira(fiatBalance)}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                            <span className="text-gray-700 font-medium">
                              New Balance:
                            </span>
                            <span className="font-medium text-green-700">
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
                        className="bg-gray-900 hover:bg-gray-800 border-0 h-12 text-base font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
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
