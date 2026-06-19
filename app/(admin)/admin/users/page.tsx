"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Avatar,
  App,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EditOutlined,
  BlockOutlined,
  SafetyCertificateOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  DownloadOutlined,
  ReloadOutlined,
  StopOutlined,
  StarOutlined,
  HourglassOutlined,
  EyeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import AdminGuard from "@/components/auth/AdminGuard";
import dayjs from "dayjs";

const { Option } = Select;

export default function AdminUsersPage() {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search, roleFilter, verifiedFilter]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc("get_user_stats");
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_admin_users", {
        p_page: page,
        p_page_size: pageSize,
        p_search: search || null,
        p_role: roleFilter,
        p_is_verified: verifiedFilter,
      });
      if (error) throw error;
      setUsers(data.users || []);
      setTotal(data.total);
    } catch (error) {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.rpc("update_user_role", {
        p_user_id: userId,
        p_new_role: newRole,
      });
      if (error) throw error;
      message.success("Role updated successfully");
      fetchUsers();
    } catch (error) {
      message.error("Failed to update role");
    }
  };

  const handleVerificationToggle = async (
    userId: string,
    isVerified: boolean
  ) => {
    try {
      const { error } = await supabase.rpc("toggle_user_verification", {
        p_user_id: userId,
        p_is_verified: isVerified,
      });
      if (error) throw error;
      message.success(isVerified ? "User verified" : "Verification removed");
      fetchUsers();
    } catch (error) {
      message.error("Failed to update verification");
    }
  };

  const handleBlockUser = (userId: string, userName: string) => {
    modal.confirm({
      title: "Block User",
      content: `Are you sure you want to block ${userName}? This will prevent them from accessing the platform.`,
      okText: "Block User",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        message.success(`${userName} has been blocked`);
      },
    });
  };

  // ✅ Shared Design System Classes
  const headerClass =
    "font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant";
  const inputClasses =
    "w-full! pl-10! pr-4! bg-surface-container! border-none! rounded-lg! h-10! font-inter! text-[14px]! focus:ring-1! focus:ring-primary/30!";
  const selectClasses =
    "[&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[14px]!";

  const columns = [
    {
      title: <span className={headerClass}>User</span>,
      key: "user",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar_url}
            size={40}
            className="bg-surface-container! text-on-surface-variant! ring-2! ring-outline-variant/20!"
          >
            {record.full_name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div className="font-inter font-semibold text-on-surface text-[14px]">
              {record.full_name}
            </div>
            <div className="font-inter text-[12px] text-outline">
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <span className={headerClass}>Role</span>,
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const roleConfig: any = {
          admin: { bg: "bg-error/10", text: "text-error" },
          artisan: { bg: "bg-primary/10", text: "text-primary" },
          customer: {
            bg: "bg-surface-container",
            text: "text-on-surface-variant",
          },
        };
        const config = roleConfig[role] || roleConfig.customer;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}
          >
            {role?.toUpperCase()}
          </span>
        );
      },
    },
    {
      title: <span className={headerClass}>Verification</span>,
      key: "verification",
      render: (_: any, record: any) => {
        if (record.role === "artisan") {
          return record.is_verified ? (
            <div className="flex items-center gap-1.5 text-success-emerald">
              <CheckCircleOutlined className="text-[16px]" />
              <span className="font-inter text-[14px] font-medium">
                Verified
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-secondary">
              <HourglassOutlined className="text-[16px]" />
              <span className="font-inter text-[14px] font-medium">
                Pending
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1.5 text-outline">
            <StopOutlined className="text-[16px]" />
            <span className="font-inter text-[14px] font-medium">N/A</span>
          </div>
        );
      },
    },
    {
      title: <span className={headerClass}>Location</span>,
      key: "location",
      render: (_: any, record: any) => (
        <span className="font-inter text-[14px] text-on-surface-variant">
          {record.city && record.state_code
            ? `${record.city}, ${record.state_code}`
            : "—"}
        </span>
      ),
    },
    {
      title: <span className={headerClass}>Joined</span>,
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span className="font-inter text-[14px] text-on-surface-variant">
          {dayjs(date).format("MMM D, YYYY")}
        </span>
      ),
      sorter: true,
    },
    {
      title: <span className={`${headerClass} text-right block`}>Actions</span>,
      key: "actions",
      width: 240,
      render: (_: any, record: any) => (
        <div className="flex items-center justify-end gap-1">
          {record.role === "artisan" && !record.is_verified && (
            <Popconfirm
              title="Verify this artisan?"
              description="This will grant them verified status."
              onConfirm={() => handleVerificationToggle(record.id, true)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Verify Artisan">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  className="w-8! h-8! flex items-center justify-center rounded-lg! text-primary! bg-primary/10! hover:bg-primary/20!"
                />
              </Tooltip>
            </Popconfirm>
          )}
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() =>
                message.info(`View details for ${record.full_name}`)
              }
              className="w-8! h-8! flex items-center justify-center rounded-lg! text-on-surface-variant! hover:text-primary! hover:bg-surface-container!"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => message.info(`Edit ${record.full_name}`)}
              className="w-8! h-8! flex items-center justify-center rounded-lg! text-on-surface-variant! hover:text-primary! hover:bg-surface-container!"
            />
          </Tooltip>
          <Tooltip title="Block">
            <Button
              type="text"
              icon={<BlockOutlined />}
              onClick={() => handleBlockUser(record.id, record.full_name)}
              className="w-8! h-8! flex items-center justify-center rounded-lg! text-on-surface-variant! hover:text-error! hover:bg-error/10!"
            />
          </Tooltip>
          <Select
            value={record.role}
            onChange={(value) => handleRoleChange(record.id, value)}
            size="small"
            className="w-28! [&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-8! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[12px]!"
          >
            <Option value="customer">Customer</Option>
            <Option value="artisan">Professional</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
                <span>System Administration</span>
                <span className="text-[14px]">›</span>
                <span className="text-primary">User Directory</span>
              </div>
              <h1 className="font-manrope text-[32px] font-semibold text-primary leading-tight">
                Manage Profiles
              </h1>
              <p className="font-inter text-[16px] text-on-surface-variant mt-2">
                Reviewing user verification status, platform engagement, and
                account health across the marketplace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                icon={<UserAddOutlined />}
                className="rounded-lg! h-auto! py-2.5! px-5! border-primary! text-primary! hover:bg-primary/5! bg-transparent! font-inter! text-[14px]! font-medium!"
              >
                Invite Admin
              </Button>
              <Button
                type="primary"
                icon={<UserOutlined />}
                className="rounded-lg! h-auto! py-2.5! px-5! bg-secondary! hover:bg-secondary/90! border-none! text-on-secondary! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
              >
                Create New User
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Users",
                  value: stats.total_users?.toLocaleString() || 0,
                  sub: `+${stats.new_this_week || 0} this week`,
                  subColor: "text-success-emerald",
                  icon: <TeamOutlined className="text-xl" />,
                  iconBg: "bg-primary/10 text-primary",
                },
                {
                  label: "Active Professionals",
                  value: stats.total_artisans?.toLocaleString() || 0,
                  sub: `${stats.verified_artisans || 0} verified`,
                  subColor: "text-success-emerald",
                  icon: <SafetyCertificateOutlined className="text-xl" />,
                  iconBg: "bg-tertiary/10 text-tertiary",
                },
                {
                  label: "Pending Verifications",
                  value: stats.pending_verification || 0,
                  sub: "requires review",
                  subColor: "text-on-surface-variant",
                  icon: <HourglassOutlined className="text-xl" />,
                  iconBg: "bg-secondary/10 text-secondary",
                },
                {
                  label: "Platform Rating",
                  value: "4.85",
                  sub: "average rating",
                  subColor: "text-primary",
                  icon: <StarOutlined className="text-xl" />,
                  iconBg: "bg-surface-container text-primary",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest p-6 rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 flex items-start justify-between"
                >
                  <div>
                    <p className={`${headerClass} mb-2`}>{stat.label}</p>
                    <h3 className="font-manrope text-[28px] font-bold text-primary leading-none">
                      {stat.value}
                    </h3>
                    <p
                      className={`font-inter text-[12px] ${stat.subColor} font-semibold mt-2 flex items-center gap-1`}
                    >
                      {stat.label === "Total Users" && (
                        <RiseOutlined className="text-[14px]" />
                      )}
                      {stat.label === "Active Professionals" && (
                        <CheckCircleOutlined className="text-[14px]" />
                      )}
                      {stat.label === "Pending Verifications" && (
                        <ClockCircleOutlined className="text-[14px]" />
                      )}
                      {stat.label === "Platform Rating" && (
                        <StarOutlined className="text-[14px]" />
                      )}
                      {stat.sub}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${stat.iconBg}`}
                  >
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Data Module */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
            {/* Table Filters */}
            <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[16px]" />
                  <Input
                    placeholder="Search by name, email, or username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <Select
                  placeholder="All Roles"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  allowClear
                  className={`w-40! ${selectClasses}`}
                >
                  <Option value="customer">Customer</Option>
                  <Option value="artisan">Professional</Option>
                  <Option value="admin">Admin</Option>
                </Select>
                <Select
                  placeholder="Verification"
                  value={verifiedFilter}
                  onChange={setVerifiedFilter}
                  allowClear
                  className={`w-48! ${selectClasses}`}
                >
                  <Option value={true}>Verified</Option>
                  <Option value={false}>Unverified</Option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip title="Export CSV">
                  <Button
                    icon={<DownloadOutlined />}
                    className="w-10! h-10! flex items-center justify-center rounded-lg! border-outline-variant/30! text-on-surface-variant! hover:text-primary! hover:bg-surface-container! bg-transparent!"
                  />
                </Tooltip>
                <Tooltip title="Refresh">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchUsers}
                    className="w-10! h-10! flex items-center justify-center rounded-lg! border-outline-variant/30! text-on-surface-variant! hover:text-primary! hover:bg-surface-container! bg-transparent!"
                  />
                </Tooltip>
              </div>
            </div>

            {/* Table Content */}
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: (total) => (
                  <span className="font-inter text-[14px] text-on-surface-variant">
                    Showing 1 - {Math.min(pageSize, total)} of{" "}
                    {total.toLocaleString()} results
                  </span>
                ),
                onChange: (page, pageSize) => {
                  setPage(page);
                  setPageSize(pageSize);
                },
                className:
                  "[&_.ant-pagination-item>a]:font-inter! [&_.ant-pagination-item-active]:border-primary! [&_.ant-pagination-item-active>a]:text-primary!",
              }}
              className="[&_.ant-table-thead>tr>th]:bg-surface-container-low/50! [&_.ant-table-thead>tr>th]:border-b! [&_.ant-table-thead>tr>th]:border-outline-variant/20! [&_.ant-table-tbody>tr>td]:border-b! [&_.ant-table-tbody>tr>td]:border-outline-variant/10! [&_.ant-table-tbody>tr:hover>td]:bg-surface-container/50!"
            />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
