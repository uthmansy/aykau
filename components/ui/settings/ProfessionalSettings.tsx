"use client";

import { useState, useEffect } from "react";
import { Input, Button, Select, App, Tag } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";

interface ProfessionalData {
  skills: string[];
  experience: string;
  hourlyRate: number | null;
  professions: string[];
  preferred_subcategories: string[];
}

export default function ProfessionalSettings() {
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);
  const userRole = useAuthStore((state) => state.user?.user_metadata?.role);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProfessionalData>({
    skills: [],
    experience: "",
    hourlyRate: null,
    professions: [],
    preferred_subcategories: [],
  });
  const [originalData, setOriginalData] = useState<ProfessionalData | null>(
    null
  );
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchCategoriesWithSubcategories().then(setCategories);
    }
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("artisan_data, preferred_subcategories")
        .eq("id", userId)
        .single();
      if (error) throw error;
      const professionalData: ProfessionalData = {
        skills: data.artisan_data?.skills || [],
        experience: data.artisan_data?.experience || "",
        hourlyRate: data.artisan_data?.hourlyRate || null,
        professions: data.artisan_data?.professions || [],
        preferred_subcategories: data.preferred_subcategories || [],
      };
      setFormData(professionalData);
      setOriginalData(professionalData);
    } catch (error) {
      message.error("Failed to load professional data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) =>
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          artisan_data: {
            skills: formData.skills,
            experience: formData.experience,
            hourlyRate: formData.hourlyRate,
            professions: formData.professions,
          },
          preferred_subcategories: formData.preferred_subcategories,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) throw error;
      message.success("Professional settings updated!");
      setOriginalData(formData);
    } catch (error: any) {
      message.error("Failed to save professional settings.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    originalData && JSON.stringify(formData) !== JSON.stringify(originalData);
  const allSubcategories = categories.flatMap(
    (c) =>
      c.subcategories?.map((s) => ({
        value: s.value,
        label: `${c.label} → ${s.label}`,
      })) || []
  );

  // ✅ Shared Design System Classes
  const inputClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! h-12! px-4! font-inter! text-[16px]! text-on-surface! focus:ring-1! focus:ring-primary/30!";
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

  if (userRole !== "artisan") {
    return (
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-12 text-center">
        <p className="font-inter text-[16px] text-on-surface-variant">
          Professional settings are only available for artisans.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Skills & Expertise */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
        <div className="px-8 py-5 border-b border-outline-variant/20 bg-surface-container-low/30">
          <h3 className={sectionHeaderClass}>Skills & Expertise</h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex flex-col">
            <label className={labelClass}>Add Skills</label>
            <div className="flex gap-3">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onPressEnter={handleAddSkill}
                placeholder="e.g., Plumbing, Electrical, Carpentry"
                className={`${inputClasses} flex-1`}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddSkill}
                className="rounded-lg! h-12! px-6! bg-primary! hover:bg-primary/90! border-none! text-on-primary! font-inter! text-[14px]! font-medium!"
              >
                Add
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <Tag
                key={skill}
                closable
                onClose={() => handleRemoveSkill(skill)}
                className="rounded-full! bg-primary/10! text-primary! border-0! font-inter! text-[12px]! font-medium! px-3! py-1!"
              >
                {skill}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      {/* Experience & Pricing */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
        <div className="px-8 py-5 border-b border-outline-variant/20 bg-surface-container-low/30">
          <h3 className={sectionHeaderClass}>Experience & Pricing</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col">
            <label className={labelClass}>Years of Experience</label>
            <Input
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              placeholder="e.g., 5+, 10+"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Hourly Rate (₦)</label>
            <Input
              type="number"
              value={formData.hourlyRate || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hourlyRate: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="e.g., 5000"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Preferred Services */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
        <div className="px-8 py-5 border-b border-outline-variant/20 bg-surface-container-low/30">
          <h3 className={sectionHeaderClass}>Preferred Services</h3>
        </div>
        <div className="p-8">
          <div className="flex flex-col">
            <label className={labelClass}>
              Select services you want to receive notifications for
            </label>
            <Select
              mode="multiple"
              value={formData.preferred_subcategories}
              onChange={(val) =>
                setFormData({ ...formData, preferred_subcategories: val })
              }
              placeholder="Select services"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={allSubcategories}
              className={selectClasses}
            />
            <span className="font-inter text-[12px] text-outline mt-2 block">
              You'll receive email alerts when customers post jobs matching
              these services.
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="primary"
          icon={<SaveOutlined />}
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
