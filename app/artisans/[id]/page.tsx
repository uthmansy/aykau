// app/artisans/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Typography, Spin, Tag, Avatar, Empty } from "antd";
import {
  CheckCircleFilled,
  EnvironmentOutlined,
  StarFilled,
  ToolOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import MasonryGallery from "@/components/ui/portfolio/MasonryGallery";
import RequestQuoteButton from "@/components/ui/profile/RequestQuoteButton";
import MessageArtisanButton from "@/components/ui/profile/MessageArtisanButton";

const { Title, Text, Paragraph } = Typography;

interface ArtisanProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  city: string | null;
  state_code: string | null;
  average_rating: number;
  total_reviews: number;
  artisan_data: {
    skills?: string[];
    experience?: string;
    hourlyRate?: number;
    professions?: string[];
  } | null;
  preferred_subcategories: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name: string;
  customer_avatar: string | null;
}

export default function PublicArtisanProfilePage() {
  const params = useParams();
  const artisanId = params.id as string;

  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (artisanId) fetchAllData();
  }, [artisanId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", artisanId)
        .single();
      setArtisan(profileData);

      const { data: portfolioData } = await supabase.rpc(
        "get_artisan_portfolio",
        {
          p_artisan_id: artisanId,
        }
      );
      setProjects(portfolioData || []);

      const { data: reviewsData } = await supabase.rpc("get_artisan_reviews", {
        p_artisan_id: artisanId,
      });
      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spin size="large" />
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Empty description="Artisan not found" />
      </div>
    );
  }

  const renderStars = (rating: number, size: string = "text-sm") => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarFilled
          key={star}
          className={`${size}! ${star <= Math.round(rating) ? "!text-secondary" : "!text-outline-variant/30"}`}
        />
      ))}
    </div>
  );

  const skills = artisan.artisan_data?.skills || [];
  const experience = artisan.artisan_data?.experience;
  const hourlyRate = artisan.artisan_data?.hourlyRate;
  const professions = artisan.artisan_data?.professions || [];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {/* Hero Section */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-br from-primary/5 via-surface-container-low to-secondary/5 relative" />

          <div className="px-8 pb-8 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 rounded-2xl bg-surface-container-lowest border-4 border-surface-container-lowest shadow-[var(--shadow-level-2)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {artisan.avatar_url ? (
                  <img
                    src={artisan.avatar_url}
                    alt={artisan.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-manrope font-bold text-primary">
                    {artisan.full_name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 pt-4 md:pt-12">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Title
                    level={2}
                    className="font-manrope font-bold text-primary mb-0!"
                  >
                    {artisan.full_name}
                  </Title>
                  {artisan.is_verified && (
                    <Tag
                      icon={<CheckCircleFilled />}
                      className="rounded-full! bg-success/10! text-success! border-0! font-inter! font-bold! text-xs! uppercase! tracking-wider!"
                    >
                      Verified Pro
                    </Tag>
                  )}
                </div>

                {professions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {professions.map((prof) => (
                      <Tag
                        key={prof}
                        className="rounded-full! bg-primary/5! text-primary! border-0! font-inter! font-semibold! text-xs! capitalize!"
                      >
                        {prof}
                      </Tag>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5">
                  {artisan.city && (
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <EnvironmentOutlined className="text-sm" />
                      <Text className="font-inter text-sm text-on-surface-variant">
                        {artisan.city}
                        {artisan.state_code ? `, ${artisan.state_code}` : ""}
                      </Text>
                    </div>
                  )}

                  {artisan.total_reviews > 0 && (
                    <div className="flex items-center gap-2">
                      {renderStars(artisan.average_rating)}
                      <Text className="font-inter font-bold text-on-surface text-sm">
                        {artisan.average_rating.toFixed(1)}
                      </Text>
                      <Text className="font-inter text-on-surface-variant text-sm">
                        ({artisan.total_reviews} reviews)
                      </Text>
                    </div>
                  )}

                  {experience && (
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <TrophyOutlined className="text-sm text-secondary" />
                      <Text className="font-inter text-sm text-on-surface-variant">
                        {experience} experience
                      </Text>
                    </div>
                  )}
                </div>

                {artisan.bio && (
                  <Paragraph className="font-inter text-base text-on-surface-variant leading-relaxed max-w-3xl mb-6!">
                    {artisan.bio}
                  </Paragraph>
                )}

                {/* Reusable Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <RequestQuoteButton
                    artisanId={artisanId}
                    artisanName={artisan.full_name}
                    preferredSubcategories={
                      artisan.preferred_subcategories || []
                    }
                    variant="primary"
                    size="large"
                  />
                  <MessageArtisanButton
                    artisanId={artisanId}
                    variant="secondary"
                    size="large"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of the page remains the same... */}
        {/* Stats & Skills Grid */}
        {(skills.length > 0 || hourlyRate || experience) && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {skills.length > 0 && (
              <div className="md:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 shadow-[var(--shadow-level-1)]">
                <div className="flex items-center gap-2 mb-4">
                  <ToolOutlined className="text-primary text-lg" />
                  <h3 className="font-manrope font-semibold text-primary text-base mb-0 uppercase tracking-wide text-label-sm">
                    Skills & Expertise
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-surface-container rounded-full text-on-surface font-inter text-xs font-medium border border-outline-variant/20 capitalize"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {hourlyRate && (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-[var(--shadow-level-1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarOutlined className="text-secondary" />
                    <span className="font-inter text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Hourly Rate
                    </span>
                  </div>
                  <p className="font-manrope text-2xl font-bold text-primary mb-0">
                    ₦{Number(hourlyRate).toLocaleString()}
                    <span className="text-sm font-normal text-on-surface-variant ml-1">
                      /hr
                    </span>
                  </p>
                </div>
              )}
              {experience && (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-[var(--shadow-level-1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockCircleOutlined className="text-primary" />
                    <span className="font-inter text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Experience
                    </span>
                  </div>
                  <p className="font-manrope text-2xl font-bold text-primary mb-0">
                    {experience}
                    <span className="text-sm font-normal text-on-surface-variant ml-1">
                      years
                    </span>
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Preferred Services */}
        {artisan.preferred_subcategories &&
          artisan.preferred_subcategories.length > 0 && (
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 mb-8 shadow-[var(--shadow-level-1)]">
              <h3 className="font-manrope font-semibold text-primary text-base mb-4 uppercase tracking-wide text-label-sm">
                Services Offered
              </h3>
              <div className="flex flex-wrap gap-2">
                {artisan.preferred_subcategories.map((sub) => (
                  <Tag
                    key={sub}
                    className="rounded-full! bg-primary/5! text-primary! border-primary/20! font-inter! text-sm! py-1! px-3!"
                  >
                    {sub}
                  </Tag>
                ))}
              </div>
            </section>
          )}

        {/* Portfolio Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ToolOutlined className="text-xl" />
              </div>
              <div>
                <Title
                  level={3}
                  className="font-manrope font-bold text-primary mb-0!"
                >
                  Portfolio & Past Work
                </Title>
                <Text className="font-inter text-sm text-on-surface-variant">
                  {projects.length} project{projects.length !== 1 ? "s" : ""}{" "}
                  completed
                </Text>
              </div>
            </div>
          </div>
          <MasonryGallery projects={projects} />
        </section>

        {/* Reviews Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                <StarFilled className="text-xl" />
              </div>
              <div>
                <Title
                  level={3}
                  className="font-manrope font-bold text-primary mb-0!"
                >
                  Customer Reviews
                </Title>
                <Text className="font-inter text-sm text-on-surface-variant">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""} from
                  verified customers
                </Text>
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-12 text-center shadow-[var(--shadow-level-1)]">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text className="font-inter text-on-surface-variant">
                    No reviews yet. Be the first to hire{" "}
                    {artisan.full_name.split(" ")[0]}!
                  </Text>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={review.customer_avatar}
                        size={44}
                        className="bg-primary/10! text-primary! font-manrope! font-bold!"
                      >
                        {review.customer_name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Text className="font-inter font-semibold text-on-surface block text-sm">
                          {review.customer_name}
                        </Text>
                        <Text className="font-inter text-xs text-on-surface-variant block">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </Text>
                      </div>
                    </div>
                    {renderStars(review.rating, "text-sm")}
                  </div>
                  {review.comment && (
                    <Paragraph className="font-inter text-sm text-on-surface leading-relaxed mb-0!">
                      "{review.comment}"
                    </Paragraph>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
