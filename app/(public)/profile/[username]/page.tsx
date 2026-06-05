// app/(public)/profile/[username]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  Avatar,
  Tag,
  Button,
  Skeleton,
  Result,
  Card,
  Divider,
} from "antd";
import {
  EnvironmentOutlined,
  GlobalOutlined,
  CheckCircleFilled,
  PhoneOutlined,
  ToolOutlined, // Replaced BriefcaseOutlined
  StarOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

const { Title, Text, Paragraph } = Typography;

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const currentUser = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !data) {
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [username]);

  // --- Privacy & Formatting Helpers ---
  const showLocation = profile?.address_preference !== "on-request";
  const isArtisan =
    profile?.role === "artisan" || profile?.current_active_role === "artisan";
  const artisanData = isArtisan ? profile?.artisan_data : null;

  // --- Loading State ---
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  // --- Not Found State ---
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Result
          status="404"
          title="Profile Not Found"
          subTitle="The user you are looking for does not exist or has made their profile private."
          extra={
            <Button type="primary" onClick={() => router.push("/")}>
              Go Home
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* 1. Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar
            src={profile.avatar_url}
            size={96}
            className="bg-gray-100 text-gray-500 border-4 border-white shadow-md flex-shrink-0"
          >
            {profile.full_name?.charAt(0) || profile.username?.charAt(0)}
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Title level={2} className="!mb-0 !text-gray-900">
                {profile.full_name || profile.username}
              </Title>
              {profile.is_verified && (
                <Tag
                  color="success"
                  bordered={false}
                  className="!text-xs !px-2 !py-0.5 !rounded-full flex items-center gap-1 font-medium"
                >
                  <CheckCircleFilled /> Verified
                </Tag>
              )}
              {isArtisan && (
                <Tag
                  color="default"
                  className="!text-xs !px-2 !py-0.5 !rounded-full uppercase tracking-wide"
                >
                  Artisan
                </Tag>
              )}
            </div>

            <Text type="secondary" className="block mb-3">
              @{profile.username}
            </Text>

            {showLocation && (profile.city || profile.state_code) && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <EnvironmentOutlined className="text-gray-400" />
                <span>
                  {[profile.city, profile.lga_name, profile.state_code]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons (Only show "Message" if viewer is logged in and not viewing their own profile) */}
          {currentUser?.id && currentUser.id !== profile.id && (
            <div className="flex-shrink-0 mt-4 md:mt-0">
              <Button
                type="primary"
                size="large"
                className="!rounded-lg !h-11 !px-6 !bg-gray-900 hover:!bg-gray-800 !border-0"
                onClick={() =>
                  router.push(`/dashboard/messages?u=${profile.id}`)
                }
              >
                Send Message
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card
            className="rounded-xl shadow-sm border-gray-100"
            styles={{ body: { padding: "20px" } }}
          >
            <Title level={5} className="!mb-4 !text-gray-900">
              Contact & Details
            </Title>

            <div className="space-y-4">
              {profile.website && (
                <a
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100">
                    <GlobalOutlined className="text-gray-500" />
                  </div>
                  <span className="truncate">
                    {profile.website.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}

              {/* Phone is only shown if address preference is NOT 'on-request' */}
              {profile.phone && showLocation && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                    <PhoneOutlined className="text-gray-500" />
                  </div>
                  <span>{profile.phone}</span>
                </div>
              )}

              {!showLocation && (
                <div className="flex items-center gap-3 text-sm text-gray-500 italic">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                    <EnvironmentOutlined className="text-gray-400" />
                  </div>
                  <span>Location hidden by user</span>
                </div>
              )}
            </div>

            <Divider className="!my-5 !border-gray-100" />

            {/* Artisan Specific Quick Stats */}
            {isArtisan && artisanData && (
              <div className="space-y-3">
                {artisanData.experience_years && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <ToolOutlined className="text-gray-500" />
                    <span>
                      <strong>{artisanData.experience_years}</strong> Years
                      Experience
                    </span>
                  </div>
                )}
                {artisanData.rating && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <StarOutlined className="text-yellow-500" />
                    <span>
                      <strong>{artisanData.rating}</strong> / 5.0 Rating
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Bio & Professional Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          {profile.bio && (
            <Card
              className="rounded-xl shadow-sm border-gray-100"
              styles={{ body: { padding: "24px" } }}
            >
              <Title level={5} className="!mb-3 !text-gray-900">
                About
              </Title>
              <Paragraph className="!text-gray-600 !text-[15px] leading-relaxed whitespace-pre-wrap !mb-0">
                {profile.bio}
              </Paragraph>
            </Card>
          )}

          {/* Artisan Data / Skills Section */}
          {isArtisan && artisanData && (
            <Card
              className="rounded-xl shadow-sm border-gray-100"
              styles={{ body: { padding: "24px" } }}
            >
              <Title level={5} className="!mb-4 !text-gray-900">
                Professional Details
              </Title>

              <div className="space-y-4">
                {/* Render Skills if they exist in the JSONB */}
                {artisanData.skills &&
                  Array.isArray(artisanData.skills) &&
                  artisanData.skills.length > 0 && (
                    <div>
                      <Text
                        strong
                        className="block text-xs uppercase text-gray-500 tracking-wide mb-2"
                      >
                        Skills & Expertise
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {artisanData.skills.map(
                          (skill: string, idx: number) => (
                            <Tag
                              key={idx}
                              className="!rounded-md !px-3 !py-1 !text-sm !border-gray-200 !text-gray-700"
                            >
                              {skill}
                            </Tag>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Render any other custom artisan_data fields dynamically */}
                {Object.entries(artisanData)
                  .filter(
                    ([key]) =>
                      !["skills", "experience_years", "rating"].includes(key)
                  )
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      <Text className="text-sm text-gray-500 capitalize">
                        {key.replace(/_/g, " ")}
                      </Text>
                      <Text className="text-sm text-gray-900 font-medium sm:text-right">
                        {String(value)}
                      </Text>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {!profile.bio && (!isArtisan || !artisanData) && (
            <Card className="rounded-xl shadow-sm border-gray-100 text-center py-12">
              <Text type="secondary">
                This user has not added any additional details to their profile
                yet.
              </Text>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
