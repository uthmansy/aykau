// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Typography, Button, App, Spin, Empty, Switch, Tag, Modal } from "antd";
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import AdminGuard from "@/components/auth/AdminGuard";
import CategoryModal from "@/components/ui/categories/admin/CategoryModal";
import PlatformFeeSettings from "@/components/ui/categories/admin/PlatformFeeSettings";

const { Title, Text } = Typography;

interface Subcategory {
  id: string;
  value: string;
  label: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Category {
  id: string;
  value: string;
  label: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  subcategories: Subcategory[];
}

export default function AdminCategoriesPage() {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | Subcategory | null>(
    null
  );
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        "get_service_categories_admin"
      );
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (parentId: string | null = null) => {
    setEditingItem(null);
    setParentId(parentId);
    setIsModalOpen(true);
  };

  const handleEdit = (
    item: Category | Subcategory,
    parentId: string | null = null
  ) => {
    setEditingItem(item);
    setParentId(parentId);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, label: string, isSubcategory: boolean) => {
    modal.confirm({
      title: (
        <span className="font-manrope text-primary">
          Delete {isSubcategory ? "Subcategory" : "Category"}?
        </span>
      ),
      content: (
        <div className="font-inter">
          <Text className="text-on-surface">
            Are you sure you want to delete <strong>{label}</strong>?
          </Text>
        </div>
      ),
      okText: "Yes, Delete",
      okButtonProps: {
        className: "bg-error! border-error! hover:bg-error/90!",
      },
      cancelButtonProps: { className: "border-outline! text-on-surface!" },
      onOk: async () => {
        try {
          const { error } = await supabase.rpc("delete_service_category_item", {
            p_id: id,
            p_is_subcategory: isSubcategory,
          });
          if (error) {
            if (error.message.includes("has_subcategories")) {
              message.error(
                "Cannot delete a category with subcategories. Delete subcategories first."
              );
            } else {
              throw error;
            }
            return;
          }
          message.success("Deleted successfully!");
          fetchCategories();
        } catch (error: any) {
          message.error(error.message || "Failed to delete.");
        }
      },
    });
  };

  const handleToggleActive = async (
    id: string,
    isActive: boolean,
    isSubcategory: boolean
  ) => {
    try {
      const { error } = await supabase.rpc("toggle_service_category_active", {
        p_id: id,
        p_is_active: isActive,
        p_is_subcategory: isSubcategory,
      });
      if (error) throw error;
      message.success(`Status updated!`);
      fetchCategories();
    } catch (error: any) {
      message.error(error.message || "Failed to update status.");
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-[1440px] mx-auto p-4 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <AppstoreOutlined className="text-[32px]" />
              </div>
              <Title
                level={1}
                className="font-headline-lg text-headline-lg text-primary! mb-0!"
              >
                Categories & Settings
              </Title>
            </div>
            <Text className="text-on-surface-variant! font-body-md! max-w-xl block!">
              Manage service categories and platform fee settings.
            </Text>
          </div>
          <div className="flex gap-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCategories}
              className="px-6! py-3! border! border-primary! text-primary! rounded-full! font-label-md! hover:bg-primary/5!"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAdd(null)}
              className="px-6! py-3! bg-secondary! text-white! rounded-full! font-label-md! hover:bg-secondary/90! shadow-md! shadow-secondary/20!"
            >
              Add Category
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]! p-6!">
            <Title
              level={4}
              className="font-headline-md text-headline-md text-primary! mb-6!"
            >
              Service Categories
            </Title>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : categories.length === 0 ? (
              <Empty
                description={
                  <Text className="text-on-surface-variant!">
                    No categories yet
                  </Text>
                }
              />
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border! border-outline-variant/30! rounded-xl! p-5!"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <AppstoreOutlined className="text-primary! text-lg!" />
                        </div>
                        <div>
                          <Text className="font-label-md! text-on-surface! font-semibold! block!">
                            {category.label}
                          </Text>
                          <Text className="text-xs! text-on-surface-variant!">
                            {category.subcategories.length} subcategories
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.is_active}
                          onChange={(checked) =>
                            handleToggleActive(category.id, checked, false)
                          }
                          size="small"
                        />
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(category, null)}
                          className="border-outline! text-on-surface! hover:border-primary! hover:text-primary!"
                        />
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            handleDelete(category.id, category.label, false)
                          }
                        />
                      </div>
                    </div>

                    {category.subcategories.length > 0 && (
                      <div className="ml-13 pl-4 border-l-2 border-outline-variant/30 space-y-2">
                        {category.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Text className="text-sm! text-on-surface!">
                                {sub.label}
                              </Text>
                              {!sub.is_active && (
                                <Tag className="rounded-full! bg-error/10! text-error! border-0! text-xs!">
                                  Inactive
                                </Tag>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={sub.is_active}
                                onChange={(checked) =>
                                  handleToggleActive(sub.id, checked, true)
                                }
                                size="small"
                              />
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(sub, category.id)}
                                className="border-outline! text-on-surface! hover:border-primary! hover:text-primary!"
                              />
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleDelete(sub.id, sub.label, true)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleAdd(category.id)}
                      className="mt-3 w-full! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary!"
                    >
                      Add Subcategory
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <PlatformFeeSettings onRefresh={fetchCategories} />
          </div>
        </div>

        <CategoryModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
            setParentId(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingItem(null);
            setParentId(null);
            fetchCategories();
          }}
          editingItem={editingItem}
          parentId={parentId}
        />
      </div>
    </AdminGuard>
  );
}
