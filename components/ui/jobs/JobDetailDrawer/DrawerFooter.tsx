"use client";

import { Button } from "antd";
import { MessageOutlined, UnlockOutlined } from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import Link from "next/link";
import useJobCreditCost from "@/hooks/useJobCreditCost";

interface Props {
  job: JobListing;
  isUnlocked: boolean;
  isArtisanViewer: boolean;
  onUnlock: () => void;
  loadingUnlock: boolean;
}

export default function DrawerFooter({
  job,
  isUnlocked,
  isArtisanViewer,
  onUnlock,
  loadingUnlock,
}: Props) {
  const posterName = job.poster?.full_name || job.poster?.username || "Client";
  const creditCost = useJobCreditCost(job);

  if (job.is_expired) return null;

  return (
    <div className="sticky bottom-0 z-10 bg-surface-glass backdrop-blur-glass border-t border-outline-variant/30 px-6 py-4">
      {isArtisanViewer && !isUnlocked ? (
        <div className="space-y-2">
          <Button
            type="primary"
            size="large"
            block
            icon={<UnlockOutlined />}
            onClick={onUnlock}
            loading={loadingUnlock}
            className="rounded-lg! h-auto! py-3.5! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[16px]! font-medium! shadow-lg! shadow-secondary/20!"
          >
            Unlock & Send Quote ({creditCost} Credits)
          </Button>
          <p className="font-inter text-[12px] text-outline text-center">
            Unlock to view client contact and send your quote
          </p>
        </div>
      ) : (
        <Link href={`/dashboard/jobs/send-quote/${job.id}`}>
          <Button
            type="primary"
            size="large"
            block
            icon={<MessageOutlined />}
            className="rounded-lg! h-auto! py-3.5! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[16px]! font-medium! shadow-lg! shadow-secondary/20!"
          >
            Send Quote to {posterName}
          </Button>
        </Link>
      )}
    </div>
  );
}
