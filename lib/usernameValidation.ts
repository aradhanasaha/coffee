export const USERNAME_REGEX = /^(?!_)(?!.*_$)[a-z0-9_]{3,20}$/;

export const RESERVED_USERNAMES = [
    'admin',
    'support',
    'coffee',
    'root',
    'system',
];

export function validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username) {
        return { isValid: false, error: 'Username is required' };
    }

    if (username.length < 3 || username.length > 20) {
        return { isValid: false, error: 'Username must be between 3 and 20 characters' };
    }

    if (!USERNAME_REGEX.test(username)) {
        return { isValid: false, error: 'Username can only contain lowercase letters, numbers, and underscores, and cannot start or end with an underscore' };
    }

    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
        return { isValid: false, error: 'This username is reserved' };
    }

    return { isValid: true };
}
