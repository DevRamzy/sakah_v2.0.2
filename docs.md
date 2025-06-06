# Sakah V2.0.2 - Technical Documentation

## Tech Stack

- **Frontend**: React 18 with TypeScript, Vite build system
- **Styling**: Tailwind CSS v3.4.17 with custom animations
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Routing**: React Router v6
- **Typography**: Outfit font family from Google Fonts
- **Branding**: 
  - Primary color: #EAB308 (amber) - Main accent color
  - Jet Black: #000000 - Highest contrast for text on amber
  - Charcoal: #1A1A1A - Dark backgrounds for panels

## Critical Configuration

### Environment Variables
```
VITE_SUPABASE_URL=https://ycwrqddpusmfdjqjuish.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

### Supabase Setup (2025-06-02)

- **Project**: "sakah_v2.0.2"
- **Database Schema**:
  - `profiles` table linked to `auth.users` with RLS policies
  - Automatic profile creation trigger on user signup
- **Security**:
  - Simplified RLS policies to prevent infinite recursion errors
  - Users can only read/update their own profiles

## Authentication Flow

- **Components**: `AuthContext`, `LoginForm`, `SignupForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `ProtectedRoute`
- **Features**:
  - Session persistence
  - Protected routes
  - Error handling with user-friendly messages
  - Profile data fetching with fallback creation
  - Complete password reset flow with email verification
  - Multi-mode auth page (login, signup, forgot password)

## Component Structure

- **Auth**: Authentication components (Login, Signup, ForgotPassword, ResetPassword)
- **Layout**: Common layout components (Header, Footer)
- **Dashboard**: Dashboard-specific components
- **UI**: Reusable UI components
  - **Button**: Standardized button component with variants (primary/secondary/outline), sizes, and loading states

## UI Framework

- **Layout**: Responsive design with mobile-first approach
- **Components**:
  - Split-screen auth page with charcoal sidebar
  - Dashboard with tab navigation and responsive sidebar
  - Form components with validation
- **Buttons & Controls**:
  - Primary buttons: Amber background (#EAB308) with jet-black text (#000000)
  - Secondary buttons: White background with gray text
  - Active states: Amber background with jet-black text
  - Hover states: Jet-black background with amber text for high contrast
- **Animations**: Custom Tailwind animations for transitions

## Known Issues & Fixes

- **RLS Policy Error** (Fixed 2025-06-02): Infinite recursion in profiles table policies
- **UI Layout Issue** (Fixed 2025-06-02): Black background caused by conflicting CSS
- **Branding Update** (Fixed 2025-06-02): Updated color scheme to use #EAB308 amber as primary accent color
- **Listing Wizard Steps** (Fixed 2025-06-03): Fixed conditional step display based on listing category
- **TypeScript Errors** (Fixed 2025-06-03): Resolved type-only imports and null assignment issues
- **Image Upload UUID Error** (Fixed 2025-06-03): Fixed invalid UUID format during image upload with temporary IDs
- **Wizard Navigation Error** (Fixed 2025-06-03): Added safety checks to prevent accessing undefined steps
- **Listing Service TypeScript Errors** (Fixed 2025-06-04): Fixed TypeScript errors in the listing service related to the new normalized database schema
- **Missing Helper Function** (Fixed 2025-06-04): Replaced missing `getListingDetails` helper with direct database queries
- **Duplicate Code in createListing** (Fixed 2025-06-04): Removed duplicate code for image handling in the createListing function
- **AutoDealershipDetails Interface** (Fixed 2025-06-04): Resolved duplicate interface definition and added missing properties

## Listings Page UI (Public View)

### Overview
The Listings Page (`src/pages/ListingsPage.tsx`) provides a public interface for users to discover and browse published listings. It features search, filtering, and multiple view options to enhance user experience.

### Key Features & Recent Enhancements (as of 2025-06-05)

- **Modern Hero Section**: A prominent hero area with a solid primary yellow background and a clean, accessible search bar for initial discovery.
- **Sticky Filter/Results Bar**: Positioned below the hero, this bar remains visible on scroll (`sticky top-0 z-10`) and includes:
  - A "Filters" toggle button that controls the visibility of the Categories Section.
  - A dynamic count of total search/filter results from the server.
  - View toggle buttons to switch between 'grid' and 'list' layouts for listings (Note: View toggle was part of a previous design iteration and is currently removed in favor of a default grid view as per the latest UI revamp. This note should be updated if view toggle is re-introduced).
- **Collapsible Categories Section**: Revealed by the "Filters" button, this section uses Framer Motion for smooth expand/collapse animations. It contains:
  - Pill-style buttons for selecting a single category (or "All").
  - A "Clear All Filters" button that resets both the search term and selected category.
- **Server-Side Pagination**: Listings are now fetched in pages (e.g., 12 per page) to improve performance for large datasets. Filtering by search term and category is also handled server-side.
- **"Load More Listings" Button**: Appears when more listings are available, allowing users to load subsequent pages of results.
- **Dynamic Listings Display**: Utilizes the `ListingCard` component to show listings and `ListingCardSkeleton` for loading states.
- **Comprehensive State Handling**: Includes distinct visual states for:
  - Initial page loading (skeletons for the first page).
  - Subsequent page loading (`isLoadingMore` state for the "Load More" button).
  - Data fetching errors (error message with icon).
  - No listings published at all (empty state with icon and message, based on `totalListings` from server).
  - No listings matching current search/filter criteria (empty state with icon, message, and a "Clear All Filters" prompt, based on `totalListings` from server).
  - All empty/error states are enhanced with Framer Motion animations for a polished feel.
- **URL Synchronization**: Leverages React Router's `useSearchParams` to reflect the current `searchTerm` (param: `q`) and `selectedCategory` (param: `categories`) in the URL, enabling shareable and bookmarkable filtered views.
- **Robust JSX Structure**: The component underwent significant refactoring to resolve persistent JSX structural and parsing errors, resulting in a stable and maintainable codebase.

### Styling

- **Tailwind CSS**: Used for all layout and styling, adhering to the project's premium design language (neutral colors with primary yellow accents).
- **Framer Motion**: Integrated for animations in the Categories Section toggle and for the various loading/empty/error state containers.

### State Management (React Hooks)

- `searchTerm`: Manages the current text in the search bar.
- `selectedCategory`: Stores the currently selected category filter (or `null` for all).
- `listings`: Array holding the currently loaded (paginated) listings from the backend.
- `featuredListings`: Array holding a small number of listings (e.g., first 5 from page 1) for the featured carousel.
- `loading`: Boolean state for initial data fetching status (first page).
- `isLoadingMore`: Boolean state indicating if subsequent pages are being fetched (for "Load More" button).
- `error`: Stores error messages if data fetching fails.
- `currentPage`: Number tracking the current page of listings loaded.
- `totalListings`: Number storing the total count of listings available on the server for the current filters.
- `searchParams`, `setSearchParams`: From `react-router-dom` for URL synchronization.

*Note on `getPublishedListings` service: It's assumed this service (`src/features/listings/services/listingService.ts`) has been updated to accept pagination parameters (`page`, `limit`) and filter parameters (`searchTerm`, `category`), and returns an object like `{ listingsData: BaseListing[], totalCount: number }` to support server-side pagination and filtering.*

### Key Components Used

- `ListingCard.tsx`: Renders individual listing details.
- `ListingCardSkeleton.tsx`: Provides placeholder UI during loading.
- Various Icon Components (e.g., `SearchIcon`, `FilterIcon`, `GridIcon`, `ListIcon`, `ErrorIcon`, `EmptyBoxIcon`, `EmptyFilterIcon`, `CaretUpIcon`, `CaretDownIcon`): SVG icons for UI elements.
- `Button.tsx`: Standardized button component from `src/components/ui/Button.tsx`.

## Listing Management System

### Listing Wizard

- **Architecture**: Multi-step wizard with dynamic steps based on listing category
- **Components**:
  - `WizardContext`: Manages form state and navigation
  - `CreateListingWizard`: Main wizard container with progress indicator
  - Step Components: CategorySelection, BasicInfo, ContactInfo, BusinessHours, ServicesStep, PropertyStep, AutoDealershipStep, ImagesStep
- **Category-specific Logic**:
  - SERVICES: Includes BusinessHours and ServicesStep
  - STORE: Includes BusinessHours but excludes ServicesStep
  - PROPERTY: Includes PropertyStep but excludes BusinessHours
  - AUTO_DEALERSHIP: Includes BusinessHours and AutoDealershipStep
- **Safety Features**:
  - Step bounds validation to prevent undefined component errors
  - Type-safe form state management
  - Conditional step rendering based on category

### Listing Service (Updated 2025-06-04)

- **Architecture**: Backend service for CRUD operations on listings
- **Key Functions**:
  - `createListing`: Creates a new listing with category-specific details
  - `getListingById`: Retrieves a listing with all related data
  - `getUserListings`: Gets all listings for a specific user
  - `updateListing`: Updates a listing's basic information
  - `deleteListing`: Removes a listing and all related data
- **Category-specific Handling**:
  - Each category (PROPERTY, SERVICES, STORE, AUTO_DEALERSHIP) has dedicated data handling
  - Normalized database schema with separate tables for each category's details
  - TypeScript interfaces ensure type safety across the application
- **Error Handling**:
  - Comprehensive error logging for all database operations
  - Graceful error recovery to prevent application crashes
  - Detailed console logs for debugging purposes

### Supabase Storage Integration

- **Storage Bucket**: `listing_images` bucket with RLS policies
- **Security**:
  - Authenticated users can upload, update, and delete their own images
  - Public read access for displaying images
  - UUID generation for secure image identification
- **Image Upload Flow**:
  - Temporary IDs used during new listing creation
  - Images stored in storage before database records created
  - Database records created when listing is saved
  - Support for setting primary images

### Database Schema (Updated 2025-06-04)

- **Core Tables**:
  - `listings`: Main table with common fields for all listing types
  - `listing_images`: Stores image paths and primary image flag
  - `business_hours`: Operating hours for applicable listings
  - `services`: Services offered by service-type listings
- **Category-specific Tables**:
  - `property_details`: Specific fields for property listings (bedrooms, bathrooms, etc.)
  - `service_details`: Additional information for service listings
  - `store_details`: Store-specific information
  - `auto_dealership_details`: Fields specific to auto dealerships
- **Relationships**:
  - All related tables use `listing_id` foreign key to maintain relationships
  - One-to-many relationship between listings and images/hours/services
  - One-to-one relationship between listings and category-specific detail tables

## Next Development Priorities

1. Profile editing functionality
2. Social authentication integration
3. Role-based access control
4. Email verification workflow
5. Comprehensive error handling
6. Test suite implementation
7. Accessibility improvements
8. Image optimization and compression
9. Advanced search and filtering for listings


<!-- Admin Implementation  -->
Create an admin authentication system using the existing role field in profiles
Build the admin dashboard layout and navigation
Implement listing management screens (view, approve/reject, feature)
Add user management functionality
Create settings management interface