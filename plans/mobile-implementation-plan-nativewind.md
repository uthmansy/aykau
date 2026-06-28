# Aykau Mobile App - Implementation Plan (NativeWind v4)

## Design System Compliance

**IMPORTANT:** This mobile app strictly follows the Luminous Marketplace Design System defined in DESIGN.md. All colors, typography, spacing, and component styles must match the design system specifications exactly.

- **Design System Name:** Luminous Marketplace
- **Style:** Corporate Modern with Glassmorphism accents
- **Brand Personality:** Professional, efficient, transparent, approachable

---

## 0. Strict Rules for AI (MANDATORY)

These rules override all other instructions. AI agents MUST follow them without exception.

### Rule 1: No Direct Primitives After Base Components Are Built

Once the `components/ui/` base components are created (Phase 1), **NEVER** use raw React Native primitives (`View`, `Text`, `Pressable`, `TextInput`, `Image`, `Switch`, `ActivityIndicator`) directly in feature components.

❌ **FORBIDDEN (after Phase 1):**

```tsx
<View className="flex-1">
  <Text>Hello</Text>
</View>
```

✅ **REQUIRED:**

```tsx
<SafeScreen>
  <Text preset="bodyMd">Hello</Text>
</SafeScreen>
```

### Rule 2: Always Use the cn() Utility

Never concatenate Tailwind classes with template literals. Always use the `cn()` utility from `lib/utils.ts` to handle class conflicts.

❌ **FORBIDDEN:**

```tsx
className={`px-4 py-2 ${isActive ? 'bg-primary' : ''}`}
```

✅ **REQUIRED:**

```tsx
className={cn('px-4 py-2', isActive && 'bg-primary')}
```

### Rule 3: Use Design Tokens, Never Hardcoded Values

Never use raw hex colors, raw pixel values, or arbitrary Tailwind values. Use only the design tokens defined in `tailwind.config.js`.

❌ **FORBIDDEN:**

```tsx
className = "text-[#1A73E8] mt-[13px]";
```

✅ **REQUIRED:**

```tsx
className = "text-primary mt-4";
```

### Rule 4: Accessibility is Mandatory

Every interactive component MUST include:

- `accessibilityRole` (button, link, checkbox, etc.)
- `accessibilityLabel` (descriptive text)
- `accessibilityState` (disabled, selected, expanded, etc.)

### Rule 5: Use Base Component Variants, Not Custom Classes

If a base component has a variant that matches your need, use it. Do not override with custom classes unless the design explicitly requires it.

❌ **FORBIDDEN:**

```tsx
<Button className="bg-red-500 text-white rounded-lg">Delete</Button>
```

✅ **REQUIRED:**

```tsx
<Button variant="destructive">Delete</Button>
```

### Rule 6: Dynamic Overlays Must Use Approved Libraries

- **Bottom Sheets:** Only `@gorhom/bottom-sheet` (wrapped in `AppBottomSheet`)
- **Modals:** Only `react-native-modal` (wrapped in `Modal`)
- **Toasts:** Only `react-native-toast-message` (via `toast.show()`)
- **Menus/Popovers:** Only `@react-native-menu/menu` or `AppPopover`

Never build these from scratch with absolute positioning.

### Rule 7: Animations Must Use the Centralized System

Use `AnimatedPresence` wrappers (`Fade`, `SlideUp`, `LayoutItem`) from `components/ui/AnimatedPresence.tsx`. Never write raw `useAnimatedStyle` or `withTiming` in feature components.

### Rule 8: Icons Must Use lucide-react-native

All icons must come from `lucide-react-native`. Use the `color` prop with design token hex values (import from `lib/colors.ts`), or use NativeWind's `fill-` class.

### Rule 9: Forms Must Use React Hook Form + Zod

All forms must use `react-hook-form` with `@hookform/resolvers/zod`. Never manage form state manually with `useState`.

### Rule 10: Data Fetching Must Use React Query

All API calls must go through React Query hooks. Never use `useEffect` + `fetch` directly in components.

### Rule 11: Every Component Must Accept className

Every base component MUST accept a `className` prop for additional styling. Use `cn()` to merge classes.

✅ **REQUIRED:**

```tsx
interface ButtonProps {
  className?: string;
  // ... other props
}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <Pressable className={cn("base-styles", className)} {...props}>
      {/* ... */}
    </Pressable>
  );
}
```

---

## 1. Tech Stack

| Layer         | Technology                       | Purpose                     |
| ------------- | -------------------------------- | --------------------------- |
| Framework     | React Native + Expo (SDK 52+)    | Cross-platform mobile       |
| Routing       | Expo Router v4                   | File-based navigation       |
| Styling       | NativeWind v4                    | Tailwind CSS for RN         |
| Animations    | react-native-reanimated          | 60fps animations            |
| Gestures      | react-native-gesture-handler     | Touch handling              |
| Bottom Sheets | @gorhom/bottom-sheet             | Sliding panels              |
| Modals        | react-native-modal               | Center popups               |
| Toasts        | react-native-toast-message       | Notifications               |
| Icons         | lucide-react-native              | Icon set                    |
| Forms         | react-hook-form + zod            | Form management             |
| State         | Zustand                          | Client state                |
| Data          | @tanstack/react-query            | Server state                |
| Backend       | Supabase                         | Auth, DB, Storage, Realtime |
| Storage       | expo-secure-store + AsyncStorage | Tokens & cache              |
| Location      | expo-location                    | GPS services                |
| Images        | expo-image + expo-image-picker   | Optimized images            |
| Notifications | expo-notifications               | Push notifications          |
| Blur          | expo-blur                        | Glassmorphism               |
| Lists         | @shopify/flash-list              | High-perf lists             |

---

## 2. Project Setup

### Initial Scaffolding

```bash
npx create-expo-app@latest aykau-mobile --template blank-typescript
cd aykau-mobile
```

### Install Core Dependencies

```bash
# NativeWind v4
npm install nativewind@4
npm install --save-dev tailwindcss@3.4

# Navigation
npx expo install expo-router

# Animations & Gestures
npx expo install react-native-reanimated react-native-gesture-handler

# UI Components
npx expo install @gorhom/bottom-sheet react-native-modal react-native-toast-message
npm install lucide-react-native

# Forms
npm install react-hook-form @hookform/resolvers zod

# State Management
npm install zustand @tanstack/react-query

# Backend
npm install @supabase/supabase-js

# Storage
npx expo install expo-secure-store @react-native-async-storage/async-storage

# Location & Images
npx expo install expo-location expo-image expo-image-picker expo-notifications expo-blur

# Performance
npm install @shopify/flash-list
```

### Project Structure

```
aykau-mobile/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth group
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify-email.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home/Jobs
│   │   ├── chat.tsx
│   │   ├── wallet.tsx
│   │   └── profile.tsx
│   ├── jobs/
│   │   ├── [id].tsx             # Job detail
│   │   └── post.tsx             # Post job
│   ├── chat/
│   │   └── [conversationId].tsx
│   ├── onboarding/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── role.tsx
│   │   ├── customer.tsx
│   │   ├── artisan.tsx
│   │   └── complete.tsx
│   └── _layout.tsx              # Root layout
├── components/
│   ├── ui/                      # Base components (20)
│   │   ├── Button.tsx
│   │   ├── Text.tsx
│   │   ├── Card.tsx
│   │   ├── GlassCard.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Divider.tsx
│   │   ├── Spinner.tsx
│   │   ├── Switch.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Icon.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Popover.tsx
│   │   ├── AnimatedPresence.tsx
│   │   ├── SafeScreen.tsx
│   │   └── ListItem.tsx
│   ├── auth/                    # Auth feature components
│   ├── jobs/                    # Job feature components
│   ├── chat/                    # Chat feature components
│   ├── wallet/                  # Wallet feature components
│   ├── profile/                 # Profile feature components
│   ├── onboarding/              # Onboarding components
│   └── common/                  # Shared components
├── services/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── jobs.ts
│   │   ├── quotes.ts
│   │   ├── contracts.ts
│   │   ├── messages.ts
│   │   ├── wallet.ts
│   │   ├── profiles.ts
│   │   ├── storage.ts
│   │   └── disputes.ts
├── store/                       # Zustand stores
│   ├── auth.store.ts
│   ├── job.store.ts
│   ├── chat.store.ts
│   ├── wallet.store.ts
│   ├── profile.store.ts
│   └── ui.store.ts
├── hooks/                       # React Query hooks
│   ├── useAuth.ts
│   ├── useJobs.ts
│   ├── useJob.ts
│   ├── useCreateJob.ts
│   ├── useQuotes.ts
│   ├── useSendQuote.ts
│   ├── useConversations.ts
│   ├── useMessages.ts
│   ├── useSendMessage.ts
│   ├── useWallet.ts
│   ├── useBuyCredits.ts
│   ├── useWithdraw.ts
│   ├── useProfile.ts
│   ├── usePublicProfile.ts
│   ├── useUpdateProfile.ts
│   ├── useLocation.ts
│   ├── useImagePicker.ts
│   ├── useNotifications.ts
│   └── useDebounce.ts
├── lib/
│   ├── utils.ts                 # cn() helper
│   ├── colors.ts                # Color tokens
│   ├── animations.ts            # Animation config
│   ├── helpers.ts
│   └── formatters.ts
├── types/
│   ├── database.ts              # Supabase types
│   ├── api.ts
│   └── navigation.ts
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
└── package.json
```

---

## 3. Tailwind Configuration (Design Tokens)

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: {
          DEFAULT: "#1A73E8",
          50: "#E8F0FE",
          100: "#D2E3FC",
          200: "#AECBFA",
          300: "#8AB4F8",
          400: "#669DF6",
          500: "#4285F4",
          600: "#1A73E8",
          700: "#1967D2",
          800: "#185ABC",
          900: "#174EA6",
        },
        secondary: {
          DEFAULT: "#34A853",
          50: "#E6F4EA",
          100: "#CEEAD6",
          200: "#A8DAB5",
          300: "#81C995",
          400: "#5BB974",
          500: "#34A853",
          600: "#1E8E3E",
          700: "#188038",
          800: "#137333",
          900: "#0D652D",
        },
        tertiary: {
          DEFAULT: "#F9AB00",
          50: "#FEF7E0",
          100: "#FEEFC3",
          200: "#FEE192",
          300: "#FDD663",
          400: "#FCC936",
          500: "#F9AB00",
          600: "#F29900",
          700: "#EA8600",
          800: "#E27400",
          900: "#D96300",
        },
        // Semantic
        success: "#34A853",
        error: "#EA4335",
        warning: "#F9AB00",
        info: "#1A73E8",
        // Surface
        surface: {
          DEFAULT: "#FFFFFF",
          container: "#F8F9FA",
          "container-high": "#F1F3F4",
          "container-highest": "#E8EAED",
        },
        "on-surface": {
          DEFAULT: "#202124",
          variant: "#5F6368",
          muted: "#9AA0A6",
        },
        // Dark mode
        dark: {
          surface: "#1F1F1F",
          "surface-container": "#2D2D2D",
          "surface-container-high": "#383838",
          "on-surface": "#E8EAED",
          "on-surface-variant": "#9AA0A6",
        },
      },
      fontFamily: {
        sans: ["Inter-Regular", "System"],
        medium: ["Inter-Medium", "System"],
        semibold: ["Inter-SemiBold", "System"],
        bold: ["Inter-Bold", "System"],
      },
      fontSize: {
        "display-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "headline-lg": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-sm": ["10px", { lineHeight: "14px", fontWeight: "500" }],
      },
      spacing: {
        0.5: "2px",
        1: "4px",
        1.5: "6px",
        2: "8px",
        2.5: "10px",
        3: "12px",
        3.5: "14px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
```

---

## 4. Base UI Components (The Primitives)

These are the **ONLY** components allowed in feature code. Each is documented with props, variants, and implementation. Every component accepts a `className` prop.

### 4.1 Button

**File:** `components/ui/Button.tsx`
**Wraps:** `Pressable`
**Purpose:** All clickable actions

**Props:**

| Prop      | Type                                               | Default     | Description            |
| --------- | -------------------------------------------------- | ----------- | ---------------------- |
| variant   | `'solid' \| 'outline' \| 'ghost' \| 'destructive'` | `'solid'`   | Visual style           |
| color     | `'primary' \| 'secondary' \| 'tertiary'`           | `'primary'` | Color scheme           |
| size      | `'sm' \| 'md' \| 'lg'`                             | `'md'`      | Size                   |
| loading   | `boolean`                                          | `false`     | Shows spinner          |
| disabled  | `boolean`                                          | `false`     | Disabled state         |
| fullWidth | `boolean`                                          | `false`     | Stretches to container |
| leftIcon  | `ReactNode`                                        | —           | Icon before text       |
| rightIcon | `ReactNode`                                        | —           | Icon after text        |
| onPress   | `() => void`                                       | —           | Tap handler            |
| children  | `ReactNode`                                        | —           | Button label           |
| className | `string`                                           | —           | Additional classes     |

**Implementation:**

```tsx
import { Pressable, ActivityIndicator } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";
import { Spinner } from "./Spinner";

interface ButtonProps {
  variant?: "solid" | "outline" | "ghost" | "destructive";
  color?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "solid",
  color = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
  className,
}: ButtonProps) {
  const baseStyles = "flex-row items-center justify-center rounded-lg";

  const variantStyles = {
    solid: {
      primary: "bg-primary",
      secondary: "bg-secondary",
      tertiary: "bg-tertiary",
      destructive: "bg-error",
    },
    outline: {
      primary: "border-2 border-primary bg-transparent",
      secondary: "border-2 border-secondary bg-transparent",
      tertiary: "border-2 border-tertiary bg-transparent",
      destructive: "border-2 border-error bg-transparent",
    },
    ghost: {
      primary: "bg-transparent",
      secondary: "bg-transparent",
      tertiary: "bg-transparent",
      destructive: "bg-transparent",
    },
  };

  const sizeStyles = {
    sm: "px-3 py-1.5",
    md: "px-4 py-2.5",
    lg: "px-6 py-3.5",
  };

  const textColor = {
    solid: "text-white",
    outline: variant === "destructive" ? "text-error" : `text-${color}`,
    ghost: variant === "destructive" ? "text-error" : `text-${color}`,
  };

  return (
    <Pressable
      className={cn(
        baseStyles,
        variantStyles[variant][color],
        sizeStyles[size],
        fullWidth && "w-full",
        disabled && "opacity-50",
        className
      )}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
    >
      {loading ? (
        <Spinner size="sm" color="white" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            preset={size === "sm" ? "labelMd" : "bodyMd"}
            weight="semibold"
            color={variant === "solid" ? "white" : color}
            className={cn("mx-1", textColor[variant])}
          >
            {children}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
}
```

### 4.2 Text

**File:** `components/ui/Text.tsx`
**Wraps:** React Native `Text`
**Purpose:** All typography

**Props:**

| Prop          | Type                                                                                            | Default        | Description        |
| ------------- | ----------------------------------------------------------------------------------------------- | -------------- | ------------------ |
| preset        | `'displayLg' \| 'headlineLg' \| 'headlineMd' \| 'bodyLg' \| 'bodyMd' \| 'labelMd' \| 'labelSm'` | `'bodyMd'`     | Typography preset  |
| weight        | `'regular' \| 'medium' \| 'semibold' \| 'bold'`                                                 | `'regular'`    | Font weight        |
| color         | `string`                                                                                        | `'on-surface'` | Token color        |
| align         | `'left' \| 'center' \| 'right'`                                                                 | `'left'`       | Alignment          |
| numberOfLines | `number`                                                                                        | —              | Truncation         |
| children      | `ReactNode`                                                                                     | —              | Content            |
| className     | `string`                                                                                        | —              | Additional classes |

**Implementation:**

```tsx
import { Text as RNText } from "react-native";
import { cn } from "@/lib/utils";

interface TextProps {
  preset?:
    | "displayLg"
    | "headlineLg"
    | "headlineMd"
    | "bodyLg"
    | "bodyMd"
    | "labelMd"
    | "labelSm";
  weight?: "regular" | "medium" | "semibold" | "bold";
  color?: string;
  align?: "left" | "center" | "right";
  numberOfLines?: number;
  children: React.ReactNode;
  className?: string;
}

export function Text({
  preset = "bodyMd",
  weight = "regular",
  color = "on-surface",
  align = "left",
  numberOfLines,
  children,
  className,
}: TextProps) {
  const presetStyles = {
    displayLg: "text-display-lg",
    headlineLg: "text-headline-lg",
    headlineMd: "text-headline-md",
    bodyLg: "text-body-lg",
    bodyMd: "text-body-md",
    labelMd: "text-label-md",
    labelSm: "text-label-sm",
  };

  const weightStyles = {
    regular: "font-sans",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const colorStyles = {
    "on-surface": "text-on-surface",
    "on-surface-variant": "text-on-surface-variant",
    "on-surface-muted": "text-on-surface-muted",
    primary: "text-primary",
    secondary: "text-secondary",
    error: "text-error",
    white: "text-white",
  };

  return (
    <RNText
      className={cn(
        presetStyles[preset],
        weightStyles[weight],
        colorStyles[color as keyof typeof colorStyles] || `text-${color}`,
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      numberOfLines={numberOfLines}
      allowFontScaling
    >
      {children}
    </RNText>
  );
}
```

### 4.3 Card

**File:** `components/ui/Card.tsx`
**Wraps:** `View`
**Purpose:** Content containers

**Props:**

| Prop      | Type                                   | Default      | Description        |
| --------- | -------------------------------------- | ------------ | ------------------ |
| variant   | `'elevated' \| 'outlined' \| 'filled'` | `'elevated'` | Visual style       |
| padding   | `'none' \| 'sm' \| 'md' \| 'lg'`       | `'md'`       | Internal padding   |
| children  | `ReactNode`                            | —            | Content            |
| className | `string`                               | —            | Additional classes |

**Implementation:**

```tsx
import { View } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps {
  variant?: "elevated" | "outlined" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = "elevated",
  padding = "md",
  children,
  className,
}: CardProps) {
  const variantStyles = {
    elevated: "bg-surface shadow-md rounded-lg",
    outlined: "bg-surface border border-on-surface-muted rounded-lg",
    filled: "bg-surface-container rounded-lg",
  };

  const paddingStyles = {
    none: "",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <View
      className={cn(variantStyles[variant], paddingStyles[padding], className)}
    >
      {children}
    </View>
  );
}
```

### 4.4 GlassCard

**File:** `components/ui/GlassCard.tsx`
**Wraps:** `expo-blur` `BlurView` + `View`
**Purpose:** Glassmorphism containers (wallet, hero sections)

**Props:**

| Prop      | Type                   | Default   | Description        |
| --------- | ---------------------- | --------- | ------------------ |
| intensity | `number`               | `20`      | Blur intensity     |
| tint      | `'light' \| 'dark'`    | `'light'` | Blur tint          |
| padding   | `'sm' \| 'md' \| 'lg'` | `'md'`    | Padding            |
| children  | `ReactNode`            | —         | Content            |
| className | `string`               | —         | Additional classes |

**Implementation:**

```tsx
import { View } from "react-native";
import { BlurView } from "expo-blur";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  intensity?: number;
  tint?: "light" | "dark";
  padding?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({
  intensity = 20,
  tint = "light",
  padding = "md",
  children,
  className,
}: GlassCardProps) {
  const paddingStyles = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <View className={cn("rounded-xl overflow-hidden", className)}>
      <BlurView
        intensity={intensity}
        tint={tint}
        className={paddingStyles[padding]}
      >
        {children}
      </BlurView>
    </View>
  );
}
```

### 4.5 Input

**File:** `components/ui/Input.tsx`
**Wraps:** `TextInput`
**Purpose:** Text inputs, email, password, etc.

**Props:**

| Prop            | Type                     | Default     | Description                            |
| --------------- | ------------------------ | ----------- | -------------------------------------- |
| label           | `string`                 | —           | Label above input                      |
| placeholder     | `string`                 | —           | Placeholder text                       |
| value           | `string`                 | —           | Controlled value                       |
| onChangeText    | `(text: string) => void` | —           | Change handler                         |
| error           | `string`                 | —           | Error message                          |
| hint            | `string`                 | —           | Helper text                            |
| leftIcon        | `ReactNode`              | —           | Leading icon                           |
| rightIcon       | `ReactNode`              | —           | Trailing icon (e.g., eye for password) |
| secureTextEntry | `boolean`                | `false`     | Password masking                       |
| multiline       | `boolean`                | `false`     | Multi-line input                       |
| disabled        | `boolean`                | `false`     | Disabled state                         |
| autoFocus       | `boolean`                | `false`     | Auto focus                             |
| keyboardType    | `KeyboardType`           | `'default'` | Keyboard type                          |
| className       | `string`                 | —           | Additional classes                     |

**Implementation:**

```tsx
import { TextInput, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  multiline?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  hint,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  multiline = false,
  disabled = false,
  autoFocus = false,
  keyboardType = "default",
  className,
}: InputProps) {
  return (
    <View className={cn("w-full", className)}>
      {label && (
        <Text preset="labelMd" weight="medium" className="mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={cn(
          "flex-row items-center bg-surface-container rounded-lg border",
          error ? "border-error" : "border-on-surface-muted",
          disabled && "opacity-50"
        )}
      >
        {leftIcon && <View className="pl-3">{leftIcon}</View>}
        <TextInput
          className={cn(
            "flex-1 px-3 py-3 text-body-md text-on-surface",
            leftIcon && "pl-2",
            rightIcon && "pr-2",
            multiline && "min-h-[100px]"
          )}
          placeholder={placeholder}
          placeholderTextColor="#9AA0A6"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          editable={!disabled}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          accessibilityLabel={label || placeholder}
        />
        {rightIcon && <View className="pr-3">{rightIcon}</View>}
      </View>
      {error && (
        <Text preset="labelSm" color="error" className="mt-1">
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text preset="labelSm" color="on-surface-muted" className="mt-1">
          {hint}
        </Text>
      )}
    </View>
  );
}
```

### 4.6 Avatar

**File:** `components/ui/Avatar.tsx`
**Wraps:** `expo-image` `Image` + `View`
**Purpose:** User profile pictures

**Props:**

| Prop       | Type                                   | Default     | Description        |
| ---------- | -------------------------------------- | ----------- | ------------------ |
| src        | `string \| null`                       | —           | Image URL          |
| name       | `string`                               | —           | Fallback initials  |
| size       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`      | Size               |
| showStatus | `boolean`                              | `false`     | Online indicator   |
| status     | `'online' \| 'offline' \| 'busy'`      | `'offline'` | Status color       |
| className  | `string`                               | —           | Additional classes |

**Implementation:**

```tsx
import { View } from "react-native";
import { Image } from "expo-image";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  status?: "online" | "offline" | "busy";
  className?: string;
}

export function Avatar({
  src,
  name = "",
  size = "md",
  showStatus = false,
  status = "offline",
  className,
}: AvatarProps) {
  const sizeStyles = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const statusColors = {
    online: "bg-success",
    offline: "bg-on-surface-muted",
    busy: "bg-error",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View className={cn("relative", className)}>
      {src ? (
        <Image
          source={{ uri: src }}
          className={cn(sizeStyles[size], "rounded-full")}
          contentFit="cover"
          accessibilityLabel={`${name}'s profile picture`}
        />
      ) : (
        <View
          className={cn(
            sizeStyles[size],
            "rounded-full bg-primary items-center justify-center"
          )}
        >
          <Text
            preset={size === "xl" ? "headlineMd" : "bodyMd"}
            weight="bold"
            color="white"
          >
            {initials}
          </Text>
        </View>
      )}
      {showStatus && (
        <View
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
            statusColors[status]
          )}
        />
      )}
    </View>
  );
}
```

### 4.7 Badge

**File:** `components/ui/Badge.tsx`
**Wraps:** `View` + `Text`
**Purpose:** Status indicators, counts, tags

**Props:**

| Prop      | Type                                                            | Default     | Description                  |
| --------- | --------------------------------------------------------------- | ----------- | ---------------------------- |
| variant   | `'solid' \| 'outline' \| 'soft'`                                | `'soft'`    | Visual style                 |
| color     | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'neutral'` | `'neutral'` | Color                        |
| size      | `'sm' \| 'md'`                                                  | `'sm'`      | Size                         |
| count     | `number`                                                        | —           | Numeric badge (e.g., unread) |
| children  | `ReactNode`                                                     | —           | Text content                 |
| className | `string`                                                        | —           | Additional classes           |

**Implementation:**

```tsx
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface BadgeProps {
  variant?: "solid" | "outline" | "soft";
  color?: "primary" | "secondary" | "success" | "error" | "neutral";
  size?: "sm" | "md";
  count?: number;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "soft",
  color = "neutral",
  size = "sm",
  count,
  children,
  className,
}: BadgeProps) {
  const variantStyles = {
    solid: {
      primary: "bg-primary",
      secondary: "bg-secondary",
      success: "bg-success",
      error: "bg-error",
      neutral: "bg-on-surface-muted",
    },
    outline: {
      primary: "border-2 border-primary bg-transparent",
      secondary: "border-2 border-secondary bg-transparent",
      success: "border-2 border-success bg-transparent",
      error: "border-2 border-error bg-transparent",
      neutral: "border-2 border-on-surface-muted bg-transparent",
    },
    soft: {
      primary: "bg-primary-50",
      secondary: "bg-secondary-50",
      success: "bg-success/10",
      error: "bg-error/10",
      neutral: "bg-surface-container",
    },
  };

  const textColor = {
    solid: "text-white",
    outline: `text-${color}`,
    soft: `text-${color}`,
  };

  const sizeStyles = {
    sm: "px-2 py-0.5",
    md: "px-3 py-1",
  };

  if (count !== undefined) {
    return (
      <View
        className={cn(
          "rounded-full items-center justify-center",
          variantStyles[variant][color],
          size === "sm" ? "w-5 h-5" : "w-6 h-6",
          className
        )}
      >
        <Text
          preset="labelSm"
          weight="bold"
          color={variant === "solid" ? "white" : color}
        >
          {count > 99 ? "99+" : count}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={cn(
        "rounded-full",
        variantStyles[variant][color],
        sizeStyles[size],
        className
      )}
    >
      <Text
        preset="labelSm"
        weight="medium"
        color={variant === "solid" ? "white" : color}
      >
        {children}
      </Text>
    </View>
  );
}
```

### 4.8 Divider

**File:** `components/ui/Divider.tsx`
**Wraps:** `View`
**Purpose:** Visual separators

**Props:**

| Prop        | Type                             | Default        | Description        |
| ----------- | -------------------------------- | -------------- | ------------------ |
| orientation | `'horizontal' \| 'vertical'`     | `'horizontal'` | Direction          |
| spacing     | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'`         | Margin around      |
| className   | `string`                         | —              | Additional classes |

**Implementation:**

```tsx
import { View } from "react-native";
import { cn } from "@/lib/utils";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  spacing?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  spacing = "md",
  className,
}: DividerProps) {
  const spacingStyles = {
    none: "",
    sm: orientation === "horizontal" ? "my-2" : "mx-2",
    md: orientation === "horizontal" ? "my-4" : "mx-4",
    lg: orientation === "horizontal" ? "my-6" : "mx-6",
  };

  return (
    <View
      className={cn(
        "bg-on-surface-muted",
        orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
        spacingStyles[spacing],
        className
      )}
    />
  );
}
```

### 4.9 Spinner

**File:** `components/ui/Spinner.tsx`
**Wraps:** `ActivityIndicator`
**Purpose:** Loading indicators

**Props:**

| Prop       | Type                   | Default     | Description        |
| ---------- | ---------------------- | ----------- | ------------------ |
| size       | `'sm' \| 'md' \| 'lg'` | `'md'`      | Size               |
| color      | `string`               | `'primary'` | Color token        |
| fullScreen | `boolean`              | `false`     | Centered on screen |
| className  | `string`               | —           | Additional classes |

**Implementation:**

```tsx
import { ActivityIndicator, View } from "react-native";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Spinner({
  size = "md",
  color = "primary",
  fullScreen = false,
  className,
}: SpinnerProps) {
  const sizeMap = {
    sm: "small",
    md: "small",
    lg: "large",
  };

  const spinner = (
    <ActivityIndicator
      size={sizeMap[size]}
      color={color === "primary" ? "#1A73E8" : color}
      accessibilityLabel="Loading"
    />
  );

  if (fullScreen) {
    return (
      <View className={cn("flex-1 items-center justify-center", className)}>
        {spinner}
      </View>
    );
  }

  return spinner;
}
```

### 4.10 Switch

**File:** `components/ui/Switch.tsx`
**Wraps:** React Native `Switch`
**Purpose:** Toggle settings

**Props:**

| Prop          | Type                   | Default | Description        |
| ------------- | ---------------------- | ------- | ------------------ |
| value         | `boolean`              | —       | Current state      |
| onValueChange | `(v: boolean) => void` | —       | Change handler     |
| label         | `string`               | —       | Optional label     |
| disabled      | `boolean`              | `false` | Disabled state     |
| className     | `string`               | —       | Additional classes |

**Implementation:**

```tsx
import { Switch as RNSwitch, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  value,
  onValueChange,
  label,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <View className={cn("flex-row items-center", className)}>
      {label && (
        <Text preset="bodyMd" className="mr-3 flex-1">
          {label}
        </Text>
      )}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#E8EAED", true: "#AECBFA" }}
        thumbColor={value ? "#1A73E8" : "#9AA0A6"}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={label}
      />
    </View>
  );
}
```

### 4.11 Checkbox

**File:** `components/ui/Checkbox.tsx`
**Wraps:** `Pressable` + `View`
**Purpose:** Multi-select, terms acceptance

**Props:**

| Prop            | Type                   | Default | Description        |
| --------------- | ---------------------- | ------- | ------------------ |
| checked         | `boolean`              | —       | Current state      |
| onCheckedChange | `(v: boolean) => void` | —       | Change handler     |
| label           | `ReactNode`            | —       | Label (can be JSX) |
| disabled        | `boolean`              | `false` | Disabled state     |
| error           | `string`               | —       | Error message      |
| className       | `string`               | —       | Additional classes |

**Implementation:**

```tsx
import { Pressable, View } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  error,
  className,
}: CheckboxProps) {
  return (
    <View className={cn("w-full", className)}>
      <Pressable
        className={cn("flex-row items-center", disabled && "opacity-50")}
        onPress={() => onCheckedChange(!checked)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
      >
        <View
          className={cn(
            "w-5 h-5 rounded border-2 items-center justify-center mr-3",
            checked
              ? "bg-primary border-primary"
              : "bg-transparent border-on-surface-muted"
          )}
        >
          {checked && <Check size={14} color="white" strokeWidth={3} />}
        </View>
        {typeof label === "string" ? (
          <Text preset="bodyMd" className="flex-1">
            {label}
          </Text>
        ) : (
          <View className="flex-1">{label}</View>
        )}
      </Pressable>
      {error && (
        <Text preset="labelSm" color="error" className="mt-1 ml-8">
          {error}
        </Text>
      )}
    </View>
  );
}
```

### 4.12 Skeleton

**File:** `components/ui/Skeleton.tsx`
**Wraps:** `Animated.View` with pulse animation
**Purpose:** Loading placeholders

**Props:**

| Prop      | Type                                     | Default  | Description        |
| --------- | ---------------------------------------- | -------- | ------------------ |
| variant   | `'text' \| 'circle' \| 'rect' \| 'card'` | `'rect'` | Shape              |
| width     | `number \| string`                       | `'100%'` | Width              |
| height    | `number \| string`                       | `16`     | Height             |
| lines     | `number`                                 | `1`      | For text variant   |
| className | `string`                                 | —        | Additional classes |

**Implementation:**

```tsx
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect" | "card";
  width?: number | string;
  height?: number | string;
  lines?: number;
  className?: string;
}

export function Skeleton({
  variant = "rect",
  width = "100%",
  height = 16,
  lines = 1,
  className,
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const variantStyles = {
    text: {
      width: width,
      height: height,
      borderRadius: 4,
    },
    circle: {
      width: width,
      height: width,
      borderRadius: (typeof width === "number" ? width : 40) / 2,
    },
    rect: {
      width: width,
      height: height,
      borderRadius: 8,
    },
    card: {
      width: width,
      height: height,
      borderRadius: 12,
    },
  };

  if (variant === "text" && lines > 1) {
    return (
      <View className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              animatedStyle,
              {
                width: i === lines - 1 ? "70%" : "100%",
                height: height,
                backgroundColor: "#E8EAED",
                borderRadius: 4,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          ...variantStyles[variant],
          backgroundColor: "#E8EAED",
        },
      ]}
      className={className}
    />
  );
}
```

### 4.13 Icon

**File:** `components/ui/Icon.tsx`
**Wraps:** `lucide-react-native` icons
**Purpose:** Consistent icon rendering

**Props:**

| Prop        | Type             | Default        | Description        |
| ----------- | ---------------- | -------------- | ------------------ |
| name        | `LucideIconName` | —              | Icon name          |
| size        | `number`         | `20`           | Size in px         |
| color       | `string`         | `'on-surface'` | Token color        |
| strokeWidth | `number`         | `2`            | Stroke weight      |
| className   | `string`         | —              | Additional classes |

**Implementation:**

```tsx
import * as LucideIcons from "lucide-react-native";
import { cn } from "@/lib/utils";

type LucideIconName = keyof typeof LucideIcons;

interface IconProps {
  name: LucideIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function Icon({
  name,
  size = 20,
  color = "on-surface",
  strokeWidth = 2,
  className,
}: IconProps) {
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    return null;
  }

  const colorMap: Record<string, string> = {
    "on-surface": "#202124",
    "on-surface-variant": "#5F6368",
    "on-surface-muted": "#9AA0A6",
    primary: "#1A73E8",
    secondary: "#34A853",
    tertiary: "#F9AB00",
    error: "#EA4335",
    success: "#34A853",
    white: "#FFFFFF",
  };

  const iconColor = colorMap[color] || color;

  return (
    <IconComponent
      size={size}
      color={iconColor}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
```

### 4.14 BottomSheet

**File:** `components/ui/BottomSheet.tsx`
**Wraps:** `@gorhom/bottom-sheet`
**Purpose:** Sliding panels from bottom (filters, menus, share)

**Props:**

| Prop                 | Type        | Default   | Description        |
| -------------------- | ----------- | --------- | ------------------ |
| snapPoints           | `string[]`  | `['50%']` | Height stops       |
| title                | `string`    | —         | Optional header    |
| showHandle           | `boolean`   | `true`    | Drag indicator     |
| enablePanDownToClose | `boolean`   | `true`    | Swipe to dismiss   |
| children             | `ReactNode` | —         | Content            |
| className            | `string`    | —         | Additional classes |

**Imperative API:**

```tsx
// Usage
const bottomSheetRef = useRef<BottomSheetMethods>(null);
bottomSheetRef.current?.present();
bottomSheetRef.current?.close();
```

**Implementation:**

```tsx
import { forwardRef, useImperativeHandle, useRef } from "react";
import { View } from "react-native";
import GorhomBottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

export interface BottomSheetMethods {
  present: () => void;
  close: () => void;
}

interface BottomSheetProps {
  snapPoints?: string[];
  title?: string;
  showHandle?: boolean;
  enablePanDownToClose?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet = forwardRef<BottomSheetMethods, BottomSheetProps>(
  (
    {
      snapPoints = ["50%"],
      title,
      showHandle = true,
      enablePanDownToClose = true,
      children,
      className,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<GorhomBottomSheet>(null);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const renderBackdrop = (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    );

    return (
      <GorhomBottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "#FFFFFF" }}
        handleIndicatorStyle={{ backgroundColor: "#9AA0A6" }}
      >
        <View className={cn("flex-1 px-4", className)}>
          {showHandle && (
            <View className="w-10 h-1 bg-on-surface-muted rounded-full self-center mb-4" />
          )}
          {title && (
            <Text preset="headlineMd" weight="semibold" className="mb-4">
              {title}
            </Text>
          )}
          {children}
        </View>
      </GorhomBottomSheet>
    );
  }
);

BottomSheet.displayName = "BottomSheet";
```

### 4.15 Modal

**File:** `components/ui/Modal.tsx`
**Wraps:** `react-native-modal`
**Purpose:** Center popups, confirmations, alerts

**Props:**

| Prop        | Type                                                            | Default | Description        |
| ----------- | --------------------------------------------------------------- | ------- | ------------------ |
| isVisible   | `boolean`                                                       | —       | Visibility         |
| onClose     | `() => void`                                                    | —       | Close handler      |
| title       | `string`                                                        | —       | Modal title        |
| description | `string`                                                        | —       | Modal body         |
| actions     | `Array<{label: string, onPress: () => void, variant?: string}>` | —       | Action buttons     |
| children    | `ReactNode`                                                     | —       | Custom content     |
| className   | `string`                                                        | —       | Additional classes |

**Implementation:**

```tsx
import { View } from "react-native";
import RNModal from "react-native-modal";
import { cn } from "@/lib/utils";
import { Text } from "./Text";
import { Button } from "./Button";

interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: "solid" | "outline" | "ghost" | "destructive";
}

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions?: ModalAction[];
  children?: React.ReactNode;
  className?: string;
}

export function Modal({
  isVisible,
  onClose,
  title,
  description,
  actions,
  children,
  className,
}: ModalProps) {
  return (
    <RNModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <View
        className={cn("bg-surface rounded-xl p-6 mx-6 shadow-xl", className)}
      >
        {title && (
          <Text preset="headlineMd" weight="semibold" className="mb-2">
            {title}
          </Text>
        )}
        {description && (
          <Text preset="bodyMd" color="on-surface-variant" className="mb-4">
            {description}
          </Text>
        )}
        {children}
        {actions && actions.length > 0 && (
          <View className="flex-row gap-3 mt-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "solid"}
                onPress={action.onPress}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </View>
        )}
      </View>
    </RNModal>
  );
}
```

### 4.16 Toast

**File:** `components/ui/Toast.tsx`
**Wraps:** `react-native-toast-message`
**Purpose:** Transient notifications

**Imperative API:**

```tsx
import Toast from "react-native-toast-message";

// Show toast
Toast.show({
  type: "success", // 'success' | 'error' | 'info'
  text1: "Success",
  text2: "Operation completed",
  position: "top", // 'top' | 'bottom'
  visibilityTime: 3000,
});
```

**Implementation:**

```tsx
import RNToast from "react-native-toast-message";

export { RNToast as Toast };

// Add to root layout
export default function RootLayout() {
  return (
    <>
      {/* Your app */}
      <Toast />
    </>
  );
}
```

### 4.17 Popover

**File:** `components/ui/Popover.tsx`
**Wraps:** `@react-native-menu/menu` or custom
**Purpose:** Dropdown menus, action menus

**Props:**

| Prop      | Type                                           | Default | Description                |
| --------- | ---------------------------------------------- | ------- | -------------------------- |
| trigger   | `ReactNode`                                    | —       | Element that opens popover |
| items     | `Array<{label, icon?, onPress, destructive?}>` | —       | Menu items                 |
| align     | `'start' \| 'center' \| 'end'`                 | `'end'` | Alignment                  |
| className | `string`                                       | —       | Additional classes         |

**Implementation:**

```tsx
import { useState } from "react";
import { View, Pressable } from "react-native";
import { Menu } from "@react-native-menu/menu";
import { cn } from "@/lib/utils";

interface PopoverItem {
  label: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
}

interface PopoverProps {
  trigger: React.ReactNode;
  items: PopoverItem[];
  align?: "start" | "center" | "end";
  className?: string;
}

export function Popover({
  trigger,
  items,
  align = "end",
  className,
}: PopoverProps) {
  return (
    <View className={cn(className)}>
      <Menu
        actions={items.map((item) => ({
          id: item.label,
          title: item.label,
          image: item.icon,
          attributes: {
            destructive: item.destructive || false,
          },
        }))}
        onPressAction={({ nativeEvent }) => {
          const item = items.find((i) => i.label === nativeEvent.event);
          item?.onPress();
        }}
      >
        {trigger}
      </Menu>
    </View>
  );
}
```

### 4.18 AnimatedPresence

**File:** `components/ui/AnimatedPresence.tsx`
**Wraps:** `react-native-reanimated`
**Purpose:** Consistent enter/exit animations

**Exports:**

- `<Fade>` — opacity in/out
- `<SlideUp>` — slide from bottom
- `<SlideDown>` — slide from top
- `<ScaleIn>` — scale from center
- `<LayoutItem>` — auto-animate layout changes (lists)

**Props (all):**

| Prop      | Type        | Default | Description          |
| --------- | ----------- | ------- | -------------------- |
| delay     | `number`    | `0`     | Animation delay (ms) |
| children  | `ReactNode` | —       | Content              |
| className | `string`    | —       | Additional classes   |

**Implementation:**

```tsx
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  LayoutAnimationConfig,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

interface AnimationProps {
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

export function Fade({ delay = 0, children, className }: AnimationProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(200)}
      exiting={FadeOut.duration(200)}
      className={className}
    >
      {children}
    </Animated.View>
  );
}

export function SlideUp({ delay = 0, children, className }: AnimationProps) {
  return (
    <Animated.View
      entering={SlideInUp.delay(delay).duration(300)}
      exiting={SlideOutDown.duration(300)}
      className={className}
    >
      {children}
    </Animated.View>
  );
}

export function SlideDown({ delay = 0, children, className }: AnimationProps) {
  return (
    <Animated.View
      entering={SlideInDown.delay(delay).duration(300)}
      exiting={SlideOutUp.duration(300)}
      className={className}
    >
      {children}
    </Animated.View>
  );
}

export function ScaleIn({ delay = 0, children, className }: AnimationProps) {
  return (
    <Animated.View
      entering={ZoomIn.delay(delay).duration(200)}
      exiting={ZoomOut.duration(200)}
      className={className}
    >
      {children}
    </Animated.View>
  );
}

export function LayoutItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <LayoutAnimationConfig>
      <Animated.View layout={Animated.Layout} className={className}>
        {children}
      </Animated.View>
    </LayoutAnimationConfig>
  );
}
```

### 4.19 SafeScreen

**File:** `components/ui/SafeScreen.tsx`
**Wraps:** `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView`
**Purpose:** Root wrapper for every screen

**Props:**

| Prop            | Type                             | Default     | Description        |
| --------------- | -------------------------------- | ----------- | ------------------ |
| scroll          | `boolean`                        | `true`      | Use ScrollView     |
| padding         | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'`      | Content padding    |
| backgroundColor | `string`                         | `'surface'` | Background         |
| children        | `ReactNode`                      | —           | Content            |
| className       | `string`                         | —           | Additional classes |

**Implementation:**

```tsx
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { cn } from "@/lib/utils";

interface SafeScreenProps {
  scroll?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  backgroundColor?: string;
  children: React.ReactNode;
  className?: string;
}

export function SafeScreen({
  scroll = true,
  padding = "md",
  backgroundColor = "surface",
  children,
  className,
}: SafeScreenProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const bgStyles: Record<string, string> = {
    surface: "bg-surface",
    "surface-container": "bg-surface-container",
    primary: "bg-primary",
  };

  const content = (
    <View className={cn("flex-1", paddingStyles[padding])}>{children}</View>
  );

  return (
    <SafeAreaView
      className={cn(
        "flex-1",
        bgStyles[backgroundColor] || `bg-${backgroundColor}`
      )}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {scroll ? (
          <ScrollView
            className={cn("flex-1", className)}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View className={cn("flex-1", className)}>{content}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

### 4.20 ListItem

**File:** `components/ui/ListItem.tsx`
**Wraps:** `Pressable` + `View`
**Purpose:** Settings rows, list entries

**Props:**

| Prop        | Type         | Default | Description            |
| ----------- | ------------ | ------- | ---------------------- |
| title       | `string`     | —       | Primary text           |
| subtitle    | `string`     | —       | Secondary text         |
| leftSlot    | `ReactNode`  | —       | Avatar, icon, etc.     |
| rightSlot   | `ReactNode`  | —       | Badge, chevron, switch |
| onPress     | `() => void` | —       | Tap handler            |
| destructive | `boolean`    | `false` | Red text               |
| className   | `string`     | —       | Additional classes     |

**Implementation:**

```tsx
import { Pressable, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  className?: string;
}

export function ListItem({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  onPress,
  destructive = false,
  className,
}: ListItemProps) {
  return (
    <Pressable
      className={cn(
        "flex-row items-center py-3 px-4 bg-surface active:bg-surface-container",
        onPress && "opacity-100",
        className
      )}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {leftSlot && <View className="mr-3">{leftSlot}</View>}
      <View className="flex-1">
        <Text
          preset="bodyMd"
          weight="medium"
          color={destructive ? "error" : "on-surface"}
        >
          {title}
        </Text>
        {subtitle && (
          <Text preset="labelMd" color="on-surface-variant" className="mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      {rightSlot || (onPress && <ChevronRight size={20} color="#9AA0A6" />)}
    </Pressable>
  );
}
```

---

## 5. Feature Components

### 5.1 Auth Components (`components/auth/`)

| Component         | Props                                                                                          | Functionality                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| AuthInput         | name, label, placeholder, control (RHF), error, icon, secureTextEntry, keyboardType, className | Wraps Input with React Hook Form Controller. Auto-registers with form. |
| SocialLoginButton | provider ('google' \| 'apple'), onPress, loading, className                                    | Styled button with provider icon. Uses Button + Icon.                  |
| RoleSelector      | value, onChange, className                                                                     | Two Buttons (customer/artisan). Active state uses variant="solid".     |
| PasswordStrength  | password, className                                                                            | Visual meter (4 segments). Uses View with dynamic widths/colors.       |
| OtpInput          | length (default 6), value, onChange, className                                                 | Auto-advancing 6-digit input. Uses Input with refs.                    |
| AuthLayout        | title, subtitle, children, className                                                           | Screen wrapper with logo, title, scrollable content. Uses SafeScreen.  |

### 5.2 Job Components (`components/jobs/`)

| Component        | Props                                          | Functionality                                                                                    |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| JobCard          | job, onPress, showDistance, className          | Card with title, category, description, distance. Uses LayoutItem for list animation.            |
| JobFilters       | filters, onFilterChange, categories, className | Opens BottomSheet with Checkbox list for categories, Input for price range, Slider for distance. |
| JobSearchBar     | value, onChange, onFilterPress, className      | Input with search icon + filter button. Debounced.                                               |
| JobDetail        | job, className                                 | Full job view: GlassCard header, description, requirements, budget, location map.                |
| QuoteCard        | quote, onPress, status, className              | Card with artisan avatar, price, timeline, status Badge.                                         |
| QuoteForm        | jobId, onSubmit, className                     | RHF form: price Input, timeline Input, description Input, attachments. Submit via Button.        |
| LocationSelector | value, onChange, useGPS, className             | Input + Button "Use current location". Opens map or GPS.                                         |
| CategoryChip     | category, selected, onPress, className         | Small Pressable chip for horizontal category scroll.                                             |
| JobEmptyState    | onPostJob, className                           | EmptyState with illustration + CTA.                                                              |

### 5.3 Chat Components (`components/chat/`)

| Component        | Props                                           | Functionality                                                                                     |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ConversationList | conversations, onConversationPress, className   | FlashList of ListItems with Avatar, last message, timestamp, unread Badge.                        |
| ChatWindow       | conversationId, className                       | Full chat screen. Header with Avatar + name. FlashList of MessageBubbles. MessageInput at bottom. |
| MessageBubble    | message, isOwn, showAvatar, className           | Card with content, timestamp. Own messages use primary bg, others use surface-container-high.     |
| MessageInput     | onSend, onAttachmentPress, isLoading, className | Input + attachment Button + send Button. Auto-grows for multiline.                                |
| AttachmentPicker | onSelect, className                             | BottomSheet with options: Camera, Gallery, File. Uses Icon + ListItem.                            |
| TypingIndicator  | isTyping, className                             | Animated three-dot pulse. Uses AnimatedPresence.                                                  |

### 5.4 Wallet Components (`components/wallet/`)

| Component           | Props                                                           | Functionality                                                     |
| ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| BalanceCard         | fiatBalance, creditBalance, onBuyCredits, onWithdraw, className | GlassCard with large balance, credit count, two Buttons.          |
| CreditPackageCard   | package, isSelected, onSelect, className                        | Card with package details. Selected state uses primary border.    |
| TransactionList     | transactions, onTransactionPress, className                     | FlashList of ListItems with icon, description, amount, date.      |
| TransactionItem     | transaction, onPress, className                                 | Single row: type icon, description, signed amount, timestamp.     |
| WithdrawalForm      | onSubmit, balance, className                                    | RHF form: amount Input, bank ListItem selector, submit Button.    |
| BankAccountSelector | accounts, selected, onSelect, onAddNew, className               | List of ListItems + "Add new" button. Opens BottomSheet for form. |

### 5.5 Profile Components (`components/profile/`)

| Component        | Props                                                | Functionality                                                        |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| ProfileHeader    | profile, isOwnProfile, onEditPress, className        | Avatar (xl), name, role Badge, rating, location. Edit Button if own. |
| PortfolioGallery | projects, onProjectPress, onAddPress, className      | 2-column FlashList of Cards with images.                             |
| PortfolioItem    | project, onPress, className                          | Card with image, title, category.                                    |
| ReviewCard       | review, className                                    | Card with reviewer Avatar, name, stars, comment, date.               |
| SettingsItem     | icon, title, subtitle, onPress, rightSlot, className | ListItem wrapper for settings.                                       |
| OnboardingForm   | role, step, onSubmit, onBack, className              | Multi-step form using RHF. Progress indicator.                       |
| SkillTag         | skill, onRemove, className                           | Small Badge with X button for skill removal.                         |

### 5.6 Onboarding Components (`components/onboarding/`)

| Component          | Props                     | Functionality                                     |
| ------------------ | ------------------------- | ------------------------------------------------- |
| WelcomeScreen      | onGetStarted, className   | Hero illustration + value props + Button.         |
| RoleSelection      | onSelect, className       | Two large Cards (customer/artisan) with icons.    |
| CustomerOnboarding | onComplete, className     | RHF: name, location, preferences.                 |
| ArtisanOnboarding  | onComplete, className     | RHF: trade, skills, experience, portfolio photos. |
| LocationSetup      | onComplete, className     | GPS permission + manual entry.                    |
| ProfileCompletion  | onComplete, className     | Avatar upload + bio.                              |
| StepIndicator      | current, total, className | Horizontal dots showing progress.                 |

### 5.7 Common Components (`components/common/`)

| Component     | Props                                              | Functionality                                  |
| ------------- | -------------------------------------------------- | ---------------------------------------------- |
| Header        | title, showBack, rightSlot, transparent, className | Screen header. Uses Icon for back button.      |
| EmptyState    | icon, title, description, action, className        | Centered illustration + text + CTA.            |
| ErrorBoundary | children, fallback                                 | Catches render errors. Shows retry UI.         |
| LoadingScreen | message, className                                 | Full-screen Spinner with text.                 |
| PullToRefresh | onRefresh, refreshing, children, className         | ScrollView with pull-to-refresh.               |
| ImageUploader | images, onAdd, onRemove, max, className            | Grid of images + add button. Uses ImagePicker. |
| SectionHeader | title, action, onActionPress, className            | Row with title + "See all" button.             |
| TabBar        | tabs, activeTab, onChange, className               | Horizontal scrollable tabs.                    |
| ProgressBar   | value, max, color, className                       | Horizontal progress indicator.                 |
| RatingStars   | rating, size, readonly, className                  | 1-5 star display/input.                        |

---

## 6. Services Layer

### 6.1 Supabase Client (`services/supabase/client.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 6.2 Service Modules

| File         | Exports                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| auth.ts      | login, register, logout, getUser, signInWithGoogle, resetPassword, verifyEmail |
| jobs.ts      | listJobs, getJob, createJob, updateJob, deleteJob, subscribeToJobs             |
| quotes.ts    | listQuotes, getQuote, sendQuote, acceptQuote, rejectQuote                      |
| contracts.ts | getContract, markComplete, cancelContract                                      |
| messages.ts  | listConversations, getMessages, sendMessage, subscribeToMessages               |
| wallet.ts    | getBalance, buyCredits, withdraw, listTransactions                             |
| profiles.ts  | getProfile, updateProfile, uploadAvatar, getPublicProfile                      |
| storage.ts   | uploadFile, getPublicUrl, deleteFile                                           |
| disputes.ts  | raiseDispute, getDispute, submitEvidence                                       |

---

## 7. State Management

### 7.1 Zustand Stores (`store/`)

| Store            | State                                     | Actions                              |
| ---------------- | ----------------------------------------- | ------------------------------------ |
| auth.store.ts    | user, profile, isAuthenticated, isLoading | login, register, logout, refreshUser |
| job.store.ts     | filters, sortBy                           | setFilters, setSort, clearFilters    |
| chat.store.ts    | activeConversation, unreadCount           | setActive, markRead                  |
| wallet.store.ts  | balance, selectedBank                     | setBalance, selectBank               |
| profile.store.ts | draftProfile                              | updateDraft, clearDraft              |
| ui.store.ts      | theme, hasOnboarded                       | setTheme, setOnboarded               |

### 7.2 React Query Hooks (`hooks/`)

| Hook                        | Purpose                            |
| --------------------------- | ---------------------------------- |
| useAuth                     | Auth state + login/register/logout |
| useJobs(filters)            | Paginated job list with filters    |
| useJob(id)                  | Single job with poster profile     |
| useCreateJob                | Mutation for posting job           |
| useQuotes(jobId)            | Quotes for a job                   |
| useSendQuote                | Mutation for sending quote         |
| useConversations            | User's conversations               |
| useMessages(conversationId) | Real-time messages                 |
| useSendMessage              | Mutation for sending message       |
| useWallet                   | Balance + transactions             |
| useBuyCredits               | Mutation for purchasing            |
| useWithdraw                 | Mutation for withdrawal            |
| useProfile                  | Current user profile               |
| usePublicProfile(id)        | Public profile view                |
| useUpdateProfile            | Mutation for updates               |
| useLocation                 | GPS location                       |
| useImagePicker              | Camera/gallery picker              |
| useNotifications            | Push token + handlers              |
| useDebounce(value, delay)   | Debounce helper                    |

---

## 8. Navigation Architecture

### Tab Navigation (Main)

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Home, MessageCircle, Wallet, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1A73E8",
        tabBarInactiveTintColor: "#9AA0A6",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Auth Flow

```tsx
// app/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

export default function RootLayout() {
  const { isAuthenticated, hasOnboarded } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasOnboarded) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Days 1–5)

- [ ] Scaffold with `npx create-expo-app@latest aykau-mobile --template blank-typescript`
- [ ] Configure `tailwind.config.js` with all design tokens
- [ ] Configure `babel.config.js` + `metro.config.js`
- [ ] Create `lib/utils.ts` with `cn()` helper
- [ ] Create `lib/colors.ts` with color hex exports
- [ ] Create `lib/animations.ts` with centralized config
- [ ] Build all 20 `components/ui/` base components
- [ ] Build `SafeScreen`, `Header`, `LoadingScreen`
- [ ] Set up Expo Router structure (empty screens)
- [ ] Set up Supabase client
- [ ] Set up React Query provider
- [ ] Set up Zustand auth store
- [ ] **TEST:** Render every base component in isolation

### Phase 2: Authentication (Days 6–10)

- [ ] Build `AuthLayout`, `AuthInput`, `RoleSelector`
- [ ] Build login screen with email/password + Google OAuth
- [ ] Build register screen with role selection
- [ ] Build email verification screen
- [ ] Build forgot/reset password screens
- [ ] Implement auth middleware in root `_layout.tsx`
- [ ] Set up `expo-secure-store` for tokens
- [ ] **TEST:** Full auth flow end-to-end

### Phase 3: Core Features (Days 11–20)

- [ ] Build `JobCard`, `JobSearchBar`, `JobFilters`
- [ ] Build jobs list screen with FlashList
- [ ] Build job detail screen
- [ ] Build post job flow with RHF + Zod
- [ ] Build `QuoteCard`, `QuoteForm`
- [ ] Build quote submission flow
- [ ] Build `ConversationList`, `ChatWindow`, `MessageBubble`
- [ ] Build real-time messaging with Supabase subscriptions
- [ ] **TEST:** Post job → receive quote → start chat

### Phase 4: Wallet & Profile (Days 21–28)

- [ ] Build `BalanceCard`, `CreditPackageCard`
- [ ] Build wallet screen + buy credits flow
- [ ] Build `TransactionList`, `WithdrawalForm`
- [ ] Build withdrawal flow with `BankAccountSelector`
- [ ] Build `ProfileHeader`, `PortfolioGallery`
- [ ] Build profile edit screen
- [ ] Build settings screen with `SettingsItem` + `Switch`
- [ ] Build public artisan profile
- [ ] **TEST:** Buy credits → withdraw → update profile

### Phase 5: Onboarding & Polish (Days 29–35)

- [ ] Build full onboarding flow (5 screens)
- [ ] Add push notifications
- [ ] Add location services
- [ ] Add image uploads with `expo-image-picker`
- [ ] Add `Skeleton` loading states everywhere
- [ ] Add error boundaries
- [ ] Add empty states
- [ ] Add pull-to-refresh
- [ ] **TEST:** New user → onboarding → first job

### Phase 6: Testing & Deployment (Days 36–42)

- [ ] Unit tests for utils, hooks, stores
- [ ] Integration tests for services
- [ ] E2E tests with Maestro for critical flows
- [ ] Performance audit (Flipper, Reanimated monitor)
- [ ] Accessibility audit (screen reader testing)
- [ ] Build with EAS Build
- [ ] Submit to App Store + Play Store

---

## 10. Key Differences from Web

| Feature       | Web                   | Mobile                              |
| ------------- | --------------------- | ----------------------------------- |
| Styling       | Tailwind CSS          | NativeWind v4                       |
| UI Library    | Ant Design + Tailwind | Custom base components + NativeWind |
| Navigation    | Next.js App Router    | Expo Router                         |
| Images        | next/image            | expo-image                          |
| Location      | Browser Geolocation   | expo-location                       |
| Notifications | Web Push              | expo-notifications                  |
| Storage       | LocalStorage          | AsyncStorage + SecureStore          |
| Camera        | HTML input            | expo-image-picker                   |
| Payments      | Paystack Web          | Paystack Mobile SDK                 |
| Bottom Sheets | HTML dialogs          | @gorhom/bottom-sheet                |
| Animations    | CSS transitions       | react-native-reanimated             |

---

## 11. Shared Code Strategy

### Can Be Shared (via monorepo or copy)

- Zod validation schemas
- TypeScript types
- Helper functions (`lib/helpers.ts`, `lib/formatters.ts`)
- Constants
- Supabase service logic (with minor RN adaptations)
- Zustand store logic

### Must Be Adapted

- UI components (Ant Design → NativeWind base components)
- Navigation (Next.js → Expo Router)
- Forms (HTML → React Hook Form + RN inputs)
- File uploads (HTML input → expo-image-picker)
- Payments (Web Paystack → Mobile SDK)

---

## 12. Performance Checklist

- [x] Use `FlashList` instead of `FlatList` for all long lists
- [x] Use `expo-image` with caching for all remote images
- [x] Use Zustand selectors to prevent re-renders
- [x] Memoize expensive computations with `useMemo`
- [x] Use React Query for all server state (caching + deduping)
- [x] Implement optimistic updates for mutations
- [x] Lazy load screens with Expo Router
- [x] Use `React.memo` for list item components
- [x] Debounce search inputs with `useDebounce`
- [x] Tree-shake unused Lucide icons

---

## 13. Accessibility Checklist

- [x] Every `Button` has `accessibilityRole="button"` + `accessibilityLabel`
- [x] Every `Input` has `accessibilityLabel` matching its visible label
- [x] Every `ListItem` has `accessibilityRole="button"` or "summary"
- [x] Images have `accessibilityLabel` descriptions
- [x] Color contrast meets WCAG AA (4.5:1 for text)
- [x] Touch targets are at least 44×44px
- [x] Screen reader tested on iOS VoiceOver + Android TalkBack
- [x] Dynamic Type (font scaling) respected via `allowFontScaling`

---

## Summary

This plan provides a complete, unambiguous blueprint for building the Aykau mobile app with NativeWind v4. The 11 strict rules ensure that once base components are built, every feature component uses them correctly — no raw primitives, no hardcoded values, no inconsistent animations. Every component accepts a `className` prop for flexibility while maintaining design system compliance.

**Key highlights:**

- ✅ 20 base UI components with full documentation
- ✅ Every component accepts `className` for customization
- ✅ Strict rules prevent primitive usage after Phase 1
- ✅ Complete mapping to Supabase schema
- ✅ Luminous Marketplace design system compliance
- ✅ Phased implementation for manageable development
- ✅ Native performance with Reanimated animations
- ✅ Accessible by design (WAI-ARIA compliant)
