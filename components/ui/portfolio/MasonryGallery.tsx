// components/portfolio/MasonryGallery.tsx
"use client";

import { useState } from "react";
import { Modal, Tag, Typography } from "antd";
import {
  PlayCircleOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  PictureOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

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
  media: MediaItem[];
}

interface Props {
  projects: PortfolioProject[];
}

export default function MasonryGallery({ projects }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(
    null
  );
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const openLightbox = (project: PortfolioProject, startIndex: number = 0) => {
    setActiveProject(project);
    setActiveMediaIndex(startIndex);
    setLightboxOpen(true);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[var(--shadow-level-1)]">
        <Text className="text-on-surface-variant font-inter">
          This artisan hasn't added any portfolio projects yet.
        </Text>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {projects.map((project) => {
          const coverMedia = project.media[0];
          const mediaCount = project.media.length;

          return (
            <div
              key={project.id}
              onClick={() => openLightbox(project, 0)}
              className="break-inside-avoid bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] transition-all cursor-pointer group"
            >
              <div className="relative overflow-hidden bg-surface-container">
                {coverMedia?.type === "video" ? (
                  <>
                    {coverMedia.thumbnail_url ? (
                      <img
                        src={coverMedia.thumbnail_url}
                        alt={project.title}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <div className="aspect-video flex items-center justify-center bg-primary/5">
                        <PlayCircleOutlined className="text-4xl text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <PlayCircleOutlined className="text-5xl text-white drop-shadow-lg" />
                    </div>
                  </>
                ) : (
                  <img
                    src={coverMedia?.file_url}
                    alt={project.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {mediaCount > 1 && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <PictureOutlined className="text-xs" />
                    {mediaCount}
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Title
                    level={5}
                    className="font-manrope font-semibold text-on-surface mb-0 line-clamp-1"
                  >
                    {project.title}
                  </Title>
                  {project.category && (
                    <Tag className="rounded-full! bg-primary/5! text-primary! border-0! text-xs! font-inter! whitespace-nowrap">
                      {project.category}
                    </Tag>
                  )}
                </div>
                {project.description && (
                  <Text className="text-sm text-on-surface-variant font-inter line-clamp-2">
                    {project.description}
                  </Text>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={lightboxOpen}
        onCancel={() => setLightboxOpen(false)}
        footer={null}
        width="80vw"
        centered
        styles={{
          body: { padding: 0, background: "transparent", boxShadow: "none" },
          mask: {
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(0,0,0,0.85)",
          },
        }}
        closeIcon={
          <CloseOutlined className="text-white text-xl hover:text-secondary transition-colors" />
        }
      >
        {activeProject && (
          <div className="flex flex-col items-center">
            <div className="relative max-h-[75vh] w-full flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex(activeMediaIndex - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                    >
                      <LeftOutlined />
                    </button>
                  )}
                  {activeMediaIndex < activeProject.media.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex(activeMediaIndex + 1);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                    >
                      <RightOutlined />
                    </button>
                  )}
                </>
              )}

              {activeProject.media.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm">
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
    </>
  );
}
