# Aykau - Project Summary

## Overview

**Aykau** is a Nigerian service marketplace platform that connects customers with verified artisans (service providers) for home services. The platform enables users to post jobs, receive quotes, communicate securely, and manage contracts with escrow payments.

**Tagline:** "The #1 Marketplace for Home Services"

---

## Tech Stack

### Core Framework

- **Next.js 16.2.6** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript 5** - Type safety

### UI & Styling

- **Ant Design 6.4.3** - Component library
- **Tailwind CSS 4** - Utility-first CSS
- **Inter & Manrope** - Google Fonts

### Backend & Database

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (email/password + Google OAuth)
  - Real-time subscriptions
  - Storage for file uploads

### Search

- **Algolia** - Search-as-a-Service
  - Full-text search with typo tolerance
  - Geo-search for proximity ranking
  - Faceted filtering

### State Management

- **Zustand 5** - Lightweight state management

### Email

- **Resend** - Email delivery service
- **React Email** - Email template components

### Validation

- **Zod 4** - Schema validation

### Maps & Location

- **Leaflet** - Map rendering
- Custom geolocation hooks

### Analytics

- **Recharts** - Data visualization (admin analytics)

---

## Project Structure

```
aykau/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin routes group
│   │   └── admin/
│   │       ├── layout.tsx        # Admin layout with auth guard
│   │       ├── analytics/
│   │       │   └── withdrawals/  # Withdrawal analytics
│   │       ├── categories/       # Category management
│   │       ├── disputes/         # Dispute management
│   │       │   └── [id]/         # Dispute detail
│   │       ├── users/            # User management
│   │       └── withdrawals/      # Withdrawal approvals
│   │
│   ├── (auth)/                   # Authentication routes group
│   │   ├── forgot-password/      # Password recovery
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   ├── reset-password/       # Password reset
│   │   └── verify-email/         # Email verification
│   │
│   ├── (dashboard)/              # User dashboard routes group
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # Dashboard layout with auth guard
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── contracts/[id]/   # Contract details
│   │   │   ├── disputes/[id]/    # Dispute details
│   │   │   ├── jobs/             # Job listings (Algolia search)
│   │   │   │   ├── [id]/         # Job detail view
│   │   │   │   ├── manage/[id]/  # Job management (for posters)
│   │   │   │   └── send-quote/[id]/ # Quote submission
│   │   │   ├── messages/         # Messaging system
│   │   │   ├── my-requests/      # User's posted jobs
│   │   │   ├── payment/processing/ # Payment processing
│   │   │   ├── portfolio/        # Artisan portfolio
│   │   │   ├── settings/         # User settings
│   │   │   ├── wallet/           # Credit wallet
│   │   │   └── withdrawals/      # Withdrawal management
│   │   └── onboarding/
│   │       └── professional/     # Professional onboarding
│   │
│   ├── (public)/                 # Public routes
│   │   └── profile/[username]/   # Public artisan profiles
│   │
│   ├── api/                      # API routes
│   │   ├── jobs/photos/          # Job photo upload
│   │   └── unsubscribe/          # Email unsubscribe
│   │
│   ├── artisans/[id]/            # Public artisan profile pages
│   ├── auth/callback/            # OAuth callback handler
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── auth/                     # Auth guard components
│   │   ├── AdminGuard.tsx        # Admin route protection
│   │   └── AuthGuard.tsx         # General auth protection
│   │
│   ├── layout/                   # Layout components
│   │   ├── AppHeader.tsx         # Main app header
│   │   ├── AuthLayout.tsx        # Auth pages layout
│   │   ├── LandingFooter.tsx     # Landing page footer
│   │   ├── LandingHeader.tsx     # Landing page header
│   │   └── LocationForm.tsx      # Location input form
│   │
│   ├── providers/                # Context providers
│   │   └── ThemeProvider.tsx     # Theme context
│   │
│   └── ui/                       # UI components
│       ├── auth/                 # Auth UI components
│       │   ├── AuthDivider.tsx
│       │   ├── AuthInput.tsx
│       │   ├── GoogleButton.tsx
│       │   └── RoleToggle.tsx
│       │
│       ├── categories/admin/     # Category admin components
│       │   ├── CategoryModal.tsx
│       │   └── PlatformFeeSettings.tsx
│       │
│       ├── chat/                 # Messaging components
│       │   ├── ChatBell.tsx
│       │   ├── ChatSidebar.tsx
│       │   ├── ChatWindow.tsx
│       │   ├── ConversationList.tsx
│       │   ├── MessageInput.tsx
│       │   ├── MessageList.tsx
│       │   └── RequestPaymentModal.tsx
│       │
│       ├── disputes/             # Dispute components
│       │   ├── DisputeBanner.tsx
│       │   ├── DisputeThread.tsx
│       │   ├── EvidenceGallery.tsx
│       │   ├── EvidenceUploader.tsx
│       │   ├── RaiseDisputeModal.tsx
│       │   └── admin/
│       │       ├── DisputeResolution.tsx
│       │       └── DisputesDashboard.tsx
│       │
│       ├── jobs/                 # Job-related components
│       │   ├── ContactAccessCard.tsx
│       │   ├── CreditPurchaseSuccessToast.tsx
│       │   ├── EmptyState.tsx
│       │   ├── JobCard.tsx
│       │   ├── JobCardWithCredits.tsx
│       │   ├── JobClearFiltersButton.tsx
│       │   ├── JobFilters.tsx
│       │   ├── JobHeader.tsx
│       │   ├── JobInfoCard.tsx
│       │   ├── JobMobileFilters.tsx
│       │   ├── JobPagination.tsx
│       │   ├── JobSearchBar.tsx
│       │   ├── JobSort.tsx
│       │   ├── JobSortDropdown.tsx
│       │   ├── LocationSelect.tsx
│       │   │
│       │   ├── algolia/          # Algolia search components
│       │   │   ├── AlgoliaCurrentRefinements.tsx
│       │   │   ├── AlgoliaJobHits.tsx
│       │   │   ├── AlgoliaJobsContent.tsx
│       │   │   ├── AlgoliaJobSearch.tsx
│       │   │   ├── AlgoliaLocationFilter.tsx
│       │   │   ├── AlgoliaPagination.tsx
│       │   │   ├── AlgoliaSearchBar.tsx
│       │   │   ├── AlgoliaSidebarFilters.tsx
│       │   │   ├── AlgoliaSortBy.tsx
│       │   │   ├── AlgoliaStats.tsx
│       │   │   └── SearchAnalytics.tsx
│       │   │
│       │   ├── JobDetailDrawer/  # Job detail drawer
│       │   │   ├── ActivitySection.tsx
│       │   │   ├── ClientSection.tsx
│       │   │   ├── DrawerFooter.tsx
│       │   │   ├── DrawerHeader.tsx
│       │   │   ├── index.tsx
│       │   │   ├── JobContentSection.tsx
│       │   │   └── UnlockConsentModal.tsx
│       │   │
│       │   └── manage/           # Job management components
│       │       ├── EditJobDrawer.tsx
│       │       ├── QuoteDetailModal.tsx
│       │       └── QuotesList.tsx
│       │
│       ├── portfolio/            # Portfolio components
│       │   ├── MasonryGallery.tsx
│       │   ├── PortfolioUploader.tsx
│       │   └── PortfolioWizard.tsx
│       │
│       ├── profile/              # Profile components
│       │   ├── MessageArtisanButton.tsx
│       │   ├── RequestQuoteButton.tsx
│       │   └── RequestQuoteModal.tsx
│       │
│       ├── quotes/               # Quote components
│       │   ├── JobDetailSummary.tsx
│       │   ├── QuoteDetailView.tsx
│       │   └── SendQuoteForm.tsx
│       │
│       ├── reviews/              # Review components
│       │   └── ReviewModal.tsx
│       │
│       ├── settings/             # Settings components
│       │   ├── ProfessionalSettings.tsx
│       │   └── ProfileSettings.tsx
│       │
│       ├── wallet/               # Wallet components
│       │   └── BuyCreditsModal.tsx
│       │
│       ├── withdrawals/          # Withdrawal components
│       │   ├── AddBankAccountModal.tsx
│       │   ├── BalanceCard.tsx
│       │   ├── BankAccountSelector.tsx
│       │   ├── FeeSummary.tsx
│       │   ├── RecentPayouts.tsx
│       │   ├── WithdrawalSidebar.tsx
│       │   └── admin/
│       │       └── withdrawActionModal.tsx
│       │
│       ├── ArtisanOnboardingForm.tsx
│       ├── CustomerOnboardingForm.tsx
│       ├── JobPostingForm.tsx
│       ├── MapPinSelector.tsx
│       └── NotificationBell.tsx
│
├── constants/                    # Application constants
│   └── constants.ts              # Nigerian states list
│
├── emails/                       # Email templates
│   ├── NewJobAlert.tsx
│   ├── ResetPasswordEmail.tsx
│   ├── VerificationEmail.tsx
│   └── WelcomeEmail.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useChatNotifications.tsx
│   ├── useGeolocation.ts
│   ├── useJobCreditCost.tsx
│   ├── useOnboardingFormInitialValues.tsx
│   └── useRealtimeNotifications.ts
│
├── lib/                          # Utility libraries
│   ├── professions.ts            # Profession definitions
│   ├── auth/
│   │   └── server.ts             # Server-side auth utilities
│   ├── data/
│   │   └── lgas.json             # Nigerian LGAs data
│   ├── helpers/
│   │   ├── categories.ts         # Category helpers
│   │   ├── functions.ts          # General utilities
│   │   ├── jobs.ts               # Job-related helpers
│   │   ├── location.ts           # Location helpers
│   │   └── quotes.tsx            # Quote helpers
│   ├── jobs/
│   │   ├── queries.ts            # Job database queries
│   │   └── types.ts              # Job type definitions
│   └── supabase/
│       └── profiles.ts           # Profile utilities
│
├── plans/                        # Implementation plans
│   └── algolia-search-implementation.md
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── header-logo.png
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── schemas/                      # Validation schemas
│   └── auth.schema.ts            # Auth validation with Zod
│
├── scripts/                      # Utility scripts
│   └── configure-algolia-index.ts # Algolia index configuration
│
├── services/                     # Service layer
│   ├── algolia/
│   │   └── client.ts             # Algolia search client
│   ├── auth/
│   │   └── auth.service.ts       # Authentication service
│   ├── email/
│   │   ├── resend.ts             # Resend client
│   │   └── email.service.ts      # Email service
│   └── supabase/
│       ├── admin.ts              # Supabase admin client
│       ├── client.ts             # Browser Supabase client
│       └── server.ts             # Server Supabase client
│
├── store/                        # Zustand stores
│   ├── artisanOnboarding.store.ts
│   ├── auth.store.ts             # Authentication state
│   ├── chat.store.ts             # Chat state
│   ├── customerOnboarding.store.ts
│   └── jobPostForm.store.ts      # Job posting form state
│
├── supabase/                     # Supabase configuration
├── supabase-templates/           # Email templates for Supabase
├── types/                        # TypeScript types
│   ├── db.ts                     # Database type exports
│   └── supabase.ts               # Generated Supabase types
│
├── utils/                        # Utility functions
├── middleware.ts                 # Next.js middleware (auth protection)
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind configuration (if exists)
├── postcss.config.mjs            # PostCSS configuration
└── eslint.config.mjs             # ESLint configuration
```

---

## Database Schema

### Core Tables

#### `profiles`

User profiles with role management and artisan/customer data.

- `id` (UUID, PK) - Links to Supabase auth.users
- `username` (TEXT, UNIQUE, min 3 chars)
- `full_name` (TEXT)
- `email` (TEXT)
- `avatar_url` (TEXT)
- `phone` (TEXT)
- `nin` (TEXT) - National Identification Number
- `bio` (TEXT)
- `website` (TEXT)
- `role` (ENUM)
- `current_active_role` (ENUM)
- `is_verified` (BOOLEAN, default: false)
- `completed_onboarding_roles` (TEXT[], default: '{}')
- `onboarding_completed_at` (TIMESTAMPTZ)
- `post_code` (TEXT)
- `address_preference` (TEXT, default: 'on-request')
- `lga_id` (INTEGER)
- `lga_name` (TEXT)
- `state_code` (TEXT)
- `city` (TEXT)
- `coordinates` (JSONB)
- `location` (ENUM)
- `artisan_data` (JSONB) - Artisan-specific profile data
- `customer_data` (JSONB) - Customer-specific profile data
- `rating` (NUMERIC, 0-5, default: 0.00)
- `average_rating` (NUMERIC, default: 0)
- `total_reviews` (INTEGER, default: 0)
- `preferred_subcategories` (TEXT[], default: '{}')
- `last_seen` (TIMESTAMPTZ, default: now())
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ)

#### `job_requests`

Job postings by customers.

- `id` (UUID, PK, auto-generated)
- `customer_id` (UUID, FK → profiles, NOT NULL)
- `title` (TEXT, NOT NULL, min 3 chars)
- `description` (TEXT, NOT NULL, min 20 chars)
- `category` (ENUM: service_category, NOT NULL)
- `subcategory` (TEXT, NOT NULL)
- `budget` (TEXT, NOT NULL)
- `urgency` (TEXT, NOT NULL)
- `frequency` (TEXT)
- `preferred_date` (DATE)
- `status` (ENUM: job_status, default: 'open')
- `service_type` (ENUM: service_location_type, NOT NULL)
- `source` (TEXT, default: 'public_post', check: 'public_post' | 'direct_request')
- `target_artisan_id` (UUID, FK → profiles) - For direct requests
- `address` (TEXT)
- `lga_id` (INTEGER)
- `lga_name` (TEXT)
- `state_code` (TEXT)
- `state` (TEXT)
- `city` (TEXT)
- `coordinates` (JSONB)
- `location` (ENUM)
- `access_notes` (TEXT)
- `contact_methods` (TEXT[], default: ['email'])
- `photo_urls` (TEXT[], default: [])
- `custom_details` (JSONB, default: '{}')
- `credit_cost` (NUMERIC, default: 10)
- `viewed_count` (INTEGER, default: 0)
- `quote_count` (INTEGER, default: 0)
- `expires_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

#### `job_quotes`

Quotes submitted by artisans for jobs.

- `id` (UUID, PK, auto-generated)
- `job_id` (UUID, FK → job_requests, NOT NULL)
- `artisan_id` (UUID, FK → profiles, NOT NULL)
- `customer_id` (UUID, FK → profiles)
- `message` (TEXT, NOT NULL)
- `quoted_price` (NUMERIC)
- `quoted_price_note` (TEXT)
- `availability_note` (TEXT)
- `portfolio_links` (TEXT[])
- `status` (ENUM: quote_status, default: 'pending')
- `is_viewed` (BOOLEAN, NOT NULL, default: false)
- `viewed_at` (TIMESTAMPTZ)
- `responded_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, default: now())

#### `job_photos`

Job photo attachments.

- `id` (UUID, PK, auto-generated)
- `job_id` (UUID, FK → job_requests, NOT NULL)
- `storage_path` (TEXT, NOT NULL)
- `original_name` (TEXT)
- `size_bytes` (INTEGER)
- `uploaded_at` (TIMESTAMPTZ, default: now())

#### `contracts`

Agreements between customers and artisans with escrow.

- `id` (UUID, PK, auto-generated)
- `job_id` (UUID, FK → job_requests, NOT NULL)
- `quote_id` (UUID, FK → job_quotes, NOT NULL)
- `customer_id` (UUID, FK → profiles, NOT NULL)
- `artisan_id` (UUID, FK → profiles, NOT NULL)
- `total_agreed_amount` (NUMERIC, NOT NULL)
- `agreed_scope` (TEXT)
- `platform_fee_percentage` (NUMERIC, NOT NULL, default: 10.00)
- `platform_fee_amount` (NUMERIC, NOT NULL, default: 0.00)
- `escrow_status` (ENUM: escrow_status, NOT NULL, default: 'none')
- `escrow_funded_amount` (NUMERIC, NOT NULL, default: 0.00)
- `escrow_released_amount` (NUMERIC, NOT NULL, default: 0.00)
- `escrow_refunded_amount` (NUMERIC, NOT NULL, default: 0.00)
- `status` (ENUM: contract_status, NOT NULL, default: 'active')
- `is_disputed` (BOOLEAN, default: false)
- `start_date` (TIMESTAMPTZ, default: now())
- `expected_completion_date` (TIMESTAMPTZ)
- `customer_accepted_at` (TIMESTAMPTZ, default: now())
- `artisan_accepted_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

#### `conversations`

Chat conversations between users.

- `id` (UUID, PK, auto-generated)
- `job_id` (UUID, FK → job_requests)
- `customer_id` (UUID, FK → profiles, NOT NULL)
- `artisan_id` (UUID, FK → profiles, NOT NULL)
- `last_message_at` (TIMESTAMPTZ, default: now())
- `created_at` (TIMESTAMPTZ, default: now())

#### `messages`

Individual chat messages.

- `id` (UUID, PK, auto-generated)
- `conversation_id` (UUID, FK → conversations, NOT NULL)
- `sender_id` (UUID, FK → profiles, NOT NULL)
- `content` (TEXT)
- `attachments` (JSONB, default: '[]')
- `quoted_message_id` (UUID, FK → messages)
- `is_read` (BOOLEAN, NOT NULL, default: false)
- `created_at` (TIMESTAMPTZ, NOT NULL, default: now())

#### `notifications`

User notifications.

- `id` (UUID, PK, auto-generated)
- `user_id` (UUID, FK → profiles, NOT NULL)
- `type` (ENUM: notification_type, NOT NULL, default: 'info')
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `link` (TEXT)
- `metadata` (JSONB, default: '{}')
- `is_read` (BOOLEAN, NOT NULL, default: false)
- `created_at` (TIMESTAMPTZ, NOT NULL, default: now())

### Payment & Wallet Tables

#### `wallets`

User wallets for fiat and credit balances.

- `id` (UUID, PK, auto-generated)
- `user_id` (UUID, FK → profiles, NOT NULL, UNIQUE)
- `fiat_balance` (NUMERIC, NOT NULL, default: 0.00)
- `credit_balance` (NUMERIC, NOT NULL, default: 0.00)
- `paystack_customer_code` (TEXT)
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

#### `transactions`

Financial transactions (payments, credits, etc.).

- `id` (UUID, PK, auto-generated)
- `user_id` (UUID, FK → profiles)
- `contract_id` (UUID, FK → contracts)
- `job_id` (UUID, FK → job_requests)
- `quote_id` (UUID, FK → job_quotes)
- `original_transaction_id` (UUID, FK → transactions) - For refunds/reversals
- `type` (ENUM: transaction_type, NOT NULL)
- `amount` (NUMERIC, NOT NULL)
- `currency` (TEXT, NOT NULL, default: 'fiat')
- `status` (ENUM: transaction_status, NOT NULL, default: 'pending')
- `external_reference_id` (TEXT, UNIQUE)
- `paystack_metadata` (JSONB, default: '{}')
- `description` (TEXT)
- `expires_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, default: now())

#### `payment_requests`

Payment requests from artisans to customers.

- `id` (UUID, PK, auto-generated)
- `contract_id` (UUID, FK → contracts, NOT NULL)
- `artisan_id` (UUID, FK → profiles, NOT NULL)
- `customer_id` (UUID, FK → profiles, NOT NULL)
- `amount` (NUMERIC, NOT NULL)
- `description` (TEXT, NOT NULL)
- `request_type` (ENUM: payment_request_type, NOT NULL)
- `status` (ENUM: payment_request_status, NOT NULL, default: 'pending')
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

#### `payout_methods`

User payout methods.

- `id` (UUID, PK, auto-generated)
- `user_id` (UUID, FK → profiles, NOT NULL)
- `provider` (TEXT, NOT NULL)
- `provider_account_id` (TEXT, NOT NULL)
- `is_default` (BOOLEAN, NOT NULL, default: false)
- `created_at` (TIMESTAMPTZ, default: now())

#### `bank_accounts`

User bank accounts for withdrawals.

- `id` (UUID, PK, auto-generated)
- `user_id` (UUID, FK → profiles, NOT NULL)
- `bank_name` (TEXT, NOT NULL)
- `account_number` (TEXT, NOT NULL)
- `account_name` (TEXT, NOT NULL)
- `is_default` (BOOLEAN, default: false)
- `is_verified` (BOOLEAN, default: false)
- `paystack_recipient_code` (TEXT)
- `paystack_recipient_data` (JSONB, default: '{}')
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

#### `withdrawals`

Withdrawal requests to bank accounts.

- `id` (UUID, PK, auto-generated)
- `user_id` (UUID, FK → profiles, NOT NULL)
- `bank_account_id` (UUID, FK → bank_accounts, NOT NULL)
- `amount` (NUMERIC, NOT NULL)
- `fee` (NUMERIC, NOT NULL, default: 0)
- `net_amount` (NUMERIC, NOT NULL)
- `status` (ENUM: transaction_status, NOT NULL, default: 'pending')
- `reference` (TEXT, UNIQUE)
- `paystack_transfer_code` (TEXT)
- `paystack_transfer_response` (JSONB)
- `admin_notes` (TEXT)
- `processed_at` (TIMESTAMPTZ)
- `processed_by` (UUID, FK → profiles)
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

### Credit System Tables

#### `credit_packages`

Available credit purchase packages.

- `id` (UUID, PK, auto-generated)
- `name` (TEXT, NOT NULL)
- `credits_amount` (NUMERIC, NOT NULL)
- `price_naira` (NUMERIC, NOT NULL)
- `discount_percentage` (NUMERIC, NOT NULL, default: 0)
- `is_active` (BOOLEAN, NOT NULL, default: true)
- `display_order` (INTEGER, NOT NULL)
- `created_at` (TIMESTAMPTZ, default: now())

#### `job_credit_tiers`

Credit costs based on job budget ranges.

- `id` (UUID, PK, auto-generated)
- `budget_range_key` (TEXT, NOT NULL, UNIQUE)
- `credit_cost` (NUMERIC, NOT NULL)
- `is_active` (BOOLEAN, NOT NULL, default: true)
- `created_at` (TIMESTAMPTZ, default: now())

#### `unlocked_jobs`

Tracks jobs unlocked by artisans using credits.

- `id` (UUID, PK, auto-generated)
- `job_id` (UUID, FK → job_requests, NOT NULL)
- `artisan_id` (UUID, FK → profiles, NOT NULL)
- `credits_spent` (NUMERIC, NOT NULL)
- `original_transaction_id` (UUID, FK → transactions)
- `is_refunded` (BOOLEAN, NOT NULL, default: false)
- `unlocked_at` (TIMESTAMPTZ, default: now())

### Service Category Tables

#### `service_categories`

Main service categories (plumbing, electrical, etc.).

- `id` (UUID, PK, auto-generated)
- `value` (TEXT, NOT NULL, UNIQUE)
- `label` (TEXT, NOT NULL)
- `icon` (TEXT)
- `description` (TEXT)
- `sort_order` (INTEGER, NOT NULL, default: 0)
- `is_active` (BOOLEAN, NOT NULL, default: true)
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

#### `service_subcategories`

Subcategories under main categories.

- `id` (UUID, PK, auto-generated)
- `category_id` (UUID, FK → service_categories, NOT NULL)
- `value` (TEXT, NOT NULL)
- `label` (TEXT, NOT NULL)
- `description` (TEXT)
- `sort_order` (INTEGER, NOT NULL, default: 0)
- `is_active` (BOOLEAN, NOT NULL, default: true)
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

### Dispute Resolution Tables

#### `disputes`

Dispute cases between customers and artisans.

- `id` (UUID, PK, auto-generated)
- `job_id` (UUID, FK → job_requests, NOT NULL)
- `contract_id` (UUID, FK → contracts, NOT NULL)
- `conversation_id` (UUID, FK → conversations, NOT NULL)
- `raised_by` (UUID, FK → profiles, NOT NULL)
- `against` (UUID, FK → profiles, NOT NULL)
- `reason` (TEXT, NOT NULL)
- `description` (TEXT)
- `status` (ENUM: dispute_status, NOT NULL, default: 'mediation')
- `outcome` (ENUM)
- `amount_disputed` (NUMERIC, NOT NULL)
- `split_percentage` (NUMERIC, check: 0-100)
- `resolution_notes` (TEXT)
- `resolved_at` (TIMESTAMPTZ)
- `resolved_by` (UUID, FK → profiles)
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

#### `dispute_messages`

Messages within dispute conversations.

- `id` (UUID, PK, auto-generated)
- `dispute_id` (UUID, FK → disputes, NOT NULL)
- `sender_id` (UUID, FK → profiles, NOT NULL)
- `content` (TEXT, NOT NULL)
- `is_admin_message` (BOOLEAN, default: false)
- `created_at` (TIMESTAMPTZ, default: now())

#### `dispute_evidence`

Evidence files submitted for disputes.

- `id` (UUID, PK, auto-generated)
- `dispute_id` (UUID, FK → disputes, NOT NULL)
- `submitted_by` (UUID, FK → profiles, NOT NULL)
- `evidence_type` (ENUM: evidence_type, NOT NULL)
- `url` (TEXT, NOT NULL)
- `description` (TEXT)
- `metadata` (JSONB, default: '{}')
- `created_at` (TIMESTAMPTZ, default: now())

### Portfolio Tables

#### `portfolio_projects`

Artisan portfolio projects.

- `id` (UUID, PK, auto-generated)
- `artisan_id` (UUID, FK → profiles, NOT NULL)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `category` (TEXT)
- `created_at` (TIMESTAMPTZ, default: now())
- `updated_at` (TIMESTAMPTZ, default: now())

#### `portfolio_media`

Media files for portfolio projects.

- `id` (UUID, PK, auto-generated)
- `project_id` (UUID, FK → portfolio_projects, NOT NULL)
- `type` (TEXT, NOT NULL, check: 'image' | 'video')
- `file_url` (TEXT, NOT NULL)
- `thumbnail_url` (TEXT)
- `display_order` (INTEGER, default: 0)
- `created_at` (TIMESTAMPTZ, default: now())

### Reviews Table

#### `reviews`

Customer reviews of artisan work.

- `id` (UUID, PK, auto-generated)
- `contract_id` (UUID, FK → contracts, NOT NULL, UNIQUE)
- `job_id` (UUID, FK → job_requests, NOT NULL)
- `customer_id` (UUID, FK → profiles, NOT NULL)
- `artisan_id` (UUID, FK → profiles, NOT NULL)
- `rating` (INTEGER, NOT NULL, check: 1-5)
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ, default: now())

### Email System Tables

#### `email_queue`

Queue for sending emails.

- `id` (UUID, PK, auto-generated)
- `user_id` (UUID, FK → profiles, NOT NULL)
- `email_address` (TEXT, NOT NULL)
- `template_type` (TEXT, NOT NULL)
- `payload` (JSONB, NOT NULL)
- `status` (TEXT, NOT NULL, default: 'pending')
- `attempts` (INTEGER, NOT NULL, default: 0)
- `created_at` (TIMESTAMPTZ, default: now())

#### `email_unsubscribes`

Email unsubscribe tokens.

- `id` (UUID, PK, auto-generated)
- `user_id` (UUID, FK → profiles, NOT NULL)
- `token` (TEXT, NOT NULL, UNIQUE)
- `notification_type` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, default: now())

### Platform Configuration Tables

#### `platform_settings`

Platform-wide configuration settings.

- `id` (UUID, PK, auto-generated)
- `key` (TEXT, NOT NULL, UNIQUE)
- `value` (JSONB, NOT NULL)
- `description` (TEXT)
- `updated_at` (TIMESTAMPTZ, default: now())
- `updated_by` (UUID, FK → auth.users)

### System Tables

#### `spatial_ref_sys`

PostGIS spatial reference system (for geolocation).

- `srid` (INTEGER, PK, check: 1-998999)
- `auth_name` (VARCHAR)
- `auth_srid` (INTEGER)
- `srtext` (VARCHAR)
- `proj4text` (VARCHAR)

### Enums

- `role` - User roles (customer, artisan, admin)
- `service_category` - Types of services (plumbing, electrical, etc.)
- `service_location_type` - Where service is performed (in-person, remote, etc.)
- `job_status` - Job lifecycle states (open, in_progress, completed, cancelled, expired)
- `quote_status` - Quote states (pending, accepted, rejected, withdrawn)
- `contract_status` - Contract states (active, completed, cancelled, disputed)
- `escrow_status` - Payment escrow states (none, funded, partially_released, released, refunded)
- `notification_type` - Types of notifications (info, warning, error, success, job_alert, message, payment, etc.)
- `transaction_type` - Types of transactions (credit_purchase, escrow_fund, escrow_release, withdrawal, refund, etc.)
- `transaction_status` - Transaction states (pending, completed, failed, cancelled, refunded)
- `payment_request_type` - Types of payment requests (milestone, final, additional)
- `payment_request_status` - Payment request states (pending, approved, rejected, paid)
- `dispute_status` - Dispute states (mediation, under_review, resolved, closed)
- `evidence_type` - Types of dispute evidence (photo, video, document, message)
- `location` - Location types

---

## Authentication System

### Flow

1. **Registration**: Email/password or Google OAuth
2. **Email Verification**: Required via Resend
3. **Login**: Returns user with role from profiles table
4. **Session Management**: Supabase SSR with cookie handling
5. **Password Reset**: Email-based recovery flow

### Middleware Protection

Protected routes require authentication:

- `/dashboard/*`
- `/admin/*`
- `/onboarding/*`

Authenticated users are redirected away from:

- `/login`
- `/register`
- `/forgot-password`
- `/verify-email`

### Role-Based Access

- **Customer**: Post jobs, receive quotes, hire artisans
- **Artisan**: Browse jobs, send quotes, manage portfolio
- **Admin**: Platform management, dispute resolution, analytics

---

## Key Features

### For Customers

- Post job requests with photos and details
- Receive quotes from artisans
- Browse artisan profiles and portfolios
- Real-time messaging with artisans
- Credit-based system to unlock artisan contact details
- Contract management with escrow payments
- Dispute resolution system
- Withdrawal management

### For Artisans

- Browse available jobs (with Algolia search)
- Send quotes to potential customers
- Manage portfolio with photo uploads
- Professional onboarding flow
- Wallet and withdrawal system
- Real-time notifications
- Chat with customers

### For Admins

- User management
- Category management with platform fees
- Dispute resolution dashboard
- Withdrawal approval system
- Analytics dashboard

### Search (Algolia)

- Full-text search with typo tolerance
- Geo-search for proximity ranking
- Faceted filtering (category, urgency, budget, location)
- GPS-based location detection
- Manual location selection
- Radius filtering (5km, 10km, 25km, 50km)
- Sort options (relevance, newest, budget)

---

## State Management

### Zustand Stores

#### `auth.store.ts`

```typescript
type AuthUser = User & {
  role?: "customer" | "artisan" | "admin";
};

type AuthState = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
};
```

#### Other Stores

- `artisanOnboarding.store.ts` - Artisan onboarding form state
- `customerOnboarding.store.ts` - Customer onboarding form state
- `jobPostForm.store.ts` - Job posting form state
- `chat.store.ts` - Chat/messaging state

---

## Services Layer

### Authentication Service (`services/auth/auth.service.ts`)

- `login(email, password)` - User login with role fetching
- `register(email, password, fullName, role)` - User registration
- `logout()` - Sign out
- `getUser()` - Get current user with role
- `getSession()` - Get current session
- `signInWithGoogle()` - Google OAuth
- `resetPassword(email)` - Password reset email
- `updatePassword(password)` - Update password
- `resendVerification(email)` - Resend verification email

### Supabase Clients

- `services/supabase/client.ts` - Browser client
- `services/supabase/server.ts` - Server client (for Server Components)
- `services/supabase/admin.ts` - Admin client (for privileged operations)

### Algolia Client (`services/algolia/client.ts`)

```typescript
export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

export const ALGOLIA_INDICES = {
  JOBS: "supabase_job_requests",
};
```

### Email Service

- `services/email/resend.ts` - Resend client initialization
- `services/email/email.service.ts` - Email sending functions

---

## Email Templates

Built with React Email components:

- `VerificationEmail.tsx` - Email verification
- `WelcomeEmail.tsx` - Welcome new users
- `ResetPasswordEmail.tsx` - Password reset
- `NewJobAlert.tsx` - Notify artisans of new jobs

---

## Design System

### Colors

- **Primary Navy**: `#15196c` - CTAs and primary actions
- **Surface Glass**: White with transparency for elevated surfaces
- **Text Colors**: `#1b1b20` (primary), `#464651` (secondary)
- **Border**: `#c7c5d3`

### Typography

- **Headings**: Manrope font
- **Body**: Inter font
- **Icon Font**: Material Symbols Outlined

### UI Patterns

- **Glassmorphism**: `backdrop-blur` for elevated surfaces
- **Rounded Corners**: `rounded-full` for pills, `rounded-xl` for cards
- **Ant Design**: Component library with custom theming
- **Tailwind**: Utility classes with `!important` notation for overrides

---

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
ALGOLIA_ADMIN_KEY=

# Resend (Email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Key Integrations

### Supabase

- Authentication (email/password + Google OAuth)
- PostgreSQL database
- Real-time subscriptions for chat and notifications
- Storage for job photos and portfolio images

### Algolia

- Search index: `supabase_job_requests`
- Synced from Supabase `job_requests` table
- Geo-search enabled for proximity ranking
- Transforms `coordinates` JSONB to `_geoloc` format

### Resend

- Transactional email delivery
- Custom React Email templates

---

## Nigerian Localization

### States

All 36 Nigerian states + FCT Abuja supported (see `constants/constants.ts`)

### LGAs

Local Government Areas data in `lib/data/lgas.json`

### Currency

Nigerian Naira (₦) for pricing and payments

---

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Algolia configuration
npx tsx scripts/configure-algolia-index.ts
```

---

## File Conventions

- **Route Groups**: `(group)` syntax for organizing routes without affecting URL
- **Dynamic Routes**: `[param]` for dynamic segments
- **Server Components**: Default in App Router
- **Client Components**: Marked with `"use client"` directive
- **Layouts**: `layout.tsx` files for shared UI
- **Loading States**: `loading.tsx` files for suspense boundaries

---

## Security Considerations

- Middleware protects authenticated routes
- Role-based access control via profiles table
- Supabase RLS (Row Level Security) policies
- CSRF protection via Supabase SSR
- Secure cookie handling
- Email verification required

---

## Performance Optimizations

- Next.js App Router with React Server Components
- Algolia for fast search (offloaded from database)
- Image optimization with Next.js Image component
- Font optimization with next/font
- Code splitting by route
- Zustand for minimal re-renders

---

## Summary

Aykau is a comprehensive service marketplace built with modern web technologies, focusing on the Nigerian market. It provides a complete workflow from job posting to payment, with features like real-time messaging, escrow payments, dispute resolution, and location-based search. The architecture follows Next.js best practices with clear separation of concerns between services, components, and state management.
