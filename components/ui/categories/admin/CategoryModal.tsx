"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Input, Switch, Button, Typography, App } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

const { Text, Title } = Typography;

interface CategoryItem {
  id: string;
  label: string;
  value: string;
  description: string | null;
  icon?: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem: CategoryItem | null;
  parentId: string | null; // If null, it's a category. If set, it's a subcategory.
}

export default function CategoryModal({
  open,
  onClose,
  onSuccess,
  editingItem,
  parentId,
}: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const isSubcategory = parentId !== null;

  useEffect(() => {
    if (open) {
      if (editingItem) {
        form.setFieldsValue({
          label: editingItem.label,
          value: editingItem.value,
          description: editingItem.description,
          icon: editingItem.icon,
          is_active: editingItem.is_active,
          sort_order: editingItem.sort_order,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ is_active: true, sort_order: 0 });
      }
    }
  }, [open, editingItem, form]);

  const generateValue = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const handleLabelChange = (e: any) => {
    form.setFieldsValue({ value: generateValue(e.target.value) });
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const rpcName = isSubcategory
        ? "upsert_service_subcategory"
        : "upsert_service_category";
      const payload: any = {
        p_id: editingItem?.id || null,
        p_label: values.label,
        p_value: values.value,
        p_description: values.description || null,
        p_is_active: values.is_active,
        p_sort_order: values.sort_order || 0,
      };

      if (isSubcategory) {
        payload.p_category_id = parentId;
      } else {
        payload.p_icon = values.icon || null;
      }

      const { error } = await supabase.rpc(rpcName, payload);
      if (error) throw error;

      message.success(
        editingItem ? "Updated successfully!" : "Created successfully!"
      );
      onSuccess();
    } catch (error: any) {
      console.error("Category error:", error);
      message.error(error.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      styles={{
        body: { padding: 0, borderRadius: "16px", overflow: "hidden" },
      }}
    >
      <div className="bg-surface-container-lowest! p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <AppstoreOutlined className="text-primary! text-xl!" />
          </div>
          <div>
            <Title
              level={4}
              className="text-primary! font-manrope! font-semibold! mb-1! text-lg!"
            >
              {editingItem
                ? isSubcategory
                  ? "Edit Subcategory"
                  : "Edit Category"
                : isSubcategory
                  ? "Add Subcategory"
                  : "Add Category"}
            </Title>
            <Text className="text-on-surface-variant! font-inter! text-sm!">
              {isSubcategory
                ? "Manage a specific service subcategory."
                : "Create a new top-level service category."}
            </Text>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="space-y-1"
        >
          <Form.Item
            label={
              <span className="text-sm! font-inter! font-medium! text-on-surface! mb-1! block!">
                Label
              </span>
            }
            name="label"
            rules={[{ required: true, message: "Please enter label" }]}
            className="mb-4!"
          >
            <Input
              placeholder="e.g., Plumbing"
              onChange={handleLabelChange}
              className="rounded-lg! h-11!"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm! font-inter! font-medium! text-on-surface! mb-1! block!">
                Value (Slug)
              </span>
            }
            name="value"
            rules={[{ required: true, message: "Please enter value" }]}
            className="mb-4!"
          >
            <Input
              placeholder="e.g., plumbing"
              className="rounded-lg! h-11! font-mono!"
            />
          </Form.Item>

          {!isSubcategory && (
            <Form.Item
              label={
                <span className="text-sm! font-inter! font-medium! text-on-surface! mb-1! block!">
                  Icon (Ant Design)
                </span>
              }
              name="icon"
              className="mb-4!"
            >
              <Input
                placeholder="e.g., ToolOutlined"
                className="rounded-lg! h-11!"
              />
            </Form.Item>
          )}

          <Form.Item
            label={
              <span className="text-sm! font-inter! font-medium! text-on-surface! mb-1! block!">
                Description
              </span>
            }
            name="description"
            className="mb-4!"
          >
            <Input.TextArea
              rows={3}
              placeholder="Brief description..."
              className="rounded-lg!"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm! font-inter! font-medium! text-on-surface! mb-1! block!">
                Sort Order
              </span>
            }
            name="sort_order"
            className="mb-4!"
          >
            <Input
              type="number"
              placeholder="0"
              className="rounded-lg! h-11!"
            />
          </Form.Item>

          <Form.Item name="is_active" valuePropName="checked" className="mb-6!">
            <div className="flex items-center gap-3">
              <Switch checked={form.getFieldValue("is_active")} />
              <Text className="text-sm! text-on-surface!">Active</Text>
            </div>
          </Form.Item>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              block
              size="large"
              className="rounded-lg! h-11! font-inter! font-medium! text-on-surface! border-outline! hover:border-primary! hover:text-primary!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              className="bg-secondary! border-secondary! text-white! font-inter! font-semibold! rounded-lg! h-11! hover:bg-secondary/90!"
            >
              {editingItem ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
