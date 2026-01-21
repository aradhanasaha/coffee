/**
 * Centralized Type Definitions
 * Platform-agnostic types for the entire application
 */

// ============================================================================
// Auth & User Types
// ============================================================================

export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface UserProfile {
    user_id: string;
    username: string;
    username_last_changed_at: string | null;
    created_at: string;
}

export interface Session {
    user: User;
    access_token: string;
    expires_at?: number;
}

export interface AuthResult {
    success: boolean;
    user?: User;
    session?: Session;
    error?: string;
}

// ============================================================================
// Coffee Log Types
// ============================================================================

export type PriceFeel = 'steal' | 'fair' | 'expensive' | '';

export interface CoffeeLog {
    id: string;
    user_id: string;
    coffee_name: string;
    place: string;
    price_feel: PriceFeel;
    rating: number;
    review: string | null;
    flavor_notes: string | null;
    location_id: string | null;
    image_url?: string | null;
    created_at: string;
    updated_at?: string;
    deleted_at: string | null;
    deleted_by?: string | null;
    deletion_reason?: string | null;
    image_deleted_at?: string | null;
}

export interface CoffeeLogWithUsername extends CoffeeLog {
    username?: string;
}

export interface LogFormData {
    coffee_name: string;
    place: string;
    price_feel: PriceFeel;
    rating: number;
    review: string;
    flavor_notes?: string;
    location_id?: string | null;
    image_url?: string | null;
}

export interface LogUpdateData extends Partial<LogFormData> {
    id: string;
}

// ============================================================================
// Location Types
// ============================================================================

export interface Location {
    id: string;
    place_name: string;
    place_address: string;
    lat: number;
    lng: number;
    google_place_id: string;
    created_at: string;
}

export interface LocationDetails {
    place_name: string;
    place_address: string;
    lat: number;
    lng: number;
    google_place_id: string;
}

export interface LocationSuggestion {
    place_id: string;
    description: string;
    main_text: string;
    secondary_text: string;
}

export interface TopLocation {
    id: string; // location_id or place name if no ID
    name: string;
    area: string;
    count: number;
    image?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// ============================================================================
// Service Result Types
// ============================================================================

export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ============================================================================
// Username Types
// ============================================================================

export interface UsernameAvailability {
    available: boolean;
    error?: string;
}

export interface UsernameChangeEligibility {
    canChange: boolean;
    daysUntilNextChange: number;
}

// ============================================================================
// Like System Types (V3)
// ============================================================================

export type LikeTargetType = 'coffee_log' | 'list' | 'photo' | 'cafe';

export interface Like {
    id: string;
    user_id: string;
    target_id: string;
    target_type: LikeTargetType;
    created_at: string;
}

export interface LikeStatus {
    isLiked: boolean;
    likeCount: number;
}

// ============================================================================
// Public Profile Types (V3)
// ============================================================================

export interface PublicUserProfile {
    user_id: string;
    username: string;
    created_at: string;
    // Future: avatar_url, bio, display_name
}

export interface UserStats {
    totalLogs: number;
    followerCount: number;
    followingCount: number;
}

// ============================================================================
// Follow System Types (V4)
// ============================================================================

export interface FollowRelationship {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface FollowStatus {
    isFollowing: boolean;
}

// ============================================================================
// List System Types (V1)
// ============================================================================

export type ListVisibility = 'private' | 'public';

export interface List {
    id: string;
    owner_id: string;
    title: string;
    description: string | null;
    visibility: ListVisibility;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ListItem {
    id: string;
    list_id: string;
    coffee_log_id: string;
    added_at: string;
}

export interface ListSave {
    user_id: string;
    list_id: string;
    saved_at: string;
}

export interface ListFormData {
    title: string;
    description?: string;
    visibility: ListVisibility;
}

export interface ListWithItems extends List {
    items: ListItem[];
    logs?: CoffeeLog[]; // Hydrated logs
    owner?: { username: string };
    save_count?: number;
    is_saved?: boolean;
    item_count?: number;
}

