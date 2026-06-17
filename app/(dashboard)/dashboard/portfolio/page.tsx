// app/dashboard/portfolio/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Typography, App, Spin, Modal, Tag, Input, Button } from "antd";
import {
  PictureOutlined,
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import PortfolioWizard from "@/components/ui/portfolio/PortfolioWizard";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface MediaItem {
  id: string;
  type: "image" | "video";
  file_url: string;
  thumbnail_url: string | null;
  display_order: number;
}

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  created_at: string;
  media: MediaItem[];
}

export default function DashboardPortfolioPage() {
  const { message, modal } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(
    null
  );
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (userId) fetchPortfolio();
  }, [userId]);

  const fetchPortfolio = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_artisan_portfolio", {
        p_artisan_id: userId,
      });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      message.error("Failed to load portfolio items.");
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (project: PortfolioProject, startIndex: number = 0) => {
    setActiveProject(project);
    setActiveMediaIndex(startIndex);
    setLightboxOpen(true);
  };

  const openEditModal = (project: PortfolioProject) => {
    setEditingProject(project);
    setEditForm({
      title: project.title,
      description: project.description || "",
      category: project.category || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProject || !editForm.title.trim()) {
      return message.warning("Project title is required.");
    }
    setSavingEdit(true);
    try {
      const { error } = await supabase.rpc("update_portfolio_project", {
        p_id: editingProject.id,
        p_title: editForm.title,
        p_description: editForm.description || null,
        p_category: editForm.category || null,
      });
      if (error) throw error;
      message.success("Project updated successfully!");
      setEditModalOpen(false);
      fetchPortfolio();
    } catch (error: any) {
      message.error(error.message || "Failed to update project.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProject = (project: PortfolioProject) => {
    modal.confirm({
      title: (
        <span className="font-manrope! text-primary!">Delete Project?</span>
      ),
      content: (
        <span className="font-inter!">
          Are you sure you want to delete <strong>{project.title}</strong>? This
          will permanently remove all {project.media.length} associated files
          and cannot be undone.
        </span>
      ),
      okText: "Yes, Delete",
      okButtonProps: {
        className: "bg-error! border-error! hover:bg-error/90!",
      },
      cancelButtonProps: { className: "border-outline! text-on-surface!" },
      onOk: async () => {
        try {
          // 1. Extract file paths from URLs to delete from Storage
          const pathsToDelete = project.media
            .map((m) => {
              // URL format: https://.../storage/v1/object/public/portfolios/userId/fileName.ext
              const parts = m.file_url.split("/portfolios/");
              return parts.length > 1 ? parts[1] : null;
            })
            .filter(Boolean) as string[];

          // 2. Delete from Supabase Storage
          if (pathsToDelete.length > 0) {
            const { error: storageError } = await supabase.storage
              .from("portfolios")
              .remove(pathsToDelete);

            if (storageError) {
              console.warn("Storage deletion warning:", storageError);
              // We continue to DB deletion even if storage fails, to prevent orphaned DB records
            }
          }

          // 3. Delete from Database (ON DELETE CASCADE will automatically remove portfolio_media rows)
          const { error: dbError } = await supabase.rpc(
            "delete_portfolio_project",
            { p_id: project.id }
          );
          if (dbError) throw dbError;

          message.success("Project and files deleted successfully!");
          fetchPortfolio();
        } catch (error: any) {
          message.error(error.message || "Failed to delete project.");
        }
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <PortfolioWizard
            currentCount={projects.length}
            onSuccess={fetchPortfolio}
            existingItems={projects}
          />

          {/* Full Project Gallery */}
          {projects.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
                <h2 className="text-lg font-extrabold text-primary font-manrope">
                  All Projects
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => {
                  const coverMedia = project.media[0];
                  const mediaCount = project.media.length;

                  return (
                    <article
                      key={project.id}
                      className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex group hover:shadow-md transition-all duration-300"
                    >
                      {/* Cover Image / Video */}
                      <div
                        className="w-32 sm:w-40 flex-shrink-0 relative overflow-hidden bg-surface-container cursor-pointer"
                        onClick={() => openLightbox(project, 0)}
                      >
                        {coverMedia?.type === "video" ? (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <PlayCircleOutlined className="text-3xl text-primary/50" />
                          </div>
                        ) : (
                          <img
                            src={coverMedia?.file_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}

                        {mediaCount > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <PictureOutlined className="text-[10px]" />{" "}
                            {mediaCount}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col min-w-0">
                        <h3
                          className="text-sm font-bold text-on-surface truncate pr-2 font-inter mb-1 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => openLightbox(project, 0)}
                        >
                          {project.title}
                        </h3>
                        {project.category && (
                          <span className="text-[9px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded uppercase w-fit mb-2">
                            {project.category}
                          </span>
                        )}
                        {project.description && (
                          <p className="text-[12px] text-on-surface-variant line-clamp-2 leading-tight font-inter mb-3">
                            {project.description}
                          </p>
                        )}

                        <div className="mt-auto flex gap-2">
                          <Button
                            size="small"
                            icon={<PictureOutlined />}
                            onClick={() => openLightbox(project, 0)}
                            className="flex-1! rounded! border-outline! text-on-surface! hover:border-primary! hover:text-primary! font-inter! text-xs!"
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(project)}
                            className="flex-1! rounded! border-outline! text-on-surface! hover:border-primary! hover:text-primary! font-inter! text-xs!"
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteProject(project)}
                            className="flex-1! rounded! font-inter! text-xs!"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* Lightbox Modal */}
      <Modal
        open={lightboxOpen}
        onCancel={() => setLightboxOpen(false)}
        footer={null}
        width="80vw"
        centered
        styles={{
          body: { padding: 0, background: "transparent", boxShadow: "none" },
          mask: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0,0,0,0.85)",
          },
        }}
        closeIcon={
          <CloseOutlined className="text-white text-xl hover:text-secondary transition-colors" />
        }
      >
        {activeProject && (
          <div className="flex flex-col items-center">
            <div className="relative max-h-[75vh] w-full flex items-center justify-center bg-black/50 rounded-lg overflow-hidden">
              {activeProject.media[activeMediaIndex].type === "video" ? (
                <video
                  src={activeProject.media[activeMediaIndex].file_url}
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-full"
                />
              ) : (
                <img
                  src={activeProject.media[activeMediaIndex].file_url}
                  alt={activeProject.title}
                  className="max-h-[75vh] max-w-full object-contain"
                />
              )}

              {activeProject.media.length > 1 && (
                <>
                  {activeMediaIndex > 0 && (
                    <button
                      onClick={() => setActiveMediaIndex(activeMediaIndex - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                    >
                      <LeftOutlined />
                    </button>
                  )}
                  {activeMediaIndex < activeProject.media.length - 1 && (
                    <button
                      onClick={() => setActiveMediaIndex(activeMediaIndex + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                    >
                      <RightOutlined />
                    </button>
                  )}
                </>
              )}

              {activeProject.media.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {activeMediaIndex + 1} / {activeProject.media.length}
                </div>
              )}
            </div>

            <div className="mt-6 text-center max-w-2xl px-4">
              <Title
                level={3}
                className="font-manrope font-semibold text-white mb-2"
              >
                {activeProject.title}
              </Title>
              {activeProject.category && (
                <Tag className="rounded-full! bg-white/10! text-white! border-0! mb-3">
                  {activeProject.category}
                </Tag>
              )}
              {activeProject.description && (
                <Text className="text-base text-gray-300 font-inter block">
                  {activeProject.description}
                </Text>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={520}
        centered
        styles={{
          body: { padding: 0, borderRadius: "16px", overflow: "hidden" },
        }}
      >
        <div className="bg-surface-container-lowest! p-6 md:p-8">
          <Title
            level={4}
            className="font-manrope! text-lg! font-semibold! text-primary! mb-6!"
          >
            Edit Project Details
          </Title>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-inter font-medium text-on-surface mb-1">
                Project Title *
              </label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="rounded-lg! h-11!"
              />
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-on-surface mb-1">
                Category
              </label>
              <Input
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                placeholder="e.g., Kitchen Remodel"
                className="rounded-lg! h-11!"
              />
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-on-surface mb-1">
                Description
              </label>
              <TextArea
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="rounded-lg! resize-none!"
                placeholder="Briefly describe the work done..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setEditModalOpen(false)}
                block
                className="rounded-lg! h-11! font-inter! border-outline! text-on-surface! hover:border-primary! hover:text-primary!"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleSaveEdit}
                loading={savingEdit}
                block
                className="rounded-lg! h-11! bg-secondary! border-secondary! font-inter! font-semibold! hover:bg-secondary/90!"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
