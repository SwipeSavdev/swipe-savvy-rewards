/**
 * Icon components using SwipeSavvy branding kit
 * Extends the existing icon system with PNG icons from the visual assets
 */

import { getIconPath, ICON_METADATA, ICON_SIZES, IconName, IconSize, IconState, IconTheme } from '@/lib/icons';
import React, { CSSProperties, useMemo } from 'react';

interface BrandingKitIconProps {
  /**
   * Icon name from the catalog
   */
  name: IconName;

  /**
   * Icon size: xs (16), sm (20), md (24), lg (32), xl (48), 2xl (64)
   * @default 'md'
   */
  size?: IconSize | number;

  /**
   * Icon state: active or inactive
   * @default 'active'
   */
  state?: IconState;

  /**
   * Theme variant: light or dark
   * For auto-detection, use undefined
   * @default undefined (auto-detect from document theme)
   */
  theme?: IconTheme;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;

  /**
   * Alt text for accessibility
   */
  alt?: string;

  /**
   * Aria label for screen readers
   */
  ariaLabel?: string;

  /**
   * Icon title for hover tooltip
   */
  title?: string;

  /**
   * Click handler
   */
  onClick?: (_e: React.MouseEvent<HTMLImageElement>) => void;

  /**
   * Make icon focusable (for interactive icons)
   */
  focusable?: boolean;

  /**
   * Tab index
   */
  tabIndex?: number;
}

/**
 * BrandingKitIcon component - uses PNG icons from SwipeSavvy branding kit
 *
 * @example
 * <BrandingKitIcon name="bell" size="md" />
 * <BrandingKitIcon name="check_circle" size="lg" state="active" />
 * <BrandingKitIcon name="dashboard" size={32} theme="dark" />
 */
export const BrandingKitIcon = React.forwardRef<HTMLImageElement, BrandingKitIconProps>(
  (
    {
      name,
      size = 'md',
      state = 'active',
      theme,
      className = '',
      style,
      alt,
      ariaLabel,
      title,
      onClick,
      focusable = false,
      tabIndex,
    },
    ref
  ) => {
    // Auto-detect theme from document if not provided
    const detectedTheme = useMemo(() => {
      if (theme) return theme;
      if (typeof document !== 'undefined') {
        const dataTheme = document.documentElement.getAttribute('data-theme');
        return (dataTheme as IconTheme) || 'light';
      }
      return 'light';
    }, [theme]);

    // Calculate pixel size - use 24 for small, 48 for large
    const iconFileSize = useMemo(() => {
      const pxSize = typeof size === 'number' ? size : ICON_SIZES[size];
      return pxSize <= 24 ? 24 : 48;
    }, [size]);

    const pixelSize = useMemo(() => {
      return typeof size === 'number' ? size : ICON_SIZES[size];
    }, [size]);

    // Get icon path
    const srcPath = useMemo(
      () => getIconPath(name, iconFileSize as 24 | 48, state, detectedTheme),
      [name, iconFileSize, state, detectedTheme]
    );

    // Generate alt text
    const computedAlt = useMemo(() => {
      if (alt) return alt;
      const metadata = ICON_METADATA[name];
      return metadata?.label || name.replace(/_/g, ' ').toLowerCase();
    }, [alt, name]);

    // Merge styles
    const computedStyle: CSSProperties = {
      width: `${pixelSize}px`,
      height: `${pixelSize}px`,
      display: 'inline-block',
      flexShrink: 0,
      ...style,
    };

    return (
      <img
        ref={ref}
        src={srcPath}
        alt={computedAlt}
        aria-label={ariaLabel || computedAlt}
        title={title || computedAlt}
        className={`branding-kit-icon branding-kit-icon--${name} ${
          state === 'inactive' ? 'branding-kit-icon--inactive' : ''
        } ${className}`.trim()}
        style={computedStyle}
        onClick={onClick}
        tabIndex={focusable ? tabIndex : undefined}
        onKeyDown={
          focusable && onClick
            ? (e: React.KeyboardEvent<HTMLImageElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(e as any);
                }
              }
            : undefined
        }
      />
    );
  }
);

BrandingKitIcon.displayName = 'BrandingKitIcon';

/**
 * Interactive icon button using branding kit icons
 */
interface BrandingKitIconButtonProps extends Omit<BrandingKitIconProps, 'focusable'> {
  /**
   * Button click handler
   */
  onClick: (_e: React.MouseEvent<HTMLImageElement>) => void;

  /**
   * Tooltip text
   */
  tooltip?: string;

  /**
   * Button is disabled
   */
  disabled?: boolean;

  /**
   * Padding around icon
   */
  padding?: number;
}

/**
 * Interactive icon button component
 */
export const BrandingKitIconButton = React.forwardRef<HTMLDivElement, BrandingKitIconButtonProps>(
  (
    { onClick, tooltip, disabled = false, className = '', padding = 8, ...iconProps },
    ref
  ) => {
    const buttonClassName = `
      branding-kit-icon-button
      ${disabled ? 'branding-kit-icon-button--disabled' : 'branding-kit-icon-button--enabled'}
      ${className}
    `.trim();

    return (
      <div
        ref={ref}
        className={buttonClassName}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${padding}px`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          borderRadius: '4px',
          transition: 'background-color 0.2s ease',
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={(e: any) => !disabled && onClick(e)}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(e as any);
          }
        }}
        title={tooltip}
        onMouseEnter={(e) => {
          if (!disabled) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        <BrandingKitIcon {...iconProps} focusable={false} />
      </div>
    );
  }
);

BrandingKitIconButton.displayName = 'BrandingKitIconButton';

/**
 * Icon set - displays multiple related icons
 */
interface BrandingKitIconSetProps {
  /**
   * Array of icon names
   */
  icons: IconName[];

  /**
   * Icon size
   */
  size?: IconSize | number;

  /**
   * Gap between icons
   */
  gap?: number;

  /**
   * Vertical spacing
   */
  direction?: 'row' | 'column';

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const BrandingKitIconSet: React.FC<BrandingKitIconSetProps> = ({
  icons,
  size = 'md',
  gap = 8,
  direction = 'row',
  className = '',
}) => {
  return (
    <div
      className={`branding-kit-icon-set branding-kit-icon-set--${direction} ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: direction === 'column' ? 'column' : 'row',
        gap: `${gap}px`,
        alignItems: direction === 'column' ? 'flex-start' : 'center',
      }}
    >
      {icons.map((iconName) => (
        <BrandingKitIcon key={iconName} name={iconName} size={size} />
      ))}
    </div>
  );
};

BrandingKitIconSet.displayName = 'BrandingKitIconSet';
