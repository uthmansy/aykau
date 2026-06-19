"use client";

import { useState, useEffect } from "react";
import { Input, Button, Upload, App, Select, Switch } from "antd";
import { EditOutlined, CheckCircleFilled } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import {
  getStates,
  getLgasByState,
  getLgaById,
  formatLgaOptions,
} from "@/lib/helpers/location";
import MapPinSelector from "@/components/ui/MapPinSelector";

const { TextArea } = Input;

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string | null;
  city: string;
  state_code: string;
  lga_id: number | null;
  lga_name: string;
  post_code: string;
  address_preference: string;
  coordinates: { lat: number; lng: number } | null;
}

export default function ProfileSettings() {
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    avatar_url: null,
    city: "",
    state_code: "",
    lga_id: null,
    lga_name: "",
    post_code: "",
    address_preference: "on-request",
    coordinates: null,
  });
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      const profileData: ProfileData = {
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url,
        city: data.city || "",
        state_code: data.state_code || "",
        lga_id: data.lga_id || null,
        lga_name: data.lga_name || "",
        post_code: data.post_code || "",
        address_preference: data.address_preference || "on-request",
        coordinates: data.coordinates || null,
      };
      setFormData(profileData);
      setOriginalData(profileData);
    } catch (error) {
      message.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!userId) return;
    setAvatarUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      setFormData({ ...formData, avatar_url: urlData.publicUrl });
      message.success("Avatar uploaded successfully!");
    } catch (error: any) {
      message.error("Failed to upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          city: formData.city,
          state_code: formData.state_code,
          lga_id: formData.lga_id,
          lga_name: formData.lga_name,
          post_code: formData.post_code,
          address_preference: formData.address_preference,
          coordinates: formData.coordinates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) throw error;
      message.success("Profile updated successfully!");
      setOriginalData(formData);
    } catch (error: any) {
      message.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    originalData && JSON.stringify(formData) !== JSON.stringify(originalData);

  // ✅ Shared Design System Classes
  const inputClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! h-12! px-4! font-inter! text-[16px]! text-on-surface! focus:ring-1! focus:ring-primary/30!";
  const textAreaClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! py-3! px-4! font-inter! text-[16px]! text-on-surface! focus:ring-1! focus:ring-primary/30! resize-none!";
  const selectClasses =
    "w-full! [&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-12! [&_.ant-select-selector]:shadow-none! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[16px]!";
  const labelClass =
    "font-inter text-[14px] font-medium text-on-surface mb-1.5 block";
  const sectionHeaderClass =
    "font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant";

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-container rounded-lg w-1/3"></div>
          <div className="h-32 bg-surface-container rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header Card (Glassmorphism) */}
      <div className="bg-surface-glass backdrop-blur-glass border border-white/20 shadow-[var(--shadow-level-1)] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl font-manrope font-bold text-primary">
                  {formData.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              handleAvatarUpload(file);
              return false;
            }}
            accept="image/*"
          >
            <button
              disabled={avatarUploading}
              className="absolute bottom-1 right-1 bg-secondary text-on-secondary p-2.5 rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95"
            >
              <EditOutlined className="text-sm" />
            </button>
          </Upload>
        </div>

        <div className="text-center md:text-left flex-grow">
          <h2 className="font-manrope text-[32px] font-semibold text-primary leading-tight mb-1">
            {formData.full_name || "Your Name"}
          </h2>
          <p className="font-inter text-[16px] text-on-surface-variant">
            Professional Profile
          </p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-inter text-[12px] font-bold uppercase tracking-wider">
              PRO PROVIDER
            </span>
            <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full font-inter text-[12px] font-bold uppercase tracking-wider">
              MEMBER SINCE 2024
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Button
            type="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanges}
            className="rounded-lg! h-auto! py-3! px-8! bg-secondary! hover:bg-secondary/90! border-none! text-on-secondary! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
        <div className="px-8 py-5 border-b border-outline-variant/20 bg-surface-container-low/30">
          <h3 className={sectionHeaderClass}>Personal Information</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col">
            <label className={labelClass}>Full Name</label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              placeholder="Enter your full name"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Email Address</label>
            <div className="relative">
              <Input
                value={formData.email}
                disabled
                placeholder="name@example.com"
                className={`${inputClasses} opacity-70! pr-10!`}
              />
              <CheckCircleFilled className="absolute right-4 top-1/2 -translate-y-1/2 text-success-emerald text-lg" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Phone Number</label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+234 800 000 0000"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>State</label>
            <Select
              value={formData.state_code || undefined}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  state_code: val,
                  lga_id: null,
                  lga_name: "",
                  coordinates: null,
                })
              }
              placeholder="Select state"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={getStates().map((s) => ({
                value: s.code,
                label: s.name,
              }))}
              className={selectClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Local Government Area</label>
            <Select
              value={formData.lga_id || undefined}
              onChange={(val) => {
                const lga = getLgaById(val);
                if (lga) {
                  setFormData({
                    ...formData,
                    lga_id: val,
                    lga_name: lga.name,
                    coordinates: { lat: lga.latitude, lng: lga.longitude },
                  });
                }
              }}
              placeholder={
                formData.state_code
                  ? "Search or select LGA"
                  : "Select a state first"
              }
              disabled={!formData.state_code}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={
                formData.state_code
                  ? formatLgaOptions(getLgasByState(formData.state_code))
                  : []
              }
              className={selectClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>City / Area (optional)</label>
            <Input
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="e.g. Ikeja, Lekki, Garki"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Post Code</label>
            <Input
              value={formData.post_code}
              onChange={(e) =>
                setFormData({ ...formData, post_code: e.target.value })
              }
              placeholder="e.g. 450001"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className={labelClass}>Address Preference</label>
            <Select
              value={formData.address_preference}
              onChange={(val) =>
                setFormData({ ...formData, address_preference: val })
              }
              placeholder="How do you prefer to share your address?"
              options={[
                {
                  value: "on-request",
                  label: "Share only when I accept a professional",
                },
                {
                  value: "after-booking",
                  label: "Share after booking is confirmed",
                },
                {
                  value: "landmark",
                  label: "Share landmark only (no exact address)",
                },
              ]}
              className={selectClasses}
            />
          </div>
          {formData.coordinates && (
            <div className="md:col-span-2 bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center gap-2">
              <span className="text-primary">📍</span>
              <span className="font-inter text-[12px] text-on-surface-variant">
                Coordinates: {formData.coordinates.lat.toFixed(4)},{" "}
                {formData.coordinates.lng.toFixed(4)}
              </span>
            </div>
          )}
          <div className="md:col-span-2">
            <label className={labelClass}>Map Location</label>
            <MapPinSelector
              value={formData.coordinates || undefined}
              onChange={(coords) =>
                setFormData((prev) => ({ ...prev, coordinates: coords }))
              }
              defaultCoords={formData.coordinates || undefined}
              height="300px"
            />
            <p className="font-inter text-[12px] text-on-surface-variant mt-2">
              Drag the map to adjust your exact location
            </p>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className={labelClass}>Bio</label>
            <TextArea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself and your expertise..."
              rows={4}
              maxLength={500}
              showCount
              className={textAreaClasses}
            />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
        <div className="px-8 py-5 border-b border-outline-variant/20 bg-surface-container-low/30">
          <h3 className={sectionHeaderClass}>Global Preferences</h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-inter text-[16px] font-semibold text-on-surface mb-1">
                Public Profile
              </h4>
              <p className="font-inter text-[14px] text-on-surface-variant">
                Allow others to see your professional portfolio
              </p>
            </div>
            <Switch
              defaultChecked
              className="[&_.ant-switch-checked]:bg-secondary!"
            />
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-outline-variant/20">
            <div>
              <h4 className="font-inter text-[16px] font-semibold text-on-surface mb-1">
                Marketing Communications
              </h4>
              <p className="font-inter text-[14px] text-on-surface-variant">
                Receive updates on new services and platform features
              </p>
            </div>
            <Switch className="[&_.ant-switch-checked]:bg-secondary!" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-error/20 p-6 md:p-8 bg-error/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h4 className="font-manrope text-[20px] font-semibold text-error mb-1">
            Delete Account
          </h4>
          <p className="font-inter text-[14px] text-on-surface-variant">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
        </div>
        <Button
          danger
          className="rounded-lg! h-auto! py-3! px-6! bg-error! hover:bg-error/90! border-none! text-on-error! font-inter! text-[14px]! font-medium!"
        >
          Deactivate Account
        </Button>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <Button
          type="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!hasChanges}
          className="rounded-lg! h-auto! py-3! px-8! bg-secondary! hover:bg-secondary/90! border-none! text-on-secondary! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
