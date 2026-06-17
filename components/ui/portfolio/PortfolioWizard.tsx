// components/portfolio/PortfolioWizard.tsx
"use client";

import { useState, useRef } from "react";
import { Button, Input, Select, App } from "antd";
import {
  CloudUploadOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

const { TextArea } = Input;

interface Props {
  onSuccess: () => void;
  currentCount: number;
  existingItems: any[];
}

interface UploadedFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

export default function PortfolioWizard({
  onSuccess,
  currentCount,
  existingItems,
}: Props) {
  const { message, modal } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  // Step 1: Media Upload
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Step 2: Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Step 3: Category
  const [category, setCategory] = useState("");

  const CATEGORIES = [
    "Kitchen Remodel",
    "Bathroom Fix",
    "Electrical Wiring",
    "Plumbing",
    "Painting",
    "Carpentry",
    "Landscaping",
    "Other",
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalFiles = uploadedFiles.length + files.length;
    if (totalFiles > 5) {
      return message.error(
        "You can upload a maximum of 5 media files per project."
      );
    }

    const newFiles: UploadedFile[] = [];
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        message.warning(`${file.name} is not a valid image or video file.`);
        continue;
      }
      if (isImage && file.size > 10 * 1024 * 1024) {
        message.warning(`${file.name} is too large. Max 10MB for images.`);
        continue;
      }
      if (isVideo && file.size > 50 * 1024 * 1024) {
        message.warning(`${file.name} is too large. Max 50MB for videos.`);
        continue;
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      });
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const canProceed = () => {
    if (currentStep === 1) return uploadedFiles.length > 0;
    if (currentStep === 2) return title.trim().length > 0;
    if (currentStep === 3) return category.length > 0;
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) {
      if (currentStep === 1)
        return message.warning("Please upload at least one file.");
      if (currentStep === 2)
        return message.warning("Please enter a project title.");
      if (currentStep === 3)
        return message.warning("Please select a category.");
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!userId || uploadedFiles.length === 0) return;

    setUploading(true);
    try {
      const mediaArray: any[] = [];

      // Upload all files to Supabase Storage
      for (let i = 0; i < uploadedFiles.length; i++) {
        const { file, type } = uploadedFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolios")
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("portfolios")
          .getPublicUrl(filePath);

        mediaArray.push({
          type,
          file_url: urlData.publicUrl,
          thumbnail_url: null,
          display_order: i,
        });
      }

      // 🟢 Single RPC call to create project with all media
      const { error: dbError } = await supabase.rpc(
        "create_portfolio_project",
        {
          p_artisan_id: userId,
          p_title: title,
          p_description: description || null,
          p_category: category,
          p_media: mediaArray,
        }
      );

      if (dbError) throw dbError;

      message.success("Portfolio project added successfully!");

      // Reset wizard
      setUploadedFiles([]);
      setTitle("");
      setDescription("");
      setCategory("");
      setCurrentStep(1);
      onSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      message.error(error.message || "Failed to upload portfolio project.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProject = (project: any) => {
    modal.confirm({
      title: (
        <span className="font-manrope! text-primary!">Delete Project?</span>
      ),
      content: (
        <span className="font-inter!">
          Are you sure you want to delete <strong>{project.title}</strong> and
          all {project.media.length} media files?
        </span>
      ),
      okText: "Yes, Delete",
      okButtonProps: {
        className: "bg-error! border-error! hover:bg-error/90!",
      },
      cancelButtonProps: { className: "border-outline! text-on-surface!" },
      onOk: async () => {
        try {
          const { error } = await supabase.rpc("delete_portfolio_project", {
            p_id: project.id,
          });
          if (error) throw error;
          message.success("Project deleted successfully!");
          onSuccess();
        } catch (error: any) {
          message.error(error.message || "Failed to delete project.");
        }
      },
    });
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-primary mb-3 font-manrope">
          Add to Portfolio
        </h1>
        <p className="text-on-surface-variant max-w-xl mx-auto font-inter">
          Complete the steps below to showcase your professional achievements.
        </p>
      </div>

      {/* Wizard Container */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden mb-16">
        {/* Progress Stepper */}
        <div className="bg-surface-container-low/50 border-b border-outline-variant/30 px-8 py-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= 1
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant"
                }`}
              >
                {currentStep > 1 ? <CheckCircleFilled /> : "1"}
              </div>
              <span
                className={`text-xs font-bold ${currentStep >= 1 ? "text-primary" : "text-on-surface-variant"}`}
              >
                Upload Media
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-4 ${currentStep > 1 ? "bg-primary" : "bg-outline-variant"}`}
            />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= 2
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant"
                }`}
              >
                {currentStep > 2 ? <CheckCircleFilled /> : "2"}
              </div>
              <span
                className={`text-xs font-bold ${currentStep >= 2 ? "text-primary" : "text-on-surface-variant"}`}
              >
                Details
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-4 ${currentStep > 2 ? "bg-primary" : "bg-outline-variant"}`}
            />

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= 3
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-bold ${currentStep >= 3 ? "text-primary" : "text-on-surface-variant"}`}
              >
                Category
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 md:p-12">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Step 1: Upload Media */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-primary/10 text-primary p-2 rounded-lg">
                    <CloudUploadOutlined className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-bold text-on-surface font-manrope">
                    Upload Media
                  </h2>
                </div>

                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-outline-variant rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <CloudUploadOutlined className="text-3xl text-primary" />
                    </div>
                    <p className="font-inter text-base font-medium text-on-surface mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="font-inter text-sm text-on-surface-variant">
                      PNG, JPG or MP4 (max 5 files, 10MB images, 50MB videos)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* File Previews */}
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedFiles.map((item, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden bg-surface-container border border-outline-variant/30"
                        >
                          {item.type === "video" ? (
                            <div className="aspect-video relative">
                              <video
                                src={item.preview}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <PlayCircleOutlined className="text-3xl text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.preview}
                              alt="Preview"
                              className="aspect-video w-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <DeleteOutlined className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-primary/10 text-primary p-2 rounded-lg">
                    <FileTextOutlined className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-bold text-on-surface font-manrope">
                    Project Details
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-on-surface font-inter">
                      Project Title <span className="text-secondary">*</span>
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Modern Kitchen Remodel"
                      className="rounded-lg! h-11! border-outline-variant! hover:border-primary! focus:border-primary!"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-on-surface font-inter">
                      Description
                    </label>
                    <TextArea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe the work done..."
                      rows={5}
                      className="rounded-lg! border-outline-variant! hover:border-primary! focus:border-primary! resize-none!"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Category */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-primary/10 text-primary p-2 rounded-lg">
                    <AppstoreOutlined className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-bold text-on-surface font-manrope">
                    Category
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-on-surface font-inter">
                      Select Category <span className="text-secondary">*</span>
                    </label>
                    <Select
                      value={category || undefined}
                      onChange={(val) => setCategory(val)}
                      placeholder="Choose a category"
                      options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                      className="w-full! rounded-lg!"
                      size="large"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
                    <h3 className="font-manrope font-semibold text-on-surface mb-4">
                      Project Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">
                          Media Files:
                        </span>
                        <span className="font-semibold text-on-surface">
                          {uploadedFiles.length} items
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Title:</span>
                        <span className="font-semibold text-on-surface">
                          {title}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">
                          Category:
                        </span>
                        <span className="font-semibold text-on-surface">
                          {category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-outline-variant/30">
              {currentStep > 1 && (
                <Button
                  onClick={handlePrevious}
                  className="flex-1! rounded-lg! h-12! border-outline! text-on-surface! font-bold! hover:bg-surface-container! font-inter!"
                >
                  <LeftOutlined /> Previous
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="primary"
                  onClick={handleNext}
                  className="flex-[2]! rounded-lg! h-12! bg-secondary! border-secondary! font-bold! shadow-lg! shadow-secondary/20! hover:bg-secondary/90! font-inter!"
                >
                  Next Step <RightOutlined />
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={uploading}
                  className="flex-[2]! rounded-lg! h-12! bg-secondary! border-secondary! font-bold! shadow-lg! shadow-secondary/20! hover:bg-secondary/90! font-inter!"
                >
                  {uploading ? "Uploading..." : "Save Project"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Gallery Section */}
      {existingItems.length > 0 && (
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-primary font-manrope">
                Your Projects
              </h2>
              <span className="bg-surface-container text-on-surface-variant text-xs font-bold px-2 py-0.5 rounded-full">
                {currentCount}/10
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {existingItems.slice(0, 4).map((project) => {
              const coverMedia = project.media[0];
              const mediaCount = project.media.length;

              return (
                <article
                  key={project.id}
                  className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex group hover:shadow-md transition-all duration-300"
                >
                  <div className="w-32 sm:w-40 flex-shrink-0 relative overflow-hidden bg-surface-container">
                    {coverMedia?.type === "video" ? (
                      <>
                        {coverMedia.thumbnail_url ? (
                          <img
                            src={coverMedia.thumbnail_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <PlayCircleOutlined className="text-3xl text-primary/50" />
                          </div>
                        )}
                      </>
                    ) : (
                      <img
                        src={coverMedia?.file_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}

                    {mediaCount > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        {mediaCount}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-on-surface truncate pr-2 font-inter">
                        {project.title}
                      </h3>
                      {project.category && (
                        <span className="text-[9px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded uppercase whitespace-nowrap">
                          {project.category}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-[12px] text-on-surface-variant line-clamp-2 mb-3 leading-tight font-inter">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-auto flex gap-2">
                      <button className="flex-1 py-1.5 px-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded text-[11px] font-bold text-on-surface-variant transition font-inter">
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="flex-1 py-1.5 px-3 bg-error/5 hover:bg-error/10 border border-error/20 rounded text-[11px] font-bold text-error transition font-inter"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
