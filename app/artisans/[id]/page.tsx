// app/artisans/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spin, Tag, Avatar, Empty } from "antd";
import {
  CheckCircleFilled,
  EnvironmentOutlined,
  StarFilled,
  ToolOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  CameraOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import MasonryGallery from "@/components/ui/portfolio/MasonryGallery";
import RequestQuoteButton from "@/components/ui/profile/RequestQuoteButton";
import MessageArtisanButton from "@/components/ui/profile/MessageArtisanButton";

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
      <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {/* ===== Hero Section - Glassmorphism Card ===== */}
        <section className="glass-surface rounded-xl overflow-hidden mb-10">
          {/* Gradient Banner */}
          <div className="h-40 bg-gradient-to-br from-primary/10 via-surface-container-low to-secondary/5 relative">
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-secondary/20 blur-3xl" />
              <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-primary/20 blur-2xl" />
            </div>
          </div>

          <div className="px-6 md:px-10 pb-8 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar with glass border */}
              <div className="w-36 h-36 rounded-2xl bg-surface-container-lowest border-4 border-white shadow-[var(--shadow-level-2)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {artisan.avatar_url ? (
                  <img
                    src={artisan.avatar_url}
                    alt={artisan.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-manrope font-bold text-primary">
                    {artisan.full_name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-4 md:pt-14">
                {/* Name & Verification */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="font-manrope font-bold text-3xl md:text-4xl text-on-surface tracking-tight m-0">
                    {artisan.full_name}
                  </h1>
                  {artisan.is_verified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success font-inter font-bold text-xs uppercase tracking-wider">
                      <CheckCircleFilled />
                      Verified Pro
                    </span>
                  )}
                </div>

                {/* Profession Tags */}
                {professions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {professions.map((prof) => (
                      <span
                        key={prof}
                        className="px-3 py-1 rounded-full bg-primary/5 text-primary font-inter font-semibold text-xs capitalize border border-primary/10"
                      >
                        {prof}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta Info Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5">
                  {artisan.city && (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <EnvironmentOutlined className="text-base text-on-surface-variant/70" />
                      <span className="font-inter text-sm">
                        {artisan.city}
                        {artisan.state_code ? `, ${artisan.state_code}` : ""}
                      </span>
                    </div>
                  )}

                  {artisan.total_reviews > 0 && (
                    <div className="flex items-center gap-2">
                      {renderStars(artisan.average_rating)}
                      <span className="font-inter font-bold text-on-surface text-sm">
                        {artisan.average_rating.toFixed(1)}
                      </span>
                      <span className="font-inter text-on-surface-variant text-sm">
                        ({artisan.total_reviews} reviews)
                      </span>
                    </div>
                  )}

                  {experience && (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <TrophyOutlined className="text-base text-secondary" />
                      <span className="font-inter text-sm">
                        {experience} experience
                      </span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {artisan.bio && (
                  <p className="font-inter text-base text-on-surface-variant leading-relaxed max-w-3xl mb-6">
                    {artisan.bio}
                  </p>
                )}

                {/* Action Buttons */}
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

        {/* ===== Stats & Skills Grid ===== */}
        {(skills.length > 0 || hourlyRate || experience) && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Skills Card */}
            {skills.length > 0 && (
              <div className="md:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 shadow-[var(--shadow-level-1)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-primary/10 rounded-lg">
                    <ToolOutlined className="text-primary text-lg" />
                  </div>
                  <h3 className="font-inter font-semibold text-xs uppercase tracking-wider text-on-surface-variant m-0">
                    Skills & Expertise
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-surface-container rounded-full text-on-surface font-inter text-sm font-medium border border-outline-variant/20 capitalize hover:border-primary/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rate & Experience Cards */}
            <div className="space-y-4">
              {hourlyRate && (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5 shadow-[var(--shadow-level-1)]">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarOutlined className="text-secondary text-lg" />
                    <span className="font-inter text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Hourly Rate
                    </span>
                  </div>
                  <p className="font-manrope text-3xl font-bold text-on-surface m-0">
                    ₦{Number(hourlyRate).toLocaleString()}
                    <span className="text-sm font-normal text-on-surface-variant ml-1">
                      /hr
                    </span>
                  </p>
                </div>
              )}
              {experience && (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5 shadow-[var(--shadow-level-1)]">
                  <div className="flex items-center gap-2 mb-3">
                    <ClockCircleOutlined className="text-primary text-lg" />
                    <span className="font-inter text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Experience
                    </span>
                  </div>
                  <p className="font-manrope text-3xl font-bold text-on-surface m-0">
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

        {/* ===== Services Offered ===== */}
        {artisan.preferred_subcategories &&
          artisan.preferred_subcategories.length > 0 && (
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 mb-10 shadow-[var(--shadow-level-1)]">
              <h3 className="font-inter font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-5">
                Services Offered
              </h3>
              <div className="flex flex-wrap gap-2">
                {artisan.preferred_subcategories.map((sub) => (
                  <span
                    key={sub}
                    className="px-4 py-2 rounded-full bg-primary/5 text-primary font-inter text-sm font-medium border border-primary/10 hover:bg-primary/10 transition-colors"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </section>
          )}

        {/* ===== Portfolio Section ===== */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <CameraOutlined className="text-primary text-xl" />
              </div>
              <div>
                <h2 className="font-manrope font-bold text-xl text-on-surface m-0">
                  Portfolio & Past Work
                </h2>
                <p className="font-inter text-sm text-on-surface-variant m-0">
                  {projects.length} project{projects.length !== 1 ? "s" : ""}{" "}
                  completed
                </p>
              </div>
            </div>
          </div>
          <MasonryGallery projects={projects} />
        </section>

        {/* ===== Reviews Section ===== */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <StarFilled className="text-secondary text-xl" />
              </div>
              <div>
                <h2 className="font-manrope font-bold text-xl text-on-surface m-0">
                  Customer Reviews
                </h2>
                <p className="font-inter text-sm text-on-surface-variant m-0">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""} from
                  verified customers
                </p>
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-12 text-center shadow-[var(--shadow-level-1)]">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="font-inter text-on-surface-variant">
                    No reviews yet. Be the first to hire{" "}
                    {artisan.full_name.split(" ")[0]}!
                  </span>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={review.customer_avatar}
                        size={48}
                        className="bg-primary/10! text-primary! font-manrope! font-bold!"
                      >
                        {review.customer_name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <span className="font-inter font-semibold text-on-surface block text-sm">
                          {review.customer_name}
                        </span>
                        <span className="font-inter text-xs text-on-surface-variant block">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    {renderStars(review.rating, "text-sm")}
                  </div>
                  {review.comment && (
                    <p className="font-inter text-sm text-on-surface leading-relaxed m-0 italic">
                      &ldquo;{review.comment}&rdquo;
                    </p>
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
