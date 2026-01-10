/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - SMART ADDRESS INPUT COMPONENT
 * Google Places Autocomplete with parsed address components
 * ============================================================================
 *
 * Features:
 * - Google Places Autocomplete integration
 * - Auto-parses address into street, city, state, zip, country
 * - Manual entry fallback mode
 * - US address validation
 * - WCAG 2.2 AA compliant
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'
import Input from './Input'
import Icon from './Icon'

// =============================================================================
// TYPES
// =============================================================================

export interface ParsedAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
  formatted: string
}

export interface SmartAddressInputProps {
  /** Label for the input */
  label?: string
  /** Current parsed address value */
  value?: ParsedAddress
  /** Callback when address changes */
  onChange?: (address: ParsedAddress) => void
  /** Placeholder text */
  placeholder?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Required field */
  required?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Allow manual entry mode */
  allowManualEntry?: boolean
  /** Google Maps API key (optional - falls back to manual if not provided) */
  googleApiKey?: string
  /** Restrict to US addresses only */
  usOnly?: boolean
  /** Additional class names */
  className?: string
}

// =============================================================================
// US STATES DATA
// =============================================================================

const US_STATES: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC'
}

const US_STATE_CODES = Object.values(US_STATES)

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function parseAddressComponents(components: google.maps.GeocoderAddressComponent[]): ParsedAddress {
  let streetNumber = ''
  let route = ''
  let city = ''
  let state = ''
  let zip = ''
  let country = 'US'

  for (const component of components) {
    const types = component.types

    if (types.includes('street_number')) {
      streetNumber = component.long_name
    } else if (types.includes('route')) {
      route = component.long_name
    } else if (types.includes('locality') || types.includes('sublocality')) {
      city = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      state = component.short_name
    } else if (types.includes('postal_code')) {
      zip = component.long_name
    } else if (types.includes('country')) {
      country = component.short_name
    }
  }

  const street = [streetNumber, route].filter(Boolean).join(' ')
  const formatted = [street, city, state, zip].filter(Boolean).join(', ')

  return { street, city, state, zip, country, formatted }
}

function formatAddressForDisplay(address: ParsedAddress): string {
  if (address.formatted) return address.formatted
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ')
}

function isValidUSAddress(address: ParsedAddress): boolean {
  return Boolean(
    address.street &&
    address.city &&
    address.state &&
    US_STATE_CODES.includes(address.state) &&
    address.zip &&
    /^\d{5}(-\d{4})?$/.test(address.zip)
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function SmartAddressInput({
  label,
  value,
  onChange,
  placeholder = 'Start typing an address...',
  error,
  helperText,
  required,
  disabled,
  allowManualEntry = true,
  googleApiKey,
  usOnly = true,
  className,
}: SmartAddressInputProps) {
  const [inputValue, setInputValue] = useState(value?.formatted || '')
  const [isManualMode, setIsManualMode] = useState(false)
  const [manualAddress, setManualAddress] = useState<ParsedAddress>(
    value || { street: '', city: '', state: '', zip: '', country: 'US', formatted: '' }
  )
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load Google Maps API
  useEffect(() => {
    if (!googleApiKey) return

    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsGoogleLoaded(true)
      return
    }

    // Load the script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsGoogleLoaded(true)
    document.head.appendChild(script)

    return () => {
      // Cleanup if component unmounts before script loads
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [googleApiKey])

  // Initialize services when Google is loaded
  useEffect(() => {
    if (!isGoogleLoaded) return

    autocompleteService.current = new google.maps.places.AutocompleteService()

    // Create a dummy div for PlacesService (required by API)
    const dummyDiv = document.createElement('div')
    placesService.current = new google.maps.places.PlacesService(dummyDiv)
  }, [isGoogleLoaded])

  // Sync external value changes
  useEffect(() => {
    if (value) {
      setInputValue(formatAddressForDisplay(value))
      setManualAddress(value)
    }
  }, [value])

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setSuggestions([])
      return
    }

    const request: google.maps.places.AutocompletionRequest = {
      input,
      types: ['address'],
      componentRestrictions: usOnly ? { country: 'us' } : undefined,
    }

    autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
      }
    })
  }, [usOnly])

  // Handle selecting a suggestion
  const handleSelectSuggestion = useCallback((prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return

    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ['address_components', 'formatted_address'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
          const parsed = parseAddressComponents(place.address_components)
          parsed.formatted = place.formatted_address || formatAddressForDisplay(parsed)

          setInputValue(parsed.formatted)
          setManualAddress(parsed)
          setSuggestions([])
          setShowSuggestions(false)
          setSelectedIndex(-1)

          onChange?.(parsed)
        }
      }
    )
  }, [onChange])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (isGoogleLoaded && !isManualMode) {
      fetchSuggestions(newValue)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle manual address field changes
  const handleManualChange = (field: keyof ParsedAddress, fieldValue: string) => {
    const updated = { ...manualAddress, [field]: fieldValue }
    updated.formatted = formatAddressForDisplay(updated)
    setManualAddress(updated)
    setInputValue(updated.formatted)
    onChange?.(updated)
  }

  // Toggle manual mode
  const toggleManualMode = () => {
    setIsManualMode(!isManualMode)
    setShowSuggestions(false)
    setSuggestions([])
  }

  // Render manual entry form
  if (isManualMode) {
    return (
      <div className={cn('space-y-3', className)}>
        {label && (
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[var(--ss-text)]">
              {label}
              {required && <span className="ml-0.5 text-[var(--color-status-danger-text)]">*</span>}
            </label>
            {allowManualEntry && isGoogleLoaded && (
              <button
                type="button"
                onClick={toggleManualMode}
                className="text-xs text-[var(--ss-primary)] hover:underline"
              >
                Use address lookup
              </button>
            )}
          </div>
        )}

        <Input
          label="Street Address"
          value={manualAddress.street}
          onChange={(e) => handleManualChange('street', e.target.value)}
          placeholder="123 Main Street, Suite 100"
          disabled={disabled}
          isRequired={required}
        />

        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-2">
            <Input
              label="City"
              value={manualAddress.city}
              onChange={(e) => handleManualChange('city', e.target.value)}
              placeholder="City"
              disabled={disabled}
              isRequired={required}
            />
          </div>
          <div className="col-span-2">
            <label className="mb-[var(--spacing-1-5)] block text-sm font-medium text-[var(--color-text-secondary)]">
              State {required && <span className="text-[var(--color-status-danger-text)]">*</span>}
            </label>
            <select
              value={manualAddress.state}
              onChange={(e) => handleManualChange('state', e.target.value)}
              disabled={disabled}
              className={cn(
                'w-full h-[var(--component-height-md)]',
                'px-[var(--spacing-3)] text-[var(--font-size-base)]',
                'bg-[var(--color-bg-primary)]',
                'text-[var(--color-text-primary)]',
                'border border-[var(--color-border-primary)] rounded-[var(--radius-sm)]',
                'focus:outline-none focus:ring-2 focus:ring-opacity-20',
                'focus:border-[var(--color-border-focus)] focus:ring-[var(--color-border-focus)]',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              <option value="">Select State</option>
              {Object.entries(US_STATES).map(([name, code]) => (
                <option key={code} value={code}>{code} - {name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <Input
              label="ZIP Code"
              value={manualAddress.zip}
              onChange={(e) => handleManualChange('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="12345"
              maxLength={5}
              disabled={disabled}
              isRequired={required}
            />
          </div>
        </div>

        {error && (
          <p className="text-[var(--font-size-xs)] text-[var(--color-status-danger-text)]" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    )
  }

  // Render autocomplete input
  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <div className="flex items-center justify-between mb-[var(--spacing-1-5)]">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
            {required && <span className="ml-0.5 text-[var(--color-status-danger-text)]">*</span>}
          </label>
          {allowManualEntry && (
            <button
              type="button"
              onClick={toggleManualMode}
              className="text-xs text-[var(--ss-primary)] hover:underline"
            >
              Enter manually
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="address-suggestions"
          className={cn(
            'w-full h-[var(--component-height-md)]',
            'px-[var(--spacing-3)] pr-10 text-[var(--font-size-base)]',
            'bg-[var(--color-bg-primary)]',
            'text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'border rounded-[var(--radius-sm)]',
            'transition-colors duration-[var(--duration-fast)]',
            'focus:outline-none focus:ring-2 focus:ring-opacity-20',
            'disabled:bg-[var(--color-bg-secondary)] disabled:opacity-60 disabled:cursor-not-allowed',
            error
              ? 'border-[var(--color-status-danger-border)] focus:border-[var(--color-status-danger-border)] focus:ring-[var(--color-status-danger-icon)]'
              : 'border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)] focus:border-[var(--color-border-focus)] focus:ring-[var(--color-border-focus)]'
          )}
        />

        {/* Verified badge or search icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          {value && isValidUSAddress(value) ? (
            <Icon name="check_circle" className="w-4 h-4 text-[var(--ss-success)]" />
          ) : (
            <Icon name="search" className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          )}
        </span>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="address-suggestions"
          role="listbox"
          className={cn(
            'absolute z-50 w-full mt-1',
            'bg-[var(--ss-surface)] border border-[var(--ss-border)]',
            'rounded-[var(--radius-sm)] shadow-lg',
            'max-h-60 overflow-auto'
          )}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'px-3 py-2 cursor-pointer text-sm',
                'transition-colors duration-[var(--duration-fast)]',
                index === selectedIndex
                  ? 'bg-[var(--ss-primary)]/10 text-[var(--ss-text)]'
                  : 'text-[var(--ss-text-muted)] hover:bg-[var(--ss-surface-alt)]'
              )}
            >
              <div className="flex items-start gap-2">
                <Icon name="ecommerce" className="w-4 h-4 mt-0.5 text-[var(--ss-primary)] flex-shrink-0" />
                <div>
                  <span className="font-medium text-[var(--ss-text)]">
                    {suggestion.structured_formatting.main_text}
                  </span>
                  <span className="text-[var(--ss-text-muted)] ml-1">
                    {suggestion.structured_formatting.secondary_text}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No Google API - show manual entry prompt */}
      {!isGoogleLoaded && !googleApiKey && inputValue.length > 2 && (
        <div className="mt-2 p-2 rounded bg-[var(--ss-surface-alt)] border border-[var(--ss-border)]">
          <p className="text-xs text-[var(--ss-text-muted)]">
            Address autocomplete unavailable.{' '}
            <button
              type="button"
              onClick={toggleManualMode}
              className="text-[var(--ss-primary)] hover:underline"
            >
              Enter address manually
            </button>
          </p>
        </div>
      )}

      {error && (
        <p className="mt-[var(--spacing-1-5)] text-[var(--font-size-xs)] text-[var(--color-status-danger-text)]" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-[var(--spacing-1-5)] text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
          {helperText}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// TYPE DECLARATIONS FOR GOOGLE MAPS
// =============================================================================

declare global {
  interface Window {
    google?: typeof google
  }
}

export { SmartAddressInput }
export type { ParsedAddress as SmartAddressValue }
