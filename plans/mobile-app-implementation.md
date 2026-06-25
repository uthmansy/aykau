# Aykau Mobile App Implementation Plan

## Design System Compliance

**IMPORTANT:** This mobile app strictly follows the **Luminous Marketplace Design System** defined in `DESIGN.md`. All colors, typography, spacing, and component styles must match the design system specifications exactly.

### Design System Reference

- **Design System Name:** Luminous Marketplace
- **Style:** Corporate Modern with Glassmorphism accents
- **Brand Personality:** Professional, efficient, transparent, approachable

---

## Overview

Build a native mobile application for Aykau using React Native, Expo, and Tamagui that mirrors the web platform's functionality while providing a native mobile experience.

**Tech Stack:**

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **Tamagui** - UI component library with design system
- **Expo Router** - File-based navigation
- **Zustand** - State management (consistent with web)
- **Supabase** - Backend (shared with web)
- **React Query** - Data fetching and caching
- **Expo Notifications** - Push notifications
- **Expo Location** - GPS and location services
- **Expo Image Picker** - Photo uploads
- **Expo Secure Store** - Secure token storage

---

## 1. Project Setup & Configuration

### Initial Setup

```bash
# Create Expo app with TypeScript template
npx create-expo-app@latest aykau-mobile --template expo-template-blank-typescript

cd aykau-mobile

# Install core dependencies
npx expo install expo-router expo-linking expo-constants expo-status-bar
npx expo install react-native-screens react-native-safe-area-context

# Install Tamagui and dependencies
npx expo install tamagui @tamagui/config @tamagui/lucide-icons
npx expo install react-native-reanimated

# Install state management and data fetching
npm install zustand @tanstack/react-query

# Install Supabase
npm install @supabase/supabase-js @react-native-async-storage/async-storage

# Install additional utilities
npx expo install expo-secure-store expo-location expo-image-picker expo-notifications
npx expo install expo-font expo-linear-gradient expo-blur
npm install zod react-hook-form @hookform/resolvers
npm install date-fns

# Install dev dependencies
npm install -D @types/react typescript
```

### Project Structure

```
aykau-mobile/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Authentication routes
│   │   ├── _layout.tsx           # Auth layout
│   │   ├── login.tsx             # Login screen
│   │   ├── register.tsx          # Registration screen
│   │   ├── forgot-password.tsx   # Password recovery
│   │   ├── verify-email.tsx      # Email verification
│   │   └── reset-password.tsx    # Password reset
│   │
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx           # Tab layout configuration
│   │   ├── index.tsx             # Home/Dashboard
│   │   ├── jobs.tsx              # Job listings
│   │   ├── messages.tsx          # Messaging
│   │   ├── wallet.tsx            # Wallet & credits
│   │   └── profile.tsx           # User profile
│   │
│   ├── (dashboard)/              # Dashboard screens
│   │   ├── _layout.tsx           # Dashboard layout
│   │   ├── job-details/
│   │   │   └── [id].tsx          # Job detail view
│   │   ├── post-job/
│   │   │   └── index.tsx         # Post new job
│   │   ├── my-jobs/
│   │   │   └── index.tsx         # User's posted jobs
│   │   ├── quotes/
│   │   │   ├── [id].tsx          # Quote detail
│   │   │   └── send/[jobId].tsx  # Send quote
│   │   ├── contracts/
│   │   │   └── [id].tsx          # Contract details
│   │   ├── disputes/
│   │   │   ├── [id].tsx          # Dispute detail
│   │   │   └── raise/[contractId].tsx # Raise dispute
│   │   ├── portfolio/
│   │   │   └── index.tsx         # Portfolio management
│   │   ├── settings/
│   │   │   └── index.tsx         # Settings screen
│   │   └── withdrawals/
│   │       └── index.tsx         # Withdrawal management
│   │
│   ├── (public)/                 # Public screens
│   │   ├── artisan-profile/
│   │   │   └── [id].tsx          # Public artisan profile
│   │   └── onboarding/
│   │       └── index.tsx         # Onboarding flow
│   │
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 screen
│
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components (Tamagui)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Text.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Divider.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts              # Barrel export
│   │
│   ├── auth/                     # Auth components
│   │   ├── AuthInput.tsx
│   │   ├── SocialLoginButton.tsx
│   │   ├── RoleSelector.tsx
│   │   └── PasswordStrength.tsx
│   │
│   ├── jobs/                     # Job-related components
│   │   ├── JobCard.tsx
│   │   ├── JobFilters.tsx
│   │   ├── JobSearchBar.tsx
│   │   ├── JobDetail.tsx
│   │   ├── QuoteCard.tsx
│   │   ├── QuoteForm.tsx
│   │   └── LocationSelector.tsx
│   │
│   ├── chat/                     # Messaging components
│   │   ├── ConversationList.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── AttachmentPicker.tsx
│   │
│   ├── wallet/                   # Wallet components
│   │   ├── BalanceCard.tsx
│   │   ├── CreditPackageCard.tsx
│   │   ├── TransactionList.tsx
│   │   ├── WithdrawalForm.tsx
│   │   └── BankAccountSelector.tsx
│   │
│   ├── profile/                  # Profile components
│   │   ├── ProfileHeader.tsx
│   │   ├── PortfolioGallery.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── SettingsItem.tsx
│   │   └── OnboardingForm.tsx
│   │
│   ├── common/                   # Shared components
│   │   ├── Header.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── PullToRefresh.tsx
│   │   └── ImageUploader.tsx
│   │
│   └── index.ts                  # Barrel export
│
├── services/                     # Service layer
│   ├── supabase/
│   │   ├── client.ts             # Supabase client
│   │   ├── auth.ts               # Auth service
│   │   ├── jobs.ts               # Jobs service
│   │   ├── quotes.ts             # Quotes service
│   │   ├── contracts.ts          # Contracts service
│   │   ├── messages.ts           # Messages service
│   │   ├── wallet.ts             # Wallet service
│   │   ├── profiles.ts           # Profiles service
│   │   └── storage.ts            # File storage service
│   │
│   ├── api/
│   │   ├── client.ts             # API client (if needed)
│   │   └── endpoints.ts          # API endpoints
│   │
│   └── notifications/
│       ├── push.ts               # Push notification service
│       └── local.ts              # Local notification service
│
├── store/                        # Zustand stores
│   ├── auth.store.ts             # Auth state
│   ├── job.store.ts              # Job state
│   ├── chat.store.ts             # Chat state
│   ├── wallet.store.ts           # Wallet state
│   ├── profile.store.ts          # Profile state
│   └── ui.store.ts               # UI state (theme, etc.)
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts                # Auth hook
│   ├── useJobs.ts                # Jobs hook
│   ├── useJob.ts                 # Single job hook
│   ├── useQuotes.ts              # Quotes hook
│   ├── useMessages.ts            # Messages hook
│   ├── useWallet.ts              # Wallet hook
│   ├── useProfile.ts             # Profile hook
│   ├── useLocation.ts            # Location hook
│   ├── useImagePicker.ts         # Image picker hook
│   ├── useNotifications.ts       # Notifications hook
│   └── useDebounce.ts            # Debounce hook
│
├── lib/                          # Utilities
│   ├── constants.ts              # App constants
│   ├── types.ts                  # TypeScript types
│   ├── validators.ts             # Zod schemas
│   ├── helpers.ts                # Helper functions
│   ├── formatters.ts             # Data formatters
│   └── storage.ts                # Storage utilities
│
├── theme/                        # Tamagui theme
│   ├── config.ts                 # Tamagui configuration
│   ├── tokens.ts                 # Design tokens
│   ├── themes.ts                 # Light/dark themes
│   └── animations.ts             # Animation configs
│
├── assets/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── types/                        # Global types
│   ├── navigation.ts             # Navigation types
│   ├── api.ts                    # API response types
│   └── models.ts                 # Data model types
│
├── app.json                      # Expo configuration
├── tamagui.config.ts             # Tamagui config
├── tsconfig.json                 # TypeScript config
├── babel.config.js               # Babel config
├── metro.config.js               # Metro config
└── package.json                  # Dependencies
```

---

## 2. Navigation Architecture

### Tab Navigation (Main)

```typescript
// app/(tabs)/_layout.tsx
<Tabs>
  <Tabs.Screen
    name="index"
    options={{
      title: 'Home',
      tabBarIcon: ({ focused }) => <HomeIcon filled={focused} />
    }}
  />
  <Tabs.Screen
    name="jobs"
    options={{
      title: 'Jobs',
      tabBarIcon: ({ focused }) => <BriefcaseIcon filled={focused} />
    }}
  />
  <Tabs.Screen
    name="messages"
    options={{
      title: 'Messages',
      tabBarIcon: ({ focused }) => <MessageIcon filled={focused} />,
      tabBarBadge: unreadCount // Show unread badge
    }}
  />
  <Tabs.Screen
    name="wallet"
    options={{
      title: 'Wallet',
      tabBarIcon: ({ focused }) => <WalletIcon filled={focused} />
    }}
  />
  <Tabs.Screen
    name="profile"
    options={{
      title: 'Profile',
      tabBarIcon: ({ focused }) => <UserIcon filled={focused} />
    }}
  />
</Tabs>
```

### Navigation Flow

```
App Start
  ↓
Auth Check (middleware)
  ↓
├─ Not Authenticated → (auth)/login
│                        ↓
│                      (auth)/register
│                        ↓
│                      (auth)/verify-email
│
└─ Authenticated → (tabs)/
     ↓
   Home Screen
     ↓
   ├─ View Jobs → (dashboard)/job-details/[id]
   │                ↓
   │              ├─ Send Quote → (dashboard)/quotes/send/[jobId]
   │                ├─ Contact Artisan → (dashboard)/messages/[conversationId]
   │                └─ View Profile → (public)/artisan-profile/[id]
   │
   ├─ Post Job → (dashboard)/post-job
   │
   ├─ My Jobs → (dashboard)/my-jobs
   │              ↓
   │            (dashboard)/quotes/[id]
   │              ↓
   │            (dashboard)/contracts/[id]
   │              ↓
   │            (dashboard)/disputes/[id]
   │
   ├─ Messages → (tabs)/messages
   │              ↓
   │            Chat Window (modal or screen)
   │
   ├─ Wallet → (tabs)/wallet
   │            ↓
   │          ├─ Buy Credits
   │            ├─ Withdraw
   │            └─ Transaction History
   │
   └─ Profile → (tabs)/profile
                 ↓
               ├─ Edit Profile
               ├─ Portfolio
               ├─ Settings
               └─ Withdrawals
```

---

## 3. Tamagui Theme Configuration

### Design Tokens (Strictly from DESIGN.md)

```typescript
// theme/tokens.ts
// Based on Luminous Marketplace Design System
export const tokens = {
  color: {
    // Surface colors (from DESIGN.md)
    surface: "#fbf8ff",
    surfaceDim: "#dcd9e0",
    surfaceBright: "#fbf8ff",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f5f2fa",
    surfaceContainer: "#f0ecf4",
    surfaceContainerHigh: "#eae7ef",
    surfaceContainerHighest: "#e4e1e9",
    surfaceGlass: "rgba(255, 255, 255, 0.7)",
    surfaceTint: "#5156a7",

    // On-surface colors
    onSurface: "#1b1b20",
    onSurfaceVariant: "#464651",
    inverseSurface: "#303036",
    inverseOnSurface: "#f3eff7",

    // Outline colors
    outline: "#777682",
    outlineVariant: "#c7c5d3",

    // Primary colors (Deep Navy)
    primary: "#15196c",
    onPrimary: "#ffffff",
    primaryContainer: "#2d3282",
    onPrimaryContainer: "#999ff5",
    inversePrimary: "#bfc2ff",
    primaryFixed: "#e0e0ff",
    primaryFixedDim: "#bfc2ff",
    onPrimaryFixed: "#070963",
    onPrimaryFixedVariant: "#393e8e",

    // Secondary colors (Coral Orange)
    secondary: "#a53b15",
    onSecondary: "#ffffff",
    secondaryContainer: "#ff7d52",
    onSecondaryContainer: "#6d1d00",
    secondaryFixed: "#ffdbd0",
    secondaryFixedDim: "#ffb59e",
    onSecondaryFixed: "#3a0b00",
    onSecondaryFixedVariant: "#842500",

    // Tertiary colors (Soft Purple)
    tertiary: "#2f0077",
    onTertiary: "#ffffff",
    tertiaryContainer: "#4900ae",
    onTertiaryContainer: "#b395ff",
    tertiaryFixed: "#e9ddff",
    tertiaryFixedDim: "#d0bcff",
    onTertiaryFixed: "#23005c",
    onTertiaryFixedVariant: "#5516be",

    // Error colors
    error: "#ba1a1a",
    onError: "#ffffff",
    errorContainer: "#ffdad6",
    onErrorContainer: "#93000a",

    // Background
    background: "#fbf8ff",
    onBackground: "#1b1b20",

    // Surface variant
    surfaceVariant: "#e4e1e9",

    // Success
    successEmerald: "#10B981",

    // Sidebar
    sidebarDark: "#0F172A",
  },

  // Spacing based on 8px base unit (from DESIGN.md)
  space: {
    xs: 4, // 0.5 * base
    sm: 8, // 1 * base
    md: 16, // 2 * base
    lg: 24, // 3 * base (gutter)
    xl: 32, // 4 * base
    "2xl": 40, // 5 * base (margin-desktop)
    "3xl": 48, // 6 * base
    "4xl": 64, // 8 * base
  },

  // Container and layout (from DESIGN.md)
  size: {
    containerMax: 1440,
    gutter: 24,
    marginDesktop: 40,
    marginMobile: 16,
    sidebarWidth: 280,
  },

  // Typography (from DESIGN.md)
  font: {
    family: {
      heading: "Manrope", // For headings
      body: "Inter", // For body text
    },
    size: {
      displayLg: 48,
      headlineLg: 32,
      headlineLgMobile: 24,
      headlineMd: 24,
      bodyLg: 18,
      bodyMd: 16,
      labelMd: 14,
      labelSm: 12,
    },
    weight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      displayLg: 56,
      headlineLg: 40,
      headlineLgMobile: 32,
      headlineMd: 32,
      bodyLg: 28,
      bodyMd: 24,
      labelMd: 20,
      labelSm: 16,
    },
    letterSpacing: {
      displayLg: -0.02,
      labelSm: 0.05,
    },
  },

  // Border radius (from DESIGN.md)
  radius: {
    sm: 4, // 0.25rem
    default: 8, // 0.5rem - standard components
    md: 12, // 0.75rem
    lg: 16, // 1rem - large containers
    xl: 24, // 1.5rem
    full: 9999, // pill shapes
  },

  // Elevation shadows (from DESIGN.md)
  shadow: {
    level0: "none",
    level1: "0px 4px 20px rgba(0, 0, 0, 0.04)",
    level2: "0px 4px 20px rgba(0, 0, 0, 0.04)", // Cards
    level3: "0px 10px 32px rgba(0, 0, 0, 0.12)", // Popovers
    // Glassmorphism for overlays
    glass: {
      blur: 12,
      background: "rgba(255, 255, 255, 0.7)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
  },

  zIndex: {
    dropdown: 1000,
    modal: 2000,
    toast: 3000,
  },
};
```

### Tamagui Config

```typescript
// tamagui.config.ts
import { createTamagui } from "tamagui";
import { createAnimations } from "@tamagui/animations-react-native";
import { tokens } from "./theme/tokens";
import { themes } from "./theme/themes";

const animations = createAnimations({
  fast: {
    type: "spring",
    damping: 20,
    mass: 1,
    stiffness: 200,
  },
  medium: {
    type: "spring",
    damping: 15,
    mass: 1,
    stiffness: 150,
  },
  slow: {
    type: "spring",
    damping: 10,
    mass: 1,
    stiffness: 100,
  },
});

export const tamaguiConfig = createTamagui({
  animations,
  themes,
  tokens,
  media: {
    xs: { maxWidth: 380 },
    sm: { maxWidth: 640 },
    md: { maxWidth: 768 },
    lg: { maxWidth: 1024 },
    xl: { maxWidth: 1280 },
  },
  shorthands: {
    ai: "alignItems",
    bc: "backgroundColor",
    br: "borderRadius",
    f: "flex",
    fd: "flexDirection",
    fw: "flexWrap",
    jc: "justifyContent",
    m: "margin",
    mb: "marginBottom",
    ml: "marginLeft",
    mr: "marginRight",
    mt: "marginTop",
    p: "padding",
    pb: "paddingBottom",
    pl: "paddingLeft",
    pr: "paddingRight",
    pt: "paddingTop",
    w: "width",
    h: "height",
  },
});

export type AppConfig = typeof tamaguiConfig;
```

---

## 4. Core Features Implementation

### 4.1 Authentication

**Screens:**

- Login (email/password + Google OAuth)
- Register (with role selection)
- Email Verification
- Forgot Password
- Reset Password

**Key Components:**

```typescript
// components/auth/AuthInput.tsx
interface AuthInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  icon?: React.ReactNode;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
}

// components/auth/RoleSelector.tsx
interface RoleSelectorProps {
  value: "customer" | "artisan";
  onChange: (role: "customer" | "artisan") => void;
}
```

**State Management:**

```typescript
// store/auth.store.ts
interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: Role
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

### 4.2 Job Browsing & Search

**Screens:**

- Job Listings (with filters)
- Job Detail
- Post Job

**Key Components:**

```typescript
// components/jobs/JobCard.tsx
interface JobCardProps {
  job: JobListing;
  onPress: () => void;
  showDistance?: boolean;
}

// components/jobs/JobFilters.tsx
interface JobFiltersProps {
  filters: JobFiltersState;
  onFilterChange: (filters: JobFiltersState) => void;
  categories: ServiceCategory[];
}

// components/jobs/LocationSelector.tsx
interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  useGPS?: boolean;
}
```

**Hooks:**

```typescript
// hooks/useJobs.ts
export function useJobs(filters?: JobFilters) {
  // Fetch jobs with filters
  // Support pagination
  // Support real-time updates
}

// hooks/useJob.ts
export function useJob(jobId: string) {
  // Fetch single job
  // Include poster profile
  // Include quote count
}
```

### 4.3 Messaging System

**Screens:**

- Conversation List
- Chat Window

**Key Components:**

```typescript
// components/chat/ConversationList.tsx
interface ConversationListProps {
  conversations: Conversation[];
  onConversationPress: (id: string) => void;
}

// components/chat/ChatWindow.tsx
interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

// components/chat/MessageBubble.tsx
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

// components/chat/MessageInput.tsx
interface MessageInputProps {
  onSend: (content: string, attachments?: Attachment[]) => void;
  onAttachmentPress: () => void;
  isLoading?: boolean;
}
```

**Real-time Updates:**

```typescript
// hooks/useMessages.ts
export function useMessages(conversationId: string) {
  // Subscribe to real-time messages
  // Handle optimistic updates
  // Mark messages as read
}
```

### 4.4 Wallet & Payments

**Screens:**

- Wallet Overview
- Buy Credits
- Withdraw Funds
- Transaction History

**Key Components:**

```typescript
// components/wallet/BalanceCard.tsx
interface BalanceCardProps {
  fiatBalance: number;
  creditBalance: number;
  onBuyCredits: () => void;
  onWithdraw: () => void;
}

// components/wallet/CreditPackageCard.tsx
interface CreditPackageCardProps {
  package: CreditPackage;
  onSelect: () => void;
  isSelected?: boolean;
}

// components/wallet/TransactionList.tsx
interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress: (id: string) => void;
}
```

### 4.5 Profile & Portfolio

**Screens:**

- Profile Overview
- Edit Profile
- Portfolio Management
- Settings

**Key Components:**

```typescript
// components/profile/ProfileHeader.tsx
interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEditPress?: () => void;
}

// components/profile/PortfolioGallery.tsx
interface PortfolioGalleryProps {
  projects: PortfolioProject[];
  onProjectPress: (id: string) => void;
  onAddPress?: () => void;
}

// components/profile/ReviewCard.tsx
interface ReviewCardProps {
  review: Review;
}
```

### 4.6 Onboarding Flow

**Screens:**

- Welcome
- Role Selection
- Customer Onboarding
- Artisan Onboarding
- Location Setup
- Profile Completion

**Flow:**

```typescript
// app/(public)/onboarding/index.tsx
const OnboardingFlow = () => {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"customer" | "artisan" | null>(null);

  const steps = [
    { component: WelcomeScreen, next: () => setStep(1) },
    {
      component: RoleSelection,
      next: (role) => {
        setRole(role);
        setStep(2);
      },
    },
    {
      component: role === "customer" ? CustomerOnboarding : ArtisanOnboarding,
      next: () => setStep(3),
    },
    { component: LocationSetup, next: () => setStep(4) },
    { component: ProfileCompletion, next: () => router.replace("/(tabs)") },
  ];

  return steps[step].component;
};
```

---

## 5. Supabase Integration

### Client Setup

```typescript
// services/supabase/client.ts
import "react-native-url-polyfill/auto";
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

### Auth Service

```typescript
// services/supabase/auth.ts
export const authService = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch profile with role
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return { user: data.user, profile };
  },

  register: async (
    email: string,
    password: string,
    fullName: string,
    role: Role
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) throw error;

    // Create profile
    await supabase.from("profiles").insert({
      id: data.user!.id,
      full_name: fullName,
      current_active_role: role,
      completed_onboarding_roles: [role],
    });

    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { user, profile };
  },

  signInWithGoogle: async () => {
    // Note: OAuth in React Native requires additional setup
    // Use expo-auth-session or react-native-app-auth
  },
};
```

### Real-time Subscriptions

```typescript
// services/supabase/messages.ts
export const messagesService = {
  subscribeToMessages: (
    conversationId: string,
    callback: (message: Message) => void
  ) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },

  unsubscribe: (channel: RealtimeChannel) => {
    supabase.removeChannel(channel);
  },
};
```

---

## 6. Push Notifications

### Setup

```typescript
// services/notifications/push.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export const pushNotificationService = {
  registerForPushNotifications: async () => {
    if (!Device.isDevice) {
      console.log("Push notifications only work on physical devices");
      return;
    }

    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push notification token");
      return;
    }

    // Get push token
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;

    // Save token to backend
    await supabase
      .from("profiles")
      .update({ push_token: token })
      .eq("id", userId);

    return token;
  },

  handleNotification: (notification: Notifications.Notification) => {
    // Handle notification tap
    const { data } = notification.request.content;

    if (data.type === "message") {
      router.push(`/(dashboard)/messages/${data.conversationId}`);
    } else if (data.type === "job_alert") {
      router.push(`/(dashboard)/job-details/${data.jobId}`);
    }
  },
};
```

---

## 7. Location Services

### GPS Integration

```typescript
// hooks/useLocation.ts
import * as Location from "expo-location";

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLoading(false);
    } catch (err) {
      setError("Failed to get location");
      setLoading(false);
    }
  };

  return { location, loading, error, requestLocation };
}
```

---

## 8. Image Handling

### Image Picker

```typescript
// hooks/useImagePicker.ts
import * as ImagePicker from "expo-image-picker";

export function useImagePicker() {
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const pickImages = async (multiple: boolean = true) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access camera roll was denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access camera was denied");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  const uploadToSupabase = async (
    image: ImagePicker.ImagePickerAsset,
    path: string
  ) => {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    const fileExt = image.uri.split(".").pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, blob);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("uploads").getPublicUrl(fileName);

    return publicUrl;
  };

  return { images, setImages, pickImages, takePhoto, uploadToSupabase };
}
```

---

## 9. Performance Optimization

### Key Strategies

1. **Image Optimization**
   - Use `expo-image` for optimized image loading
   - Implement lazy loading for lists
   - Cache images locally

2. **List Virtualization**
   - Use `FlashList` instead of `FlatList` for better performance
   - Implement windowing for long lists

3. **State Management**
   - Use Zustand selectors to prevent unnecessary re-renders
   - Memoize expensive computations

4. **Network Optimization**
   - Implement React Query for caching
   - Use optimistic updates for better UX
   - Implement retry logic for failed requests

5. **Bundle Size**
   - Use tree shaking
   - Lazy load screens with Expo Router
   - Optimize images and assets

---

## 10. Testing Strategy

### Unit Tests

- Test utility functions
- Test custom hooks
- Test store actions

### Integration Tests

- Test API service calls
- Test navigation flows
- Test form submissions

### E2E Tests

- Use Detox or Maestro for E2E testing
- Test critical user flows:
  - Registration → Onboarding → Post Job
  - Login → Browse Jobs → Send Quote
  - Login → Messages → Send Message
  - Login → Wallet → Buy Credits

---

## 11. Deployment

### App Configuration

```json
// app.json
{
  "expo": {
    "name": "Aykau",
    "slug": "aykau-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "aykau",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#15196c"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.aykau.mobile",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to find artisans near you",
        "NSCameraUsageDescription": "We need camera access to upload photos",
        "NSPhotoLibraryUsageDescription": "We need photo library access to upload images"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#15196c"
      },
      "package": "com.aykau.mobile",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-location",
      "expo-image-picker",
      "expo-notifications"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### Build & Deploy

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)

- [ ] Project setup and configuration
- [ ] Tamagui theme setup
- [ ] Navigation structure
- [ ] Authentication screens
- [ ] Supabase integration
- [ ] Basic profile management

### Phase 2: Core Features (Week 3-4)

- [ ] Job browsing and search
- [ ] Job detail view
- [ ] Post job flow
- [ ] Quote submission
- [ ] Basic messaging

### Phase 3: Advanced Features (Week 5-6)

- [ ] Real-time messaging
- [ ] Push notifications
- [ ] Wallet and credits
- [ ] Withdrawal flow
- [ ] Portfolio management

### Phase 4: Polish & Optimization (Week 7-8)

- [ ] Onboarding flow
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Offline support

### Phase 5: Testing & Deployment (Week 9-10)

- [ ] Unit and integration tests
- [ ] E2E testing
- [ ] Bug fixes
- [ ] App Store submission
- [ ] Play Store submission

---

## 13. Key Differences from Web

| Feature       | Web                   | Mobile                     |
| ------------- | --------------------- | -------------------------- |
| Navigation    | File-based routing    | Tab + Stack navigation     |
| State         | Zustand + React Query | Zustand + React Query      |
| Forms         | React Hook Form       | React Hook Form            |
| Images        | Next.js Image         | Expo Image                 |
| Location      | Browser Geolocation   | Expo Location              |
| Notifications | Web Push              | Expo Notifications         |
| Storage       | LocalStorage          | AsyncStorage + SecureStore |
| Camera        | HTML5 Input           | Expo Image Picker          |
| Payments      | Web Paystack          | Paystack Mobile SDK        |

---

## 14. Shared Code Strategy

### What Can Be Shared

1. **Business Logic**
   - Validation schemas (Zod)
   - Helper functions
   - Type definitions
   - Constants

2. **Services**
   - Supabase client (with modifications)
   - API service layer
   - Auth service (with modifications)

3. **State Management**
   - Zustand stores (mostly)
   - Store actions

### What Needs Adaptation

1. **UI Components**
   - Web: Ant Design + Tailwind
   - Mobile: Tamagui

2. **Navigation**
   - Web: Next.js App Router
   - Mobile: Expo Router

3. **Forms**
   - Web: HTML forms
   - Mobile: React Native forms

4. **File Uploads**
   - Web: HTML input
   - Mobile: Expo Image Picker

---

## Summary

This plan provides a comprehensive roadmap for building the Aykau mobile app using React Native, Expo, and Tamagui. The architecture mirrors the web app's structure while leveraging native mobile capabilities for a superior user experience.

Key highlights:

- **Shared backend** with Supabase
- **Consistent state management** with Zustand
- **Native performance** with React Native
- **Beautiful UI** with Tamagui
- **File-based routing** with Expo Router
- **Phased implementation** for manageable development

The mobile app will provide the same functionality as the web platform while offering native features like push notifications, camera access, and GPS location.
