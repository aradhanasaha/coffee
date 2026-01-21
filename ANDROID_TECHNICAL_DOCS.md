# imnotupyet - Technical Documentation for Android Development

This document provides a complete technical overview of the **imnotupyet** coffee logging web application. It is designed to enable an Android development team to build a native mobile version that is fully compatible with the existing backend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Backend: Supabase](#3-backend-supabase)
4. [Data Models & Types](#4-data-models--types)
5. [Domain Logic](#5-domain-logic)
6. [Services Layer (API)](#6-services-layer-api)
7. [Authentication](#7-authentication)
8. [Features](#8-features)
9. [API Reference](#9-api-reference)
10. [RLS Policies](#10-rls-policies)
11. [Android Implementation Notes](#11-android-implementation-notes)

---

## 1. Project Overview

**imnotupyet** is a social coffee logging platform where users can:
- Log coffee drinks with ratings, reviews, photos, and location data
- Follow other users
- Like coffee logs
- Create and share curated lists of coffee experiences
- Discover public lists and cafés

**Tech Stack (Web):**
- **Framework:** Next.js 14 (App Router)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Language:** TypeScript
- **Styling:** TailwindCSS

---

## 2. Architecture

The codebase follows a **layered architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                  UI LAYER                       │
│        (React Components, Pages)                │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                HOOKS LAYER                      │
│  (useAuth, useCoffeeLogs, useLikes, useLists)   │
│       React-specific state management           │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               SERVICES LAYER                    │
│  (authService, coffeeService, likeService...)   │
│       Platform-agnostic business operations     │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                DOMAIN LAYER                     │
│  (authDomain, coffeeDomain, likeDomain...)      │
│       Pure validation & business rules          │
│       NO external dependencies                  │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               ADAPTERS LAYER                    │
│           (supabaseClient.ts)                   │
│       Database/API client abstraction           │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│           SUPABASE (PostgreSQL)                 │
│      Auth, Database, Storage, RLS               │
└─────────────────────────────────────────────────┘
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `core/types/` | TypeScript interfaces (platform-agnostic) |
| `core/domain/` | Business rules and validation (no dependencies) |
| `services/` | API operations using Supabase client |
| `hooks/` | React hooks (web-specific) |
| `adapters/` | Supabase client initialization |
| `components/` | React UI components |
| `app/` | Next.js pages and routing |

---

## 3. Backend: Supabase

### Connection

**Environment Variables (required):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Client Initialization:**
```kotlin
// Android equivalent
val supabase = createSupabaseClient(
    supabaseUrl = "https://your-project.supabase.co",
    supabaseKey = "your-anon-key"
)
```

### Database Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (username, follower counts) |
| `coffee_logs` | Coffee entries with ratings, reviews, images |
| `locations` | Cached Google Places locations |
| `likes` | Polymorphic like system (target_type: coffee_log, list, etc.) |
| `follows` | User follow relationships |
| `lists` | Curated lists of coffee logs |
| `list_items` | Junction table: list ↔ coffee_log |
| `list_saves` | User bookmarks of lists |

---

## 4. Data Models & Types

### User & Auth

```kotlin
data class User(
    val id: String,           // UUID
    val email: String,
    val created_at: String    // ISO 8601
)

data class UserProfile(
    val user_id: String,
    val username: String,
    val username_last_changed_at: String?,
    val created_at: String,
    val follower_count: Int = 0,
    val following_count: Int = 0
)

data class Session(
    val user: User,
    val access_token: String,
    val expires_at: Long?
)
```

### Coffee Log

```kotlin
enum class PriceFeel { STEAL, FAIR, EXPENSIVE }

data class CoffeeLog(
    val id: String,                    // UUID
    val user_id: String,
    val coffee_name: String,
    val place: String,
    val price_feel: PriceFeel?,
    val rating: Int,                   // 0-5
    val review: String?,
    val flavor_notes: String?,         // Comma-separated
    val location_id: String?,
    val image_url: String?,
    val created_at: String,
    val updated_at: String?,
    val deleted_at: String?,           // Soft delete
    val image_deleted_at: String?      // Image soft delete
)

data class CoffeeLogWithUsername(
    // All CoffeeLog fields +
    val username: String?
)
```

### Like System

```kotlin
enum class LikeTargetType { COFFEE_LOG, LIST, PHOTO, CAFE }

data class Like(
    val id: String,
    val user_id: String,
    val target_id: String,
    val target_type: LikeTargetType,
    val created_at: String
)

data class LikeStatus(
    val isLiked: Boolean,
    val likeCount: Int
)
```

### Follow System

```kotlin
data class FollowRelationship(
    val id: String,
    val follower_id: String,
    val following_id: String,
    val created_at: String
)

data class FollowStatus(
    val isFollowing: Boolean
)
```

### List System

```kotlin
enum class ListVisibility { PRIVATE, PUBLIC }

data class List(
    val id: String,
    val owner_id: String,
    val title: String,
    val description: String?,
    val visibility: ListVisibility,
    val created_at: String,
    val updated_at: String,
    val deleted_at: String?
)

data class ListItem(
    val id: String,
    val list_id: String,
    val coffee_log_id: String,
    val added_at: String
)

data class ListWithItems(
    // All List fields +
    val items: List<ListItem>,
    val logs: List<CoffeeLog>?,
    val owner: Owner?,
    val item_count: Int?,
    val save_count: Int?,
    val is_saved: Boolean?
)
```

### Location

```kotlin
data class Location(
    val id: String,
    val place_name: String,
    val place_address: String,
    val lat: Double,
    val lng: Double,
    val google_place_id: String,
    val created_at: String
)
```

---

## 5. Domain Logic

Domain logic is **pure** and **platform-agnostic**. Reimplement these rules in Android.

### Username Validation

```kotlin
fun validateUsername(username: String): ValidationResult {
    val trimmed = username.trim()
    
    if (trimmed.isEmpty()) return ValidationResult(false, "Username is required")
    if (trimmed.length < 3) return ValidationResult(false, "Username must be at least 3 characters")
    if (trimmed.length > 20) return ValidationResult(false, "Username must be at most 20 characters")
    
    val validPattern = Regex("^[a-z0-9_]+$")
    if (!validPattern.matches(trimmed)) {
        return ValidationResult(false, "Username can only contain lowercase letters, numbers, and underscores")
    }
    
    if (trimmed.first().isDigit()) {
        return ValidationResult(false, "Username cannot start with a number")
    }
    
    val reserved = listOf("admin", "root", "system", "null", "undefined", "home", "user", "login", "signup")
    if (reserved.contains(trimmed.lowercase())) {
        return ValidationResult(false, "This username is reserved")
    }
    
    return ValidationResult(true)
}
```

### Username Change Eligibility

Users can only change their username **once every 30 days**.

```kotlin
fun canChangeUsername(lastChangedAt: String?): Boolean {
    if (lastChangedAt == null) return true
    
    val lastChanged = Instant.parse(lastChangedAt)
    val thirtyDaysAgo = Instant.now().minus(Duration.ofDays(30))
    
    return lastChanged.isBefore(thirtyDaysAgo)
}
```

### Coffee Log Validation

```kotlin
fun validateCoffeeLog(data: LogFormData): ValidationResult {
    if (data.coffee_name.isBlank()) {
        return ValidationResult(false, "Coffee name is required")
    }
    if (data.place.isBlank()) {
        return ValidationResult(false, "Place is required")
    }
    if (data.rating < 0 || data.rating > 5) {
        return ValidationResult(false, "Rating must be between 0 and 5")
    }
    return ValidationResult(true)
}
```

### Like Validation

```kotlin
fun validateLikeOperation(userId: String?, targetId: String, targetType: LikeTargetType): ValidationResult {
    if (userId == null) {
        return ValidationResult(false, "You must be logged in to like")
    }
    
    // UUID format check
    val uuidRegex = Regex("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", RegexOption.IGNORE_CASE)
    if (!uuidRegex.matches(targetId)) {
        return ValidationResult(false, "Invalid target ID format")
    }
    
    return ValidationResult(true)
}
```

### Follow Validation

```kotlin
fun validateFollowOperation(followerId: String, followingId: String): ValidationResult {
    if (followerId.isBlank()) {
        return ValidationResult(false, "Follower ID is required")
    }
    if (followingId.isBlank()) {
        return ValidationResult(false, "Following ID is required")
    }
    if (followerId == followingId) {
        return ValidationResult(false, "Cannot follow yourself")
    }
    return ValidationResult(true)
}
```

---

## 6. Services Layer (API)

These are the core API operations. Replace Supabase JS SDK with Supabase Kotlin SDK.

### AuthService

| Function | Description |
|----------|-------------|
| `login(email, password)` | Sign in with email/password |
| `signup(email, password, username)` | Create account + profile |
| `logout()` | Sign out |
| `getSession()` | Get current session |
| `getCurrentUser()` | Get current user |
| `onAuthStateChange(callback)` | Subscribe to auth changes |

### CoffeeService

| Function | Description |
|----------|-------------|
| `createCoffeeLog(userId, logData)` | Create a new coffee log |
| `updateCoffeeLog(logId, updates)` | Update existing log |
| `deleteCoffeeLog(logId, userId)` | Soft delete a log |
| `fetchUserCoffeeLogs(userId)` | Get user's own logs |
| `fetchPublicCoffeeFeed(options)` | Get public feed, prioritizes followed users |

### LikeService

| Function | Description |
|----------|-------------|
| `toggleLike(userId, targetId, targetType)` | Like/unlike a target |
| `getLikeStatus(userId, targetId, targetType)` | Get like status + count |
| `getLikesForTarget(targetId, targetType)` | Get all likes for a target |
| `getUserLikes(userId, targetType?)` | Get items user has liked |

### FollowService

| Function | Description |
|----------|-------------|
| `followUser(followerId, followingId)` | Follow a user |
| `unfollowUser(followerId, followingId)` | Unfollow a user |
| `getFollowStatus(followerId, targetUserId)` | Check if following |
| `getFollowing(userId)` | Get users being followed |
| `getFollowers(userId)` | Get user's followers |

### ListService

| Function | Description |
|----------|-------------|
| `createList(userId, formData)` | Create a new list |
| `fetchUserLists(userId)` | Get user's lists |
| `fetchPublicLists()` | Get public lists for discovery |
| `addListItem(listId, coffeeLogId)` | Add coffee log to list |
| `removeListItem(listId, coffeeLogId)` | Remove from list |
| `fetchListDetails(listId)` | Get list with hydrated logs |
| `saveList(userId, listId)` | Bookmark a list |

### UserService

| Function | Description |
|----------|-------------|
| `getUserProfile(userId)` | Get profile by user ID |
| `checkUsernameAvailability(username)` | Check if username is taken |
| `updateUsername(userId, newUsername)` | Update username |
| `getUserProfiles(userIds)` | Batch fetch profiles |

---

## 7. Authentication

### Flow

1. **Signup:**
   - Create auth user via `supabase.auth.signUp()`
   - Database trigger auto-creates profile with default username
   - Update profile with user's chosen username

2. **Login:**
   - Authenticate via `supabase.auth.signInWithPassword()`
   - Session stored in Supabase client

3. **Session Management:**
   - Supabase handles token refresh automatically
   - Subscribe to `onAuthStateChange` for session updates

4. **Protected Routes:**
   - Check session on app launch
   - Redirect to login if no session
   - Redirect to `/set-username` if profile has no username

### Profile Auto-Creation Trigger

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, username)
  values (new.id, 'user_' || substr(md5(random()::text), 1, 8));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 8. Features

### Coffee Logging

- **Create:** photo (optional), coffee name, place, rating (0-5 stars), review, flavor notes, price feel
- **Read:** chronological list, filterable by city
- **Update:** edit all fields except image
- **Delete:** soft delete (sets `deleted_at`)
- **Image Soft Delete:** sets `image_deleted_at` without removing the file

### Public Feed

- Shows all non-deleted coffee logs
- Prioritizes posts from followed users
- Enriched with username from profiles table
- Optional city filter via joined locations table

### Like System

- Generic/polymorphic: can like coffee_logs, lists, photos, cafes
- Toggle-based (like/unlike in single action)
- Optimistic UI updates with rollback on failure
- Count displayed per item

### Follow System

- Users can follow/unfollow others
- Follower/following counts stored on profiles table
- Auto-managed via database triggers
- Self-follow prevented at service layer

### Lists

- Users create private or public lists
- Add/remove coffee logs from lists
- Public lists discoverable by all users
- Lists linked to owner via foreign key

---

## 9. API Reference

### Supabase Queries (Direct Translation)

**Fetch User Coffee Logs:**
```kotlin
supabase.from("coffee_logs")
    .select()
    .eq("user_id", userId)
    .filter("deleted_at", FilterOperator.IS, null)
    .order("created_at", Order.DESCENDING)
```

**Fetch Public Feed with Usernames:**
```kotlin
// Step 1: Fetch logs
val logs = supabase.from("coffee_logs")
    .select("*, locations:location_id(city)")
    .filter("deleted_at", FilterOperator.IS, null)
    .order("created_at", Order.DESCENDING)

// Step 2: Fetch profiles for usernames
val userIds = logs.map { it.user_id }.distinct()
val profiles = supabase.from("profiles")
    .select("user_id, username")
    .filter("user_id", FilterOperator.IN, userIds)

// Step 3: Merge in memory
```

**Toggle Like:**
```kotlin
// Check existing
val existing = supabase.from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("target_id", targetId)
    .eq("target_type", targetType)
    .maybeSingle()

if (existing != null) {
    // Unlike
    supabase.from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("target_id", targetId)
        .eq("target_type", targetType)
} else {
    // Like
    supabase.from("likes")
        .insert(mapOf(
            "user_id" to userId,
            "target_id" to targetId,
            "target_type" to targetType
        ))
}
```

---

## 10. RLS Policies

All tables use Row Level Security. The Android app authenticates via Supabase Auth, and the access token is sent with all requests.

### coffee_logs

| Operation | Policy |
|-----------|--------|
| SELECT | Anyone can view if `deleted_at IS NULL` |
| INSERT | Only own records (`auth.uid() = user_id`) |
| UPDATE | Only own records |
| DELETE | Only own records |

### likes

| Operation | Policy |
|-----------|--------|
| SELECT | Anyone |
| INSERT | Only own records |
| DELETE | Only own records |

### follows

| Operation | Policy |
|-----------|--------|
| SELECT | Anyone |
| INSERT | Only where `follower_id = auth.uid()` |
| DELETE | Only where `follower_id = auth.uid()` |

### profiles

| Operation | Policy |
|-----------|--------|
| SELECT | Anyone (public profiles) |
| UPDATE | Only own profile |

---

## 11. Android Implementation Notes

### Recommended Stack

- **Supabase SDK:** `io.github.jan-tennert.supabase:supabase-kt`
- **Authentication:** Supabase Auth with session persistence
- **Networking:** Ktor (included in Supabase SDK)
- **State Management:** ViewModel + StateFlow/LiveData
- **Image Loading:** Coil
- **UI:** Jetpack Compose

### Key Considerations

1. **Reuse Domain Logic:** Port the `core/domain/` functions to Kotlin. They have no dependencies.

2. **Replicate Service Layer:** The `services/` layer maps 1:1 to Supabase operations. Use the Kotlin SDK equivalents.

3. **No Hooks:** Replace React hooks with Android ViewModels. Each hook corresponds roughly to a ViewModel.

4. **Image Upload:** Use Supabase Storage for uploading coffee log images.

5. **Optimistic Updates:** Implement for likes and follows to match web UX.

6. **Offline Support:** Consider caching with Room for offline viewing.

7. **Deep Linking:** Support URLs like `/user/{username}` and `/lists/{id}`.

8. **Share Intent:** Implement native share sheet for "share with friends" feature.

### API Endpoints Summary

| Feature | Table(s) | Key Operations |
|---------|----------|----------------|
| Auth | `auth.users`, `profiles` | signUp, signIn, signOut |
| Coffee Logs | `coffee_logs`, `locations` | CRUD, public feed |
| Likes | `likes` | toggle, count, status |
| Follows | `follows`, `profiles` | follow/unfollow, counts |
| Lists | `lists`, `list_items`, `list_saves` | CRUD, public discovery |


### Public Feed Pagination Strategy

The public coffee feed uses cursor-based pagination to ensure stable ordering and scalability.

- Ordering:
  - Sorted by `created_at` in descending order (newest first)

- Page Size:
  - Default page size: 20 coffee logs per request

- Cursor:
  - The cursor is the `created_at` value of the last item in the currently loaded page
  - Subsequent requests fetch records where:
    `created_at < last_cursor`

- Initial Load:
  - Fetch the first 20 records with no cursor applied

- Load More (Infinite Scroll):
  - When the user scrolls near the end of the list:
    - Pass the last item's `created_at` as the cursor
    - Append the next page to the existing feed

- Pull-to-Refresh:
  - Clears the local feed state
  - Resets the cursor
  - Refetches the first page from the top

- Deleted Records:
  - Records with `deleted_at IS NOT NULL` are always excluded

- Consistency Guarantee:
  - Cursor-based pagination prevents duplicate or missing items
    when new coffee logs are created while scrolling


---

## Contact

For questions about this documentation or the web codebase, contact the web development team.

---

*Generated: 2026-01-20*
