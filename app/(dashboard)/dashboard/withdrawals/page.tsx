// app/dashboard/withdrawals/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Input, Button, App, Spin } from "antd";
import { supabase } from "@/services/supabase/client";
import BalanceCard from "@/components/ui/withdrawals/BalanceCard";
import BankAccountSelector from "@/components/ui/withdrawals/BankAccountSelector";
import FeeSummary from "@/components/ui/withdrawals/FeeSummary";
import RecentPayouts from "@/components/ui/withdrawals/RecentPayouts";
import WithdrawalSidebar from "@/components/ui/withdrawals/WithdrawalSidebar";
import AddBankAccountModal from "@/components/ui/withdrawals/AddBankAccountModal";

// --- Types ---
interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  is_default: boolean;
}

interface Withdrawal {
  id: string;
  reference: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  bank_account: { bank_name: string } | null;
}

export default function WithdrawalPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const [amount, setAmount] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: walletData } = await supabase
        .from("wallets")
        .select("fiat_balance")
        .eq("user_id", user.id)
        .single();
      setWallet(walletData);

      const { data: banks } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      setBankAccounts(banks || []);
      if (banks && banks.length > 0 && !selectedBankId) {
        setSelectedBankId(
          banks.find((b: any) => b.is_default)?.id || banks[0].id
        );
      }

      // Fetch withdrawals and fix the TS type mismatch
      const { data: history } = await supabase
        .from("withdrawals")
        .select(
          `
          id, reference, amount, status, created_at, 
          bank_account:bank_account_id(bank_name)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Cast the response to fix the array vs object and string vs union type errors
      const typedHistory: Withdrawal[] = (history || []).map((item: any) => ({
        ...item,
        status: item.status as Withdrawal["status"],
        // Supabase returns relations as arrays, we take the first one
        bank_account: item.bank_account || null,
      }));

      setWithdrawals(typedHistory);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = (amt: number) => amt * 0.005;
  const currentAmount = parseFloat(amount) || 0;
  const currentFee = calculateFee(currentAmount);
  const amountToReceive = currentAmount - currentFee;

  const handleWithdraw = async () => {
    if (currentAmount < 2000)
      return message.error("Minimum withdrawal is ₦2,000");
    if (!selectedBankId) return message.error("Please select a bank account");

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc("create_withdrawal", {
        p_bank_account_id: selectedBankId,
        p_amount: currentAmount,
      });
      if (error) throw error;
      // 🟢 Trigger "Withdrawal Requested" Email
      if (user?.id && data?.reference) {
        // We invoke it without awaiting so it doesn't block the UI
        supabase.functions
          .invoke("send-withdrawal-email", {
            body: {
              user_id: user.id,
              event_type: "withdrawal_requested",
              data: {
                amount: currentAmount,
                reference: data.reference,
                bank_name: bankAccounts.find((b) => b.id === selectedBankId)
                  ?.bank_name,
              },
            },
          })
          .catch((err) => console.error("Failed to send request email:", err));
      }
      message.success("Withdrawal request submitted!");
      setAmount("");
      fetchData();
    } catch (error: any) {
      message.error(error.message || "Failed to submit withdrawal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-10 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-manrope font-bold text-primary mb-2">
          Withdraw Funds
        </h1>
        <p className="text-on-surface-variant font-inter">
          Securely transfer your earnings to your bank account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard
            availableBalance={wallet?.fiat_balance || 0}
            lifetimeEarnings={2840000}
          />

          {/* Main Form Card - NO BORDER, just soft shadow */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-8">
            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-on-surface font-inter">
                  Amount to Withdraw
                </label>
                <button
                  onClick={() =>
                    setAmount((wallet?.fiat_balance || 0).toString())
                  }
                  className="text-sm font-semibold text-secondary hover:text-secondary/80 font-inter transition-colors"
                >
                  Withdraw All
                </button>
              </div>
              <Input
                size="large"
                prefix={
                  <span className="text-on-surface-variant font-semibold mr-1">
                    ₦
                  </span>
                }
                placeholder="0.00"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                className="!rounded-lg !text-lg !font-semibold !bg-surface-container-low !border-outline-variant hover:!border-primary focus:!border-primary focus:!shadow-none"
              />
            </div>

            {/* Bank Selector */}
            <BankAccountSelector
              accounts={bankAccounts}
              selectedId={selectedBankId}
              onSelect={setSelectedBankId}
              onAddNew={() => setIsAddBankOpen(true)}
            />

            {/* Fee Summary */}
            <FeeSummary
              amount={currentAmount}
              fee={currentFee}
              netAmount={amountToReceive}
            />

            {/* CTA Button */}
            <Button
              type="primary"
              size="large"
              block
              loading={submitting}
              onClick={handleWithdraw}
              disabled={currentAmount < 2000 || !selectedBankId}
              className="!bg-secondary !border-secondary !h-14 !rounded-lg !text-base !font-bold hover:!bg-secondary/90 !shadow-[0_4px_12px_rgba(165,59,21,0.3)] transition-all"
            >
              Confirm Withdrawal
            </Button>
          </div>

          <RecentPayouts withdrawals={withdrawals} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
          <WithdrawalSidebar />
        </div>
      </div>
      <AddBankAccountModal
        open={isAddBankOpen}
        onClose={() => setIsAddBankOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
