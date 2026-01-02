/**
 * Icon System Demo & Examples
 * Showcases all available icons and usage patterns
 */

import { BrandingKitIcon, BrandingKitIconButton, BrandingKitIconSet } from '@/components/ui/BrandingKitIcon';
import { ICON_CATALOG, ICON_METADATA, IconName } from '@/lib/icons';
import { useState } from 'react';

/**
 * Icon Grid - displays all available icons
 */
export function IconGrid() {
  const [selectedSize, setSelectedSize] = useState<24 | 48>(24);
  const [selectedState, setSelectedState] = useState<'active' | 'inactive'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const iconNames = Object.values(ICON_CATALOG);
  const filteredIcons = searchTerm
    ? iconNames.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
    : iconNames;

  return (
    <div style={{ padding: 24 }}>
      <h2>Icon System Gallery</h2>

      {/* Controls */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>Size:</label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(Number(e.target.value) as 24 | 48)}
            style={{ padding: '8px 12px' }}
          >
            <option value={24}>24px</option>
            <option value={48}>48px</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>State:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value as 'active' | 'inactive')}
            style={{ padding: '8px 12px' }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Search:</label>
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', width: '100%' }}
          />
        </div>
      </div>

      {/* Icon Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 16,
        }}
      >
        {filteredIcons.map((iconName) => {
          const metadata = ICON_METADATA[iconName];
          return (
            <div
              key={iconName}
              style={{
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                (e.currentTarget as HTMLElement).style.borderColor = '#ccc';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = '#ddd';
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <BrandingKitIcon name={iconName as IconName} size={selectedSize} state={selectedState} />
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{metadata.label}</div>
                <div style={{ fontSize: 10, color: '#999' }}>{iconName}</div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredIcons.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          No icons found matching "{searchTerm}"
        </div>
      )}

      {/* Stats */}
      <div style={{ marginTop: 32, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <p>
          <strong>{filteredIcons.length}</strong> icon{filteredIcons.length !== 1 ? 's' : ''} shown
          {searchTerm && ` (filtered from ${iconNames.length} total)`}
        </p>
      </div>
    </div>
  );
}

/**
 * Icon Size Comparison
 */
export function IconSizeComparison() {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

  return (
    <div style={{ padding: 24 }}>
      <h2>Icon Size Reference</h2>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
        {sizes.map((size) => (
          <div key={size} style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 8 }}>
              <BrandingKitIcon name="bell" size={size} />
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>{size}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Icon Button States
 */
export function IconButtonStates() {
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <h2>Icon Button States</h2>
      <div style={{ marginBottom: 24 }}>
        <label>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Disabled
        </label>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Enabled</p>
          <BrandingKitIconButton
            name="trash"
            onClick={() => alert('Delete!')}
            tooltip="Delete"
            disabled={false}
          />
        </div>

        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Hover State</p>
          <BrandingKitIconButton
            name="edit"
            onClick={() => alert('Edit!')}
            tooltip="Edit"
            disabled={false}
          />
        </div>

        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Disabled</p>
          <BrandingKitIconButton
            name="lock"
            onClick={() => alert('Locked!')}
            tooltip="Locked"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Icon Usage Patterns
 */
export function UsagePatterns() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Common Usage Patterns</h2>

      {/* Header with Icon */}
      <div style={{ marginBottom: 32 }}>
        <h3>Header with Icon</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <BrandingKitIcon name="dashboard" size="lg" />
          <h3>Dashboard</h3>
        </div>
      </div>

      {/* Status Badge */}
      <div style={{ marginBottom: 32 }}>
        <h3>Status Badges</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: '#f0f8f4', borderRadius: 4 }}>
            <BrandingKitIcon name="check_circle" size="sm" />
            <span>Complete</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: '#fef3e6', borderRadius: 4 }}>
            <BrandingKitIcon name="warning_circle" size="sm" />
            <span>Warning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: '#fef0f0', borderRadius: 4 }}>
            <BrandingKitIcon name="error_circle" size="sm" />
            <span>Error</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ marginBottom: 32 }}>
        <h3>Action Bar</h3>
        <div style={{ display: 'flex', gap: 8, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <BrandingKitIconButton name="refresh" onClick={() => alert('Refresh')} tooltip="Refresh" />
          <BrandingKitIconButton name="filter" onClick={() => alert('Filter')} tooltip="Filter" />
          <BrandingKitIconButton name="search" onClick={() => alert('Search')} tooltip="Search" />
          <div style={{ flex: 1 }} />
          <BrandingKitIconButton name="settings" onClick={() => alert('Settings')} tooltip="Settings" />
        </div>
      </div>

      {/* Icon Set */}
      <div style={{ marginBottom: 32 }}>
        <h3>Icon Sets</h3>
        <BrandingKitIconSet
          icons={['check_circle', 'error_circle', 'warning_circle', 'info']}
          size="md"
          gap={16}
        />
      </div>

      {/* Table with Icons */}
      <div style={{ marginBottom: 32 }}>
        <h3>Table with Icons</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: 12 }}>Action</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Icon</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Send', icon: 'send' },
              { label: 'Receive', icon: 'arrow_left' },
              { label: 'Refresh', icon: 'refresh' },
              { label: 'Download', icon: 'download' },
              { label: 'Settings', icon: 'settings' },
            ].map((row) => (
              <tr key={row.label} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{row.label}</td>
                <td style={{ padding: 12 }}>
                  <BrandingKitIcon name={row.icon as IconName} size="md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Main Demo Page
 */
export default function IconSystemDemo() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'sizes' | 'buttons' | 'patterns'>('gallery');

  return (
    <div>
      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #ddd', display: 'flex', gap: 0 }}>
        {(['gallery', 'sizes', 'buttons', 'patterns'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#235393' : 'transparent',
              color: activeTab === tab ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'gallery' && <IconGrid />}
      {activeTab === 'sizes' && <IconSizeComparison />}
      {activeTab === 'buttons' && <IconButtonStates />}
      {activeTab === 'patterns' && <UsagePatterns />}
    </div>
  );
}
