// components/jobs/DrawerFooter.tsx
import { Button } from "antd";
import { MessageOutlined, UnlockOutlined } from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import Link from "next/link";

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

  if (job.is_expired) return null;

  return (
    <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-4">
      {isArtisanViewer && !isUnlocked ? (
        <div className="space-y-2">
          <Button
            type="primary"
            size="large"
            block
            icon={<UnlockOutlined />}
            onClick={onUnlock}
            loading={loadingUnlock}
            className="bg-gray-900 hover:bg-gray-800 border-0 h-12 text-base font-medium rounded-lg shadow-sm"
          >
            Unlock & Send Quote ({job.credit_cost || 10} Credits)
          </Button>
          <p className="text-xs text-gray-400 text-center">
            Unlock to view client contact and send your quote
          </p>
        </div>
      ) : (
        <Link href={`jobs/send-quote/${job.id}`}>
          <Button
            type="primary"
            size="large"
            block
            className="bg-gray-900 hover:bg-gray-800 border-0 h-12 text-base font-medium rounded-lg shadow-sm"
            icon={<MessageOutlined />}
          >
            Send Quote to {posterName}
          </Button>
        </Link>
      )}
    </div>
  );
}
