# Coffee Logging Application - Architecture Documentation

**Last Updated:** January 13, 2026  
**Version:** 2.0 (Post-Architectural Refactoring)

---

## Table of Contents

1. [Overview](#overview)
2. [Architectural Principles](#architectural-principles)
3. [Directory Structure](#directory-structure)
4. [Layer-by-Layer Deep Dive](#layer-by-layer-deep-dive)
5. [Data Flow & Patterns](#data-flow--patterns)
6. [Platform Independence Strategy](#platform-independence-strategy)
7. [Migration from V1 to V2](#migration-from-v1-to-v2)
8. [Future Portability](#future-portability)
9. [Development Guidelines](#development-guidelines)

---

## Overview

This application is a coffee logging platform built with **Next.js**, **Supabase**, and **Google Maps API**. The architecture has been completely refactored to enforce strict separation of concerns, platform independence, and portability to React Native/Android/iOS.

### Core Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 14 (App Router) | Web application framework |
| **UI Layer** | React 18 + TypeScript | Component library |
| **Styling** | Tailwind CSS | Styling (easily replaceable) |
| **Backend/Database** | Supabase | Authentication + PostgreSQL database |
| **Maps/Location** | Google Maps Places API | Location search and geocoding |
| **State Management** | React Hooks + Context | Local and shared state |

---

## Architectural Principles

The refactored architecture follows these core principles:

### 1. Architecture-First, UI-Second

**Business logic is king.** All domain rules, validation, and data transformations live in platform-agnostic modules (`core/domain/`). UI components are purely presentational.

**Example:**
```typescript
// ❌ Before: Business logic in UI component
function LoginForm() {
    const handleLogin = async () => {
        if (email.length < 3) setError('Invalid email');  // Validation in UI
        await supabase.auth.signIn({...});  // Direct API call
    }
}

// ✅ After: Logic in domain & service layers
import { validateEmail } from '@/core/domain/authDomain';
import { login } from '@/services/authService';

function LoginForm({ onSuccess }: LoginFormProps) {
    const { login } = useAuth();  // Hook abstracts service
    const validation = validateEmail(email);  // Domain logic
    if (!validation.isValid) return setError(validation.error);
    await login(email, password);  // Service handles API
}
```

### 2. Headless, Styling-Agnostic Design

Components are designed to work with **any UI framework**. Tailwind classes are confined to presentational components and can be completely replaced.

**Pattern:**
- **Container components** handle data & logic
- **Presenter components** handle rendering
- Business logic never references styling

### 3. Platform Portability

Code is structured to support:
- **Web (Next.js)** - Current implementation
- **Mobile (React Native)** - Future target
- **Desktop (Electron)** - Potential future target

Platform-specific code is isolated in `adapters/`.

### 4. No Tight Coupling to Next.js or Web APIs

- No `useRouter` in business logic
- No `window`, `document`, `localStorage` in domain/services
- Navigation abstracted behind adapters
- All browser APIs wrapped in adapters

### 5. Separation of Concerns

| Concern | Where It Lives |
|---------|---------------|
| Business Rules | `core/domain/` |
| Data Access | `services/` |
| Platform APIs | `adapters/` |
| React Integration | `hooks/` |
| UI Rendering | `components/` |
| Routing & Pages | `app/` |

---

## Directory Structure

```
coffee/
├── core/                          # Platform-agnostic business logic
│   ├── domain/                    # Business rules & validation
│   │   ├── authDomain.ts          # Authentication validation
│   │   ├── coffeeDomain.ts        # Coffee business logic
│   │   └── userDomain.ts          # User profile rules
│   └── types/                     # Centralized type definitions
│       └── types.ts               # All interfaces & types
│
├── services/                      # Data access layer (platform-agnostic interfaces)
│   ├── authService.ts             # Authentication operations
│   ├── coffeeService.ts           # Coffee log CRUD
│   ├── locationService.ts         # Location data operations
│   └── userService.ts             # User profile operations
│
├── adapters/                      # Platform-specific implementations
│   ├── supabaseClient.ts          # Supabase configuration
│   ├── googleMapsAdapter.ts       # Google Maps API wrapper
│   └── navigationAdapter.ts       # Router abstraction
│
├── hooks/                         # React hooks (bridge between services & UI)
│   ├── useAuth.ts                 # Authentication state & operations
│   ├── useCoffeeLogs.ts           # Coffee log state & CRUD
│   ├── useLocationSearch.ts       # Location search functionality
│   └── useUserProfile.ts          # User profile management
│
├── components/                    # React UI components
│   ├── auth/                      # Authentication components
│   │   ├── LoginForm.tsx          # Login form (pure UI)
│   │   └── SignUpForm.tsx         # Signup form (pure UI)
│   ├── features/                  # Feature components
│   │   ├── CoffeeFeed.tsx         # Coffee feed display
│   │   ├── LogCoffeeForm.tsx      # Coffee logging form
│   │   ├── LocationAutocomplete.tsx # Location search input
│   │   └── MapsProvider.tsx       # Google Maps script loader
│   ├── guards/                    # Higher-order components
│   │   └── AuthGuard.tsx          # Authentication guard
│   ├── layout/                    # Layout components
│   │   └── Header.tsx             # Application header
│   └── common/                    # Reusable UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       └── ...
│
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── login/page.tsx             # Login page
│   ├── signup/page.tsx            # Signup page
│   ├── home/page.tsx              # Authenticated home
│   └── user/page.tsx              # User profile page
│
└── lib/                           # Legacy (to be migrated)
    └── (deprecated files)
```

---

## Layer-by-Layer Deep Dive

### Layer 1: Core Domain (`core/`)

**Purpose:** Platform-agnostic business logic and type definitions.

**Rules:**
- ✅ Pure functions only
- ✅ No external dependencies (except utilities like `fuse.js`)
- ❌ No React, Next.js, browser APIs
- ❌ No database or API calls

#### `core/types/types.ts`

Centralized type definitions for the entire application.

**Key Types:**

```typescript
// Authentication & Users
export interface User { id: string; email: string; created_at: string; }
export interface UserProfile { user_id: string; username: string; ... }
export interface Session { user: User; access_token: string; ... }
export interface AuthResult { success: boolean; user?: User; error?: string; }

// Coffee Logs
export type PriceFeel = 'steal' | 'fair' | 'expensive' | '';
export interface CoffeeLog { id: string; coffee_name: string; ... }
export interface LogFormData { coffee_name: string; place: string; ... }

// Locations
export interface Location { id: string; place_name: string; ... }
export interface LocationDetails { place_name: string; lat: number; lng: number; ... }

// Validation
export interface ValidationResult { isValid: boolean; error?: string; }
```

**Why Centralized Types?**
- Single source of truth
- Easier refactoring (change once, update everywhere)
- Platform-agnostic (usable by web, mobile, desktop)

#### `core/domain/authDomain.ts`

Authentication business rules.

**Functions:**
- `validateEmail(email: string): ValidationResult` - Email format validation
- `validatePassword(password: string): ValidationResult` - Password strength rules
- `validateLoginCredentials(...)` - Combined validation
- `validateSignupData(...)` - Signup form validation

**Example:**
```typescript
export function validateEmail(email: string): ValidationResult {
    if (!email || email.trim().length === 0) {
        return { isValid: false, error: 'Email is required' };
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
}
```

#### `core/domain/coffeeDomain.ts`

Coffee logging business rules.

**Functions:**
- `filterCoffeeNames(query: string): string[]` - Autocomplete filtering
- `getCoffeeNameSpellSuggestion(name: string): string | null` - Fuzzy matching for spell-check
- `validateCoffeeLog(data): ValidationResult` - Log validation
- `getPriceFeelLabel(feel): string` - Display label for price perception
- `normalizeFlavorNotes(tags: string[]): string` - Comma-separated flavor notes
- `parseFlavorNotes(notes: string): string[]` - Parse flavor notes string

**Constants:**
- `COMMON_COFFEE_NAMES: string[]` - Canonical coffee name list
- `PREDEFINED_FLAVOR_TAGS: string[]` - Predefined flavor tags

**Why separate from UI?**
- Reusable across web/mobile/desktop
- Testable in isolation
- Easy to modify business rules without touching UI

#### `core/domain/userDomain.ts`

User profile business rules.

**Functions:**
- `validateUsername(username: string): ValidationResult` - Username format & restrictions
- `canChangeUsername(lastChangedAt: string | null): boolean` - 30-day rule check
- `getDaysUntilNextUsernameChange(lastChangedAt): number` - Calculate waiting period
- `getUsernameChangeEligibility(...)` - Combined eligibility check

**Business Rules:**
- Username must be 3-20 characters
- Only lowercase letters, numbers, underscores
- Cannot start with a number
- Reserved usernames blocked
- Can only change once every 30 days

---

### Layer 2: Services (`services/`)

**Purpose:** Data access layer with platform-agnostic interfaces.

**Rules:**
- ✅ Async functions returning `Promise<T>`
- ✅ Use adapters for platform-specific implementations
- ✅ Return structured results (`ServiceResult<T>`, `AuthResult`, etc.)
- ❌ No direct UI interaction
- ❌ No React hooks

#### `services/authService.ts`

Authentication operations using Supabase.

**Functions:**

```typescript
// Login user
export async function login(email: string, password: string): Promise<AuthResult>

// Sign up new user with profile creation
export async function signup(email: string, password: string, username: string): Promise<AuthResult>

// Logout current user
export async function logout(): Promise<{ success: boolean; error?: string }>

// Get current session
export async function getSession(): Promise<Session | null>

// Get current user
export async function getCurrentUser(): Promise<User | null>

// Subscribe to auth state changes
export function onAuthStateChange(callback: (session: Session | null) => void): () => void
```

**Why Abstracted?**
- Supabase implementation can be swapped for Firebase, Auth0, etc.
- Mobile apps can use different auth providers
- Testable with mock implementations

#### `services/coffeeService.ts`

Coffee log CRUD operations.

**Functions:**

```typescript
// Create new log
export async function createCoffeeLog(userId: string, logData: LogFormData): Promise<ServiceResult<CoffeeLog>>

// Update existing log
export async function updateCoffeeLog(logId: string, updates: Partial<LogFormData>): Promise<ServiceResult<CoffeeLog>>

// Soft delete log
export async function deleteCoffeeLog(logId: string, userId: string): Promise<ServiceResult<void>>

// Fetch user's logs
export async function fetchUserCoffeeLogs(userId: string): Promise<CoffeeLog[]>

// Fetch public feed
export async function fetchPublicCoffeeFeed(options?: { limit?: number; city?: string }): Promise<CoffeeLogWithUsername[]>
```

**Key Patterns:**
- Returns `ServiceResult<T>` with `{ success, data?, error? }`
- Handles all database operations
- Enriches data (e.g., fetching usernames for feed)

#### `services/locationService.ts`

Location data operations.

**Functions:**

```typescript
// Find existing location or create new one
export async function findOrCreateLocation(details: LocationDetails): Promise<ServiceResult<Location>>

// Get location by ID
export async function getLocationById(locationId: string): Promise<Location | null>

// Get location by Google Place ID
export async function getLocationByPlaceId(placeId: string): Promise<Location | null>
```

**Pattern:** Find-or-create avoids duplicates.

#### `services/userService.ts`

User profile operations.

**Functions:**

```typescript
// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null>

// Check username availability
export async function checkUsernameAvailability(username: string): Promise<UsernameAvailability>

// Update username
export async function updateUsername(userId: string, newUsername: string): Promise<ServiceResult<UserProfile>>

//Get multiple profiles
export async function getUserProfiles(userIds: string[]): Promise<UserProfile[]>
```

---

### Layer 3: Adapters (`adapters/`)

**Purpose:** Platform-specific implementations.

**Rules:**
- ✅ Wraps browser APIs, third-party SDKs
- ✅ Provides swap-able interfaces
- ❌ No business logic

#### `adapters/supabaseClient.ts`

Supabase client configuration.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Note:** Only imported by services, never by components.

#### `adapters/googleMapsAdapter.ts`

Google Maps Places API wrapper.

**Interface:**

```typescript
export interface LocationSearchAdapter {
    initialize(): Promise<boolean>;
    searchPlaces(query: string): Promise<LocationSuggestion[]>;
    getPlaceDetails(placeId: string): Promise<LocationDetails | null>;
    startSession(): void;
    endSession(): void;
}
```

**Implementation:**

```typescript
export class GoogleMapsAdapter implements LocationSearchAdapter {
    private autocompleteService: google.maps.places.AutocompleteService | null;
    private placesService: google.maps.places.PlacesService | null;
    private sessionToken: google.maps.places.AutocompleteSessionToken | null;
    
    // ... implementation
}
```

**Why Adapter Pattern?**
- Can swap Google Maps for Mapbox, HERE, etc.
- Mobile apps can use native map SDKs
- Billing optimization via session tokens

#### `adapters/navigationAdapter.ts`

Router abstraction for platform independence.

**Interface:**

```typescript
export interface NavigationAdapter {
    push(path: string): void;
    replace(path: string): void;
    back(): void;
    refresh(): void;
}
```

**Next.js Implementation:**

```typescript
export class NextJsNavigationAdapter implements NavigationAdapter {
    constructor(router: any) { this.router = router; }
    push(path: string) { this.router.push(path); }
    // ...
}
```

**Future React Native Implementation:**

```typescript
export class ReactNavigationAdapter implements NavigationAdapter {
    constructor(navigation: any) { this.navigation = navigation; }
    push(path: string) { this.navigation.navigate(path); }
    // ...
}
```

---

### Layer 4: Hooks (`hooks/`)

**Purpose:** Bridge between services and React components.

**Rules:**
- ✅ Use React hooks (`useState`, `useEffect`, `useCallback`)
- ✅ Call services, not adapters directly
- ✅ Provide reactive state to components
- ❌ No business logic (delegate to domain)
- ❌ No JSX/rendering

#### `hooks/useAuth.ts`

Authentication state hook.

**API:**

```typescript
interface UseAuthReturn {  
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email, password) => Promise<{ success, error? }>;
    signup: (email, password, username) => Promise<{ success, error? }>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn
```

**Usage in Components:**

```typescript
function LoginForm({ onSuccess }: LoginFormProps) {
    const { login, loading } = useAuth();
    
    const handleLogin = async () => {
        const result = await login(email, password);
        if (result.success) onSuccess();
    }
}
```

#### `hooks/useCoffeeLogs.ts`

Coffee logs management hook.

**API:**

```typescript
interface UseCoffeeLogsReturn {
    logs: CoffeeLog[];
    loading: boolean;
    error: string | null;
    createLog: (logData) => Promise<{ success, error? }>;
    updateLog: (id, updates) => Promise<{ success, error? }>;
    deleteLog: (id) => Promise<{ success, error? }>;
    refreshLogs: () => Promise<void>;
}

export function useCoffeeLogs(userId: string | null): UseCoffeeLogsReturn
export function usePublicCoffeeFeed(options?): UsePublicFeedReturn
```

#### `hooks/useUserProfile.ts`

User profile management hook.

**API:**

```typescript
interface UseUserProfileReturn {
    profile: UserProfile | null;
    loading: boolean;
    usernameAvailable: boolean | null;
    usernameError: string | null;
    changeEligibility: UsernameChangeEligibility | null;
    checkUsernameAvailability: (username) => Promise<void>;
    updateUsername: (newUsername) => Promise<{ success, error? }>;
    refreshProfile: () => Promise<void>;
}

export function useUserProfile(userId: string | null): UseUserProfileReturn
```

#### `hooks/useLocationSearch.ts`

Location search hook (replaces old `usePlacesAutocomplete`).

**API:**

```typescript
interface UseLocationSearchReturn {
    suggestions: LocationSuggestion[];
    loading: boolean;
    initialized: boolean;
    onInputFocus: () => void;
    onInputChange: (value: string) => void;
    onPlaceSelect: (placeId, callback: (details) => void) => void;
    clearSession: () => void;
}

export function useLocationSearch(debounceMs?: number): UseLocationSearchReturn
```

**Key Features:**
- Auto-initialization of Google Maps API
- Session management for billing optimization
- Debounced search
- Platform-agnostic (uses `googleMapsAdapter`)

---

### Layer 5: Components (`components/`)

**Purpose:** Pure UI rendering.

**Rules:**
- ✅ Use hooks for data & logic
- ✅ Accept callbacks for actions (no direct navigation)
- ✅ Minimal logic (only UI state)
- ❌ No direct service/adapter imports
- ❌ No business validation (delegate to hooks/domain)

#### Pattern: Container/Presenter Split

**Old Monolithic Component:**

```typescript
function CoffeeFeed() {
    const [logs, setLogs] = useState([]);
    
    useEffect(() => {
        // Direct database query
        const fetchLogs = async () => {
            const { data } = await supabase.from('coffee_logs').select('*');
            setLogs(data);
        };
        fetchLogs();
    }, []);
    
    return <div>{logs.map(log => ...)}</div>
}
```

**New Architecture:**

```typescript
// Hook handles data
function useCoffeeFeed() {
    const [logs, setLogs] = useState([]);
    // ... fetch logic using service
    return { logs, loading };
}

// Component is pure UI
function CoffeeFeed() {
    const { logs, loading } = usePublicCoffeeFeed();
    
    if (loading) return <LoadingSkeleton />;
    if (logs.length === 0) return <EmptyState />;
    
    return <div>{logs.map(log => <LogCard log={log} />)}</div>
}
```

#### Refactored Components

1. **LoginForm.tsx**
   - Removed: Direct Supabase calls, `useRouter`, session checks
   - Added: `useAuth` hook, `onSuccess` callback prop
   - Pure: Form UI with validation feedback

2. **SignUpForm.tsx**
   - Removed: Database queries, username availability checks
   - Added: `useAuth` + `useUserProfile` hooks
   - Pure: Form UI with real-time validation feedback

3. **LogCoffeeForm.tsx**
   - Removed: Supabase imports, router, inline location creation
   - Added: `useCoffeeLogs`, `findOrCreateLocation` service, domain logic for spell-check
   - Pure (mostly): Form UI with autocomplete, spell suggestions, flavor tags

4. **CoffeeFeed.tsx**
   - Removed: useEffect data fetching, database queries
   - Added: `usePublicCoffeeFeed` hook
   - Pure: Grid layout with coffee cards

5. **LocationAutocomplete.tsx**
   - Removed: Direct Google Maps API usage
   - Added: `useLocationSearch` hook
   - Pure: Autocomplete input with dropdown

---

### Layer 6: Pages (`app/`)

**Purpose:** Route definitions and page composition.

**Pattern:**

```typescript
// Page orchestrates navigation and layout
function HomePage() {
    const router = useRouter();
    
    return (
        <AuthGuard 
            onUnauthenticated={() => router.push('/login')}
            onNoProfile={() => router.push('/set-username')}
        >
            <div>
                <Header />
                <LogCoffeeAction />
                <CoffeeFeed />
            </div>
        </AuthGuard>
    );
}
```

**Navigation Handling:**

Forms now accept `onSuccess` callbacks:

```typescript
function LoginPage() {
    const router = useRouter();
    
    return (
        <LoginForm onSuccess={() => {
            router.push('/home');
            router.refresh();
        }} />
    );
}
```

---

## Data Flow & Patterns

### User Authentication Flow

```
┌─────────────┐
│ LoginForm   │  (Component - Pure UI)
│  - Email    │
│  - Password │
└──────┬──────┘
       │ onSubmit
       ↓
┌──────────────┐
│ useAuth Hook │  (Hooks Layer)
│  - login()   │
└──────┬───────┘
       │ calls
       ↓
┌─────────────────┐
│ authService     │  (Service Layer)
│  - login(email) │
└──────┬──────────┘
       │ uses  
       ↓
┌──────────────────┐
│ supabaseClient   │  (Adapter Layer)
│  - auth.signIn() │
└──────────────────┘
```

### Coffee Log Creation Flow

```
Component (LogCoffeeForm)
    │
    ├─> Domain Logic: validateCoffeeLog(data)
    │   
    ├─> Hook: useCoffeeLogs().createLog(logData)
    │       │
    │       └─> Service: coffeeService.createCoffeeLog(userId, data)
    │               │
    │               └─> Adapter: supabase.from('coffee_logs').insert()
    │
    └─> Service: locationService.findOrCreateLocation(details)
            │
            └─> Adapter: supabase.from('locations').select/insert()
```

### Location Search Flow

```
LocationAutocomplete (Component)
    │
    ├─> Hook: useLocationSearch().onInputChange(query)
    │       │
    │       └─> Adapter: googleMapsAdapter.searchPlaces(query)
    │               │
    │               └─> Browser: window.google.maps.places.AutocompleteService
    │
    └─> Hook: useLocationSearch().onPlaceSelect(placeId)
            │
            └─> Adapter: googleMapsAdapter.getPlaceDetails(placeId)
                    │
                    └─> Browser: window.google.maps.places.PlacesService
```

---

## Platform Independence Strategy

### Current Platform: Web (Next.js)

| Concern | Implementation |
|---------|---------------|
| **Routing** | Next.js App Router |
| **Navigation** | `useRouter` wrapped in `NavigationAdapter` |
| **Storage** | localStorage (to be wrapped in adapter) |
| **Maps** | Google Maps JavaScript API via `GoogleMaps Adapter` |
| **Auth** | Supabase Auth via `authService` |

### Future Platform: React Native

| Concern | Swap Implementation |
|---------|---------------------|
| **Routing** | React Navigation |
| **Navigation** | `ReactNavigationAdapter` |
| **Storage** | AsyncStorage via `StorageAdapter` |
| **Maps** | React Native Maps via `NativeMapsAdapter` |
| **Auth** | Same `authService`, different Supabase client |

**Migration Path:**

1. **Core & Services**: No changes needed (100% portable)
2. **Hooks**: Minimal changes (mostly portable)
3. **Adapters**: Swap implementations
4. **Components**: Replace with React Native components (same props/logic)

---

## Migration from V1 to V2

### What Changed?

| V1 (Before) | V2 (After) |
|-------------|------------|
| Components fetch data directly | Components use hooks |
| Business logic in components | Business logic in `core/domain` |
| Supabase imported everywhere | Supabase only in `services` & `adapters` |
| `useRouter` in forms | Navigation via callbacks |
| Inline validation | Domain functions for validation |
| No type centralization | All types in `core/types` |

### Breaking Changes

✅ **None for end users** - functional parity maintained  
⚠️ **For developers:**
- Import paths changed (`@/lib/supabaseClient` → `@/adapters/supabaseClient`)
- Components now require `onSuccess` callbacks
- Hooks replace direct service imports

---

## Future Portability

### Adding a New Platform (e.g., iOS)

1. **Create Platform-Specific Adapters**
   - `adapters/iosNavigationAdapter.ts`
   - `adapters/iosStorageAdapter.ts`
   - `adapters/appleMapsAdapter.ts`

2. **Reuse Core & Services** (100%)
   - `core/` - No changes
   - `services/` - No changes

3. **Reuse Hooks** (95%)
   - Minor tweaks for platform detection

4. **Replace Components**
   - Use React Native components
   - Keep same props/interfaces

---

## Development Guidelines

### Adding a New Feature

**Example: Adding "Favorite Cafes"**

1. **Define Types** (`core/types/types.ts`)
   ```typescript
   export interface Favorite {
       id: string;
       user_id: string;
       location_id: string;
       created_at: string;
   }
   ```

2. **Add Domain Logic** (`core/domain/favoriteDomain.ts`)
   ```typescript
   export function validateFavorite(data): ValidationResult { ... }
   ```

3. **Create Service** (`services/favoriteService.ts`)
   ```typescript
   export async function addFavorite(...): Promise<ServiceResult<Favorite>>
   export async function removeFavorite(...): Promise<ServiceResult<void>>
   export async function getFavorites(...): Promise<Favorite[]>
   ```

4. **Create Hook** (`hooks/useFavorites.ts`)
   ```typescript
   export function useFavorites(userId: string) {
       const [favorites, setFavorites] = useState([]);
       const addFavorite = async (locationId) => { ... };
       return { favorites, addFavorite, ... };
   }
   ```

5. **Create UI Component** (`components/features/FavoriteButton.tsx`)
   ```typescript
   export function FavoriteButton({ locationId }: Props) {
       const { addFavorite, removeFavorite } = useFavorites(userId);
       // ... pure UI
   }
   ```

### Testing Strategy  

```
Domain Layer  → Unit tests (pure functions)
Services      → Integration tests (mock Supabase)
Hooks         → React Testing Library
Components    → Storybook + Visual regression
E2E           → Playwright/Cypress
```

---

## Key Design Decisions

### Why No Global State Management (Redux/Zustand)?

**Current approach:** React hooks + context for auth  
**Reason:** 
- State is mostly server-driven (Supabase real-time)
- Hooks provide sufficient local state management
- Easier to port to React Native without Redux Native

**Future:** If complexity increases, consider Zustand for cross-platform state.

### Why Type Assertions in Some Places?

**Example:** `price_feel: formData.price_feel as any`

**Reason:** Supabase's generated types sometimes conflict with our domain types. Type assertions bridge the gap temporarily.

**Better Solution:** Generate precise Supabase types from schema.

### Why Separate `LocationDetails` from `Location`?

**LocationDetails**: Returned from Google Maps API (no ID)  
**Location**: Stored in database (has ID)

Separation clarifies data flow: API → `LocationDetails` → Service → `Location`

---

## Conclusion

This architecture prioritizes:
✅ **Maintainability** - Clear separation makes changes predictable  
✅ **Testability** - Each layer tested independently  
✅ **Portability** - Easy migration to mobile/desktop  
✅ **Scalability** - Add features without touching existing layers

**Next Steps:**
1. Complete page refactoring (`app/login`, `app/signup`)
2. Add unit tests for domain logic
3. Add integration tests for services
4. Document API contracts
5. Create React Native POC

---

**Questions?** Refer back to this document or check inline comments in code files.
