/**
 * SwipeSavvy Icon Library
 * Centralized icon management from the branding kit
 */

// Icon sizes (in pixels)
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// Icon states
export type IconState = 'active' | 'inactive';

// Theme variants
export type IconTheme = 'light' | 'dark';

/**
 * Icon catalog - all available icons from the branding kit
 * Icons are available in 24px and 48px sizes
 */
export const ICON_CATALOG = {
  // Navigation
  bank: 'bank',
  bell: 'bell',
  calendar: 'calendar',
  chart_bar: 'chart_bar',
  chart_line: 'chart_line',
  chat: 'chat',
  check: 'check',
  check_circle: 'check_circle',
  chevron_down: 'chevron_down',
  chevron_left: 'chevron_left',
  chevron_right: 'chevron_right',
  chevron_up: 'chevron_up',
  close: 'close',
  credit_card: 'credit_card',
  dashboard: 'dashboard',
  download: 'download',
  edit: 'edit',
  envelope: 'envelope',
  error_circle: 'error_circle',
  flag: 'flag',
  gear: 'gear',
  globe: 'globe',
  help_circle: 'help_circle',
  home: 'home',
  lock: 'lock',
  logout: 'logout',
  menu: 'menu',
  message: 'message',
  minus_circle: 'minus_circle',
  mobile: 'mobile',
  paperclip: 'paperclip',
  paste: 'paste',
  phone: 'phone',
  plus: 'plus',
  plus_circle: 'plus_circle',
  refresh: 'refresh',
  search: 'search',
  send: 'send',
  settings: 'settings',
  shield: 'shield',
  star: 'star',
  trash: 'trash',
  upload: 'upload',
  user: 'user',
  users: 'users',
  warning_circle: 'warning_circle',
  wallet: 'wallet',
  X: 'X',

  // Status indicators
  check_thick: 'check_thick',
  circle: 'circle',
  circle_filled: 'circle_filled',
  dash: 'dash',
  minus: 'minus',

  // Financial/Transaction specific
  arrow_down: 'arrow_down',
  arrow_left: 'arrow_left',
  arrow_right: 'arrow_right',
  arrow_up: 'arrow_up',
  trending_down: 'trending_down',
  trending_up: 'trending_up',

  // Actions
  copy: 'copy',
  eye: 'eye',
  eye_off: 'eye_off',
  filter: 'filter',
  link: 'link',
  more_horizontal: 'more_horizontal',
  more_vertical: 'more_vertical',
  print: 'print',
  share: 'share',
  sort: 'sort',
  undo: 'undo',

  // System/UI
  alert_circle: 'alert_circle',
  hash: 'hash',
  home_alt: 'home_alt',
  inbox: 'inbox',
  info: 'info',
  list: 'list',
  maximize: 'maximize',
  minimize: 'minimize',
  radio_checked: 'radio_checked',
  radio_unchecked: 'radio_unchecked',
  shield_alert: 'shield_alert',
  sun: 'sun',
  toggle_off: 'toggle_off',
  toggle_on: 'toggle_on',

  // Branding
  logo: 'logo',
  logo_symbol: 'logo_symbol',
} as const;

export type IconName = typeof ICON_CATALOG[keyof typeof ICON_CATALOG];

/**
 * Get the path to an icon from the branding kit
 * @param name - Icon name from ICON_CATALOG
 * @param size - Icon size (24 or 48)
 * @param state - Icon state (active or inactive)
 * @param theme - Theme variant (light or dark)
 * @returns Path to the icon file
 */
export function getIconPath(
  name: IconName,
  size: 24 | 48 = 24,
  state: IconState = 'active',
  theme: IconTheme = 'light'
): string {
  const themeSuffix = theme === 'dark' ? 'dark' : 'light';
  const stateSuffix = state === 'active' ? 'active' : 'inactive';
  const fileName = `${name}_${size}.png`;

  return `/icons/${themeSuffix}_${stateSuffix}/${fileName}`;
}

/**
 * Icon metadata for different use cases
 */
export const ICON_METADATA: Record<IconName, { label: string; category: string; sizes: (24 | 48)[] }> = {
  // Navigation
  bank: { label: 'Bank', category: 'navigation', sizes: [24, 48] },
  bell: { label: 'Notifications', category: 'navigation', sizes: [24, 48] },
  calendar: { label: 'Calendar', category: 'navigation', sizes: [24, 48] },
  chart_bar: { label: 'Bar Chart', category: 'navigation', sizes: [24, 48] },
  chart_line: { label: 'Line Chart', category: 'navigation', sizes: [24, 48] },
  chat: { label: 'Chat', category: 'navigation', sizes: [24, 48] },
  check: { label: 'Check', category: 'status', sizes: [24, 48] },
  check_circle: { label: 'Check Circle', category: 'status', sizes: [24, 48] },
  chevron_down: { label: 'Chevron Down', category: 'navigation', sizes: [24, 48] },
  chevron_left: { label: 'Chevron Left', category: 'navigation', sizes: [24, 48] },
  chevron_right: { label: 'Chevron Right', category: 'navigation', sizes: [24, 48] },
  chevron_up: { label: 'Chevron Up', category: 'navigation', sizes: [24, 48] },
  close: { label: 'Close', category: 'action', sizes: [24, 48] },
  credit_card: { label: 'Credit Card', category: 'financial', sizes: [24, 48] },
  dashboard: { label: 'Dashboard', category: 'navigation', sizes: [24, 48] },
  download: { label: 'Download', category: 'action', sizes: [24, 48] },
  edit: { label: 'Edit', category: 'action', sizes: [24, 48] },
  envelope: { label: 'Envelope', category: 'communication', sizes: [24, 48] },
  error_circle: { label: 'Error', category: 'status', sizes: [24, 48] },
  flag: { label: 'Flag', category: 'action', sizes: [24, 48] },
  gear: { label: 'Settings', category: 'navigation', sizes: [24, 48] },
  globe: { label: 'Globe', category: 'navigation', sizes: [24, 48] },
  help_circle: { label: 'Help', category: 'status', sizes: [24, 48] },
  home: { label: 'Home', category: 'navigation', sizes: [24, 48] },
  lock: { label: 'Lock', category: 'security', sizes: [24, 48] },
  logout: { label: 'Logout', category: 'action', sizes: [24, 48] },
  menu: { label: 'Menu', category: 'navigation', sizes: [24, 48] },
  message: { label: 'Message', category: 'communication', sizes: [24, 48] },
  minus_circle: { label: 'Minus Circle', category: 'status', sizes: [24, 48] },
  mobile: { label: 'Mobile', category: 'device', sizes: [24, 48] },
  paperclip: { label: 'Attachment', category: 'action', sizes: [24, 48] },
  paste: { label: 'Paste', category: 'action', sizes: [24, 48] },
  phone: { label: 'Phone', category: 'communication', sizes: [24, 48] },
  plus: { label: 'Plus', category: 'action', sizes: [24, 48] },
  plus_circle: { label: 'Plus Circle', category: 'action', sizes: [24, 48] },
  refresh: { label: 'Refresh', category: 'action', sizes: [24, 48] },
  search: { label: 'Search', category: 'action', sizes: [24, 48] },
  send: { label: 'Send', category: 'action', sizes: [24, 48] },
  settings: { label: 'Settings', category: 'navigation', sizes: [24, 48] },
  shield: { label: 'Shield', category: 'security', sizes: [24, 48] },
  star: { label: 'Star', category: 'action', sizes: [24, 48] },
  trash: { label: 'Delete', category: 'action', sizes: [24, 48] },
  upload: { label: 'Upload', category: 'action', sizes: [24, 48] },
  user: { label: 'User', category: 'navigation', sizes: [24, 48] },
  users: { label: 'Users', category: 'navigation', sizes: [24, 48] },
  warning_circle: { label: 'Warning', category: 'status', sizes: [24, 48] },
  wallet: { label: 'Wallet', category: 'financial', sizes: [24, 48] },
  X: { label: 'Close', category: 'action', sizes: [24, 48] },

  // Status
  check_thick: { label: 'Check Thick', category: 'status', sizes: [24, 48] },
  circle: { label: 'Circle', category: 'status', sizes: [24, 48] },
  circle_filled: { label: 'Circle Filled', category: 'status', sizes: [24, 48] },
  dash: { label: 'Dash', category: 'status', sizes: [24, 48] },
  minus: { label: 'Minus', category: 'status', sizes: [24, 48] },

  // Financial
  arrow_down: { label: 'Arrow Down', category: 'financial', sizes: [24, 48] },
  arrow_left: { label: 'Arrow Left', category: 'financial', sizes: [24, 48] },
  arrow_right: { label: 'Arrow Right', category: 'financial', sizes: [24, 48] },
  arrow_up: { label: 'Arrow Up', category: 'financial', sizes: [24, 48] },
  trending_down: { label: 'Trending Down', category: 'financial', sizes: [24, 48] },
  trending_up: { label: 'Trending Up', category: 'financial', sizes: [24, 48] },

  // UI
  copy: { label: 'Copy', category: 'action', sizes: [24, 48] },
  eye: { label: 'Visibility', category: 'action', sizes: [24, 48] },
  eye_off: { label: 'Hide', category: 'action', sizes: [24, 48] },
  filter: { label: 'Filter', category: 'action', sizes: [24, 48] },
  link: { label: 'Link', category: 'action', sizes: [24, 48] },
  more_horizontal: { label: 'More', category: 'action', sizes: [24, 48] },
  more_vertical: { label: 'More', category: 'action', sizes: [24, 48] },
  print: { label: 'Print', category: 'action', sizes: [24, 48] },
  share: { label: 'Share', category: 'action', sizes: [24, 48] },
  sort: { label: 'Sort', category: 'action', sizes: [24, 48] },
  undo: { label: 'Undo', category: 'action', sizes: [24, 48] },

  // System
  alert_circle: { label: 'Alert', category: 'status', sizes: [24, 48] },
  hash: { label: 'Hash', category: 'ui', sizes: [24, 48] },
  home_alt: { label: 'Home Alt', category: 'navigation', sizes: [24, 48] },
  inbox: { label: 'Inbox', category: 'navigation', sizes: [24, 48] },
  info: { label: 'Info', category: 'status', sizes: [24, 48] },
  list: { label: 'List', category: 'action', sizes: [24, 48] },
  maximize: { label: 'Maximize', category: 'action', sizes: [24, 48] },
  minimize: { label: 'Minimize', category: 'action', sizes: [24, 48] },
  radio_checked: { label: 'Radio Checked', category: 'ui', sizes: [24, 48] },
  radio_unchecked: { label: 'Radio Unchecked', category: 'ui', sizes: [24, 48] },
  shield_alert: { label: 'Shield Alert', category: 'security', sizes: [24, 48] },
  sun: { label: 'Sun', category: 'ui', sizes: [24, 48] },
  toggle_off: { label: 'Toggle Off', category: 'ui', sizes: [24, 48] },
  toggle_on: { label: 'Toggle On', category: 'ui', sizes: [24, 48] },

  // Branding
  logo: { label: 'Logo', category: 'branding', sizes: [24, 48] },
  logo_symbol: { label: 'Logo Symbol', category: 'branding', sizes: [24, 48] },
};
