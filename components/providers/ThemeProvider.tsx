"use client";

import { ConfigProvider, theme } from "antd";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          // ===== Brand Colors =====
          colorPrimary: "#a53b15", // Secondary (Coral Orange) for primary actions
          colorSuccess: "#10B981", // Success Emerald
          colorWarning: "#f97316", // Warm Orange for warnings
          colorError: "#ba1a1a", // Error Red from spec
          colorInfo: "#5156a7", // Surface tint / softer navy for info elements

          // ===== Neutral & Surface Colors =====
          colorTextBase: "#1b1b20", // on-surface
          colorBgBase: "#fbf8ff", // surface background
          colorBgLayout: "#fbf8ff", // overall layout background
          colorBgContainer: "#ffffff", // card & component backgrounds
          colorBgElevated: "#ffffff", // elevated surfaces (modals, popovers)
          colorBgSpotlight: "rgba(27, 27, 32, 0.85)", // tooltips & spotlight

          // ===== Text Colors =====
          colorText: "#1b1b20",
          colorTextSecondary: "#464651", // on-surface-variant
          colorTextTertiary: "#777682", // outline
          colorTextQuaternary: "#c7c5d3", // outline-variant
          colorTextDisabled: "#c7c5d3",

          // ===== Border & Outline =====
          colorBorder: "#c7c5d3", // outline-variant
          colorBorderSecondary: "#e4e1e9", // surface-variant

          // ===== Mask & Overlay =====
          colorBgMask: "rgba(27, 27, 32, 0.45)",

          // ===== Primary Variants (Navy) for specific components =====
          // These override where we want navy instead of orange
          colorPrimaryBg: "#e0e0ff", // primary-fixed
          colorPrimaryBgHover: "#bfc2ff", // primary-fixed-dim
          colorPrimaryBorder: "#15196c", // primary navy
          colorPrimaryBorderHover: "#2d3282", // primary-container
          colorPrimaryHover: "#c23e1a", // orange hover (secondary 600)
          colorPrimaryActive: "#842500", // dark orange (on-secondary-container variant)
          colorPrimaryText: "#15196c", // navy text for links
          colorPrimaryTextHover: "#2d3282",
          colorPrimaryTextActive: "#070963",

          // ===== Functional Colors Hover/Active States =====
          colorSuccessBg: "#ecfdf5",
          colorSuccessBgHover: "#d1fae5",
          colorSuccessBorder: "#a7f3d0",
          colorSuccessBorderHover: "#6ee7b7",
          colorSuccessHover: "#059669",
          colorSuccessActive: "#047857",
          colorSuccessText: "#059669",
          colorSuccessTextHover: "#047857",
          colorSuccessTextActive: "#065f46",

          colorWarningBg: "#fff7ed",
          colorWarningBgHover: "#ffedd5",
          colorWarningBorder: "#fed7aa",
          colorWarningBorderHover: "#fdba74",
          colorWarningHover: "#ea580c",
          colorWarningActive: "#c2410c",
          colorWarningText: "#ea580c",
          colorWarningTextHover: "#c2410c",
          colorWarningTextActive: "#9a3412",

          colorErrorBg: "#ffdad6", // error-container
          colorErrorBgHover: "#fecaca",
          colorErrorBorder: "#fca5a5",
          colorErrorBorderHover: "#f87171",
          colorErrorHover: "#dc2626",
          colorErrorActive: "#b91c1c",
          colorErrorText: "#ba1a1a",
          colorErrorTextHover: "#dc2626",
          colorErrorTextActive: "#93000a",

          colorInfoBg: "#f0ecf4",
          colorInfoBgHover: "#e4e1e9",
          colorInfoBorder: "#c7c5d3",
          colorInfoBorderHover: "#a3a3a3",
          colorInfoHover: "#6366f1",
          colorInfoActive: "#4f46e5",
          colorInfoText: "#5156a7",
          colorInfoTextHover: "#6366f1",
          colorInfoTextActive: "#4f46e5",

          // ===== Typography =====
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          fontSize: 16, // body-md base size
          fontSizeSM: 14, // label-md
          fontSizeLG: 18, // body-lg

          // ===== Spacing (8px base unit) =====
          padding: 16, // 2 units
          paddingSM: 8, // 1 unit
          paddingLG: 24, // 3 units
          margin: 16,
          marginSM: 8,
          marginLG: 24,

          // ===== Component Sizing =====
          controlHeight: 44, // comfortable touch target
          controlHeightSM: 32,
          controlHeightLG: 56,
          controlPaddingHorizontal: 16, // 2 units
          controlPaddingHorizontalSM: 12,

          // ===== Border Radius (following spec) =====
          borderRadius: 8, // DEFAULT 0.5rem
          borderRadiusXS: 4, // 0.25rem (sm)
          borderRadiusSM: 6, // between xs and default
          borderRadiusLG: 16, // 1rem for large containers

          // ===== Shadows (airy, tinted) =====
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)", // Level 1 cards
          boxShadowSecondary: "0 10px 32px rgba(0, 0, 0, 0.12)", // Level 3 popovers
          boxShadowTertiary:
            "0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03)", // subtle default
        },

        components: {
          // ===== Buttons =====
          Button: {
            // Keep only the tokens that actually exist for Button
            primaryShadow: "none",
            defaultShadow: "none",
            dangerShadow: "none",

            // Default button (Navy outline, transparent background)
            defaultColor: "#15196c",
            defaultBg: "transparent",
            defaultBorderColor: "#15196c",
            defaultHoverColor: "#15196c",
            defaultHoverBg: "#f0ecf4",
            defaultHoverBorderColor: "#15196c",
            defaultActiveColor: "#15196c",
            defaultActiveBg: "#e4e1e9",
            defaultActiveBorderColor: "#15196c",

            borderRadius: 8,
            controlHeight: 44,
            controlHeightLG: 48,
            fontWeight: 500,
          },

          // ===== Input Fields =====
          Input: {
            activeShadow: "none",
            hoverBorderColor: "#15196c", // primary navy on hover
            activeBorderColor: "#15196c",
            borderRadius: 8,
            controlHeight: 44,
            paddingInline: 16,
          },

          // ===== Select =====
          Select: {
            optionSelectedBg: "#f0ecf4",
            optionActiveBg: "#fbf8ff",
            optionSelectedFontWeight: 500,
            borderRadius: 8,
            controlHeight: 44,
          },

          // ===== Cards =====
          Card: {
            borderRadiusLG: 16, // large containers use 16px
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            colorBorderSecondary: "#e4e1e9",
            paddingLG: 24,
          },

          // ===== Modals =====
          Modal: {
            borderRadiusLG: 16,
            boxShadow: "0 10px 32px rgba(0, 0, 0, 0.12)",
            paddingContentHorizontalLG: 24,
            paddingContentVerticalLG: 24,
          },

          // ===== Drawer =====
          Drawer: {
            borderRadiusLG: 16,
          },

          // ===== Alert =====
          Alert: {
            borderRadiusLG: 12,
          },

          // ===== Progress =====
          Progress: {
            defaultColor: "#15196c", // navy primary for progress
            remainingColor: "#e4e1e9",
          },

          // ===== Steps =====
          Steps: {
            iconSize: 32,
            colorPrimary: "#15196c", // navy for active step
          },

          // ===== Switch =====
          Switch: {
            trackHeight: 24,
            trackMinWidth: 44,
            innerMinMargin: 4,
            innerMaxMargin: 24,
            colorPrimary: "#15196c", // navy for checked state
            colorPrimaryHover: "#2d3282",
          },

          // ===== Checkbox =====
          Checkbox: {
            borderRadiusSM: 4,
            colorPrimary: "#15196c", // navy for checked state
            colorPrimaryHover: "#2d3282",
          },

          // ===== Radio =====
          Radio: {
            colorPrimary: "#15196c", // navy for checked state
            colorPrimaryHover: "#2d3282",
          },

          // ===== Slider =====
          Slider: {
            trackBg: "#e4e1e9",
            trackHoverBg: "#c7c5d3",
            handleSize: 18,
            handleSizeHover: 20,
            railSize: 6,
            colorPrimary: "#15196c", // navy for track fill
            colorPrimaryHover: "#2d3282",
          },

          // ===== Tabs =====
          Tabs: {
            colorPrimary: "#15196c", // navy active tab indicator
            inkBarColor: "#15196c",
            itemHoverColor: "#2d3282",
            itemActiveColor: "#15196c",
            itemSelectedColor: "#15196c",
          },

          // ===== Badge (Pill shape) =====
          Badge: {
            borderRadius: 9999, // pill shape
            fontSizeSM: 12,
            fontWeightStrong: 600,
          },

          // ===== Tag (Pill shape) =====
          Tag: {
            borderRadius: 9999, // pill shape for tags/chips
          },

          // ===== Dropdown / Popover =====
          Dropdown: {
            borderRadiusLG: 8,
            boxShadowSecondary: "0 10px 32px rgba(0, 0, 0, 0.12)",
          },
          Popover: {
            borderRadiusLG: 8,
            boxShadowSecondary: "0 10px 32px rgba(0, 0, 0, 0.12)",
          },
          Tooltip: {
            borderRadius: 6,
            colorBgSpotlight: "rgba(27, 27, 32, 0.85)",
          },

          // ===== Menu / Navigation =====
          Menu: {
            itemBorderRadius: 8,
            itemHoverColor: "#15196c",
            itemHoverBg: "#f0ecf4",
            itemSelectedColor: "#15196c",
            itemSelectedBg: "#e0e0ff", // primary-fixed
            activeBarBorderWidth: 3,
            activeBarHeight: 24,
          },

          // ===== Table =====
          Table: {
            borderRadius: 12,
            headerBg: "#fbf8ff",
            headerColor: "#464651",
            headerSortActiveBg: "#e4e1e9",
            rowHoverBg: "#f5f2fa",
          },

          // ===== Pagination =====
          Pagination: {
            colorPrimary: "#15196c",
            colorPrimaryHover: "#2d3282",
            borderRadius: 6,
          },

          // ===== DatePicker / TimePicker =====
          DatePicker: {
            borderRadius: 8,
            activeShadow: "none",
            hoverBorderColor: "#15196c",
            activeBorderColor: "#15196c",
          },

          // ===== Upload =====
          Upload: {
            borderRadiusLG: 8,
          },

          // ===== Form =====
          Form: {
            labelFontSize: 14,
            labelHeight: 24,
            marginLG: 24,
          },

          // ===== Typography =====
          Typography: {
            titleMarginBottom: 16,
            titleMarginTop: 0,
            colorLink: "#15196c",
            colorLinkHover: "#2d3282",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
