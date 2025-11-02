/**
 * User avatar component
 * Displays user profile picture with fallback to initials
 */

'use client';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({
  avatarUrl,
  name,
  email,
  size = 'md',
  className = ''
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg'
  };

  // Get initials from name or email
  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name || email || 'User'}
          className="h-full w-full rounded-full object-cover ring-2 ring-white dark:ring-neutral-700 shadow-soft"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-full w-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                      flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-neutral-700 shadow-soft">
          {getInitials()}
        </div>
      )}
    </div>
  );
}
