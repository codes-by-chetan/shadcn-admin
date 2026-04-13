import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { palettes, type Palette } from '@/config/theme-palettes'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'>
type CustomPalette = {
  light: {
    primary: string
    secondary: string
    accent: string
  }
  dark: {
    primary: string
    secondary: string
    accent: string
  }
}

const DEFAULT_THEME = 'system'
const THEME_COOKIE_NAME = 'vite-ui-theme'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const DEFAULT_PALETTE: Palette = 'default'
const PALETTE_COOKIE_NAME = 'vite-ui-palette'
const PALETTE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const CUSTOM_PALETTE_COOKIE_NAME = 'vite-ui-custom-palette'
const CUSTOM_PALETTE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const DEFAULT_CUSTOM_PALETTE: CustomPalette = {
  light: {
    primary: '#0f172a',
    secondary: '#cbd5e1',
    accent: '#e2e8f0',
  },
  dark: {
    primary: '#e2e8f0',
    secondary: '#334155',
    accent: '#1e293b',
  },
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  customPalette: CustomPalette
  defaultPalette: Palette
  defaultTheme: Theme
  palette: Palette
  resolvedTheme: ResolvedTheme
  resetCustomPalette: () => void
  resetPalette: () => void
  theme: Theme
  setCustomPalette: (palette: CustomPalette) => void
  setPalette: (palette: Palette) => void
  setTheme: (theme: Theme) => void
  resetTheme: () => void
}

const initialState: ThemeProviderState = {
  customPalette: DEFAULT_CUSTOM_PALETTE,
  defaultPalette: DEFAULT_PALETTE,
  defaultTheme: DEFAULT_THEME,
  palette: DEFAULT_PALETTE,
  resolvedTheme: 'light',
  resetCustomPalette: () => null,
  resetPalette: () => null,
  theme: DEFAULT_THEME,
  setCustomPalette: () => null,
  setPalette: () => null,
  setTheme: () => null,
  resetTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

function getAccessibleForeground(hex: string) {
  const normalized = hex.replace('#', '')
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized

  const r = parseInt(fullHex.slice(0, 2), 16)
  const g = parseInt(fullHex.slice(2, 4), 16)
  const b = parseInt(fullHex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.6 ? '#0f172a' : '#f8fafc'
}

function parseCustomPalette(cookie?: string): CustomPalette {
  if (!cookie) return DEFAULT_CUSTOM_PALETTE

  try {
    const parsed = JSON.parse(decodeURIComponent(cookie)) as Partial<CustomPalette>
    return {
      light: {
        primary:
          parsed.light?.primary ?? DEFAULT_CUSTOM_PALETTE.light.primary,
        secondary:
          parsed.light?.secondary ?? DEFAULT_CUSTOM_PALETTE.light.secondary,
        accent: parsed.light?.accent ?? DEFAULT_CUSTOM_PALETTE.light.accent,
      },
      dark: {
        primary: parsed.dark?.primary ?? DEFAULT_CUSTOM_PALETTE.dark.primary,
        secondary:
          parsed.dark?.secondary ?? DEFAULT_CUSTOM_PALETTE.dark.secondary,
        accent: parsed.dark?.accent ?? DEFAULT_CUSTOM_PALETTE.dark.accent,
      },
    }
  } catch {
    return DEFAULT_CUSTOM_PALETTE
  }
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_COOKIE_NAME,
  ...props
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(
    () => (getCookie(storageKey) as Theme) || defaultTheme
  )
  const [palette, _setPalette] = useState<Palette>(() => {
    const savedPalette = getCookie(PALETTE_COOKIE_NAME) as Palette | undefined
    return palettes.includes(savedPalette as Palette)
      ? (savedPalette as Palette)
      : DEFAULT_PALETTE
  })
  const [customPalette, _setCustomPalette] = useState<CustomPalette>(() =>
    parseCustomPalette(getCookie(CUSTOM_PALETTE_COOKIE_NAME))
  )

  // Optimized: Memoize the resolved theme calculation to prevent unnecessary re-computations
  const resolvedTheme = useMemo((): ResolvedTheme => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return theme as ResolvedTheme
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (currentResolvedTheme: ResolvedTheme) => {
      root.classList.remove('light', 'dark') // Remove existing theme classes
      root.classList.add(currentResolvedTheme) // Add the new theme class
    }

    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        applyTheme(systemTheme)
      }
    }

    applyTheme(resolvedTheme)

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, resolvedTheme])

  useEffect(() => {
    const root = window.document.documentElement
    root.dataset.palette = palette

    if (palette !== 'custom') {
      ;[
        '--primary',
        '--primary-foreground',
        '--secondary',
        '--secondary-foreground',
        '--accent',
        '--accent-foreground',
        '--ring',
        '--chart-1',
        '--chart-2',
        '--chart-3',
        '--sidebar-primary',
        '--sidebar-primary-foreground',
        '--sidebar-accent',
        '--sidebar-accent-foreground',
      ].forEach((variable) => root.style.removeProperty(variable))
      return
    }

    const current =
      resolvedTheme === 'dark' ? customPalette.dark : customPalette.light

    root.style.setProperty('--primary', current.primary)
    root.style.setProperty(
      '--primary-foreground',
      getAccessibleForeground(current.primary)
    )
    root.style.setProperty('--secondary', current.secondary)
    root.style.setProperty(
      '--secondary-foreground',
      getAccessibleForeground(current.secondary)
    )
    root.style.setProperty('--accent', current.accent)
    root.style.setProperty(
      '--accent-foreground',
      getAccessibleForeground(current.accent)
    )
    root.style.setProperty('--ring', current.primary)
    root.style.setProperty('--chart-1', current.primary)
    root.style.setProperty('--chart-2', current.secondary)
    root.style.setProperty('--chart-3', current.accent)
    root.style.setProperty('--sidebar-primary', current.primary)
    root.style.setProperty(
      '--sidebar-primary-foreground',
      getAccessibleForeground(current.primary)
    )
    root.style.setProperty('--sidebar-accent', current.accent)
    root.style.setProperty(
      '--sidebar-accent-foreground',
      getAccessibleForeground(current.accent)
    )
  }, [customPalette, palette, resolvedTheme])

  const setTheme = (theme: Theme) => {
    setCookie(storageKey, theme, THEME_COOKIE_MAX_AGE)
    _setTheme(theme)
  }

  const setPalette = (palette: Palette) => {
    setCookie(PALETTE_COOKIE_NAME, palette, PALETTE_COOKIE_MAX_AGE)
    _setPalette(palette)
  }

  const setCustomPalette = (palette: CustomPalette) => {
    setCookie(
      CUSTOM_PALETTE_COOKIE_NAME,
      encodeURIComponent(JSON.stringify(palette)),
      CUSTOM_PALETTE_COOKIE_MAX_AGE
    )
    _setCustomPalette(palette)
  }

  const resetTheme = () => {
    removeCookie(storageKey)
    _setTheme(DEFAULT_THEME)
  }

  const resetPalette = () => {
    removeCookie(PALETTE_COOKIE_NAME)
    _setPalette(DEFAULT_PALETTE)
  }

  const resetCustomPalette = () => {
    removeCookie(CUSTOM_PALETTE_COOKIE_NAME)
    _setCustomPalette(DEFAULT_CUSTOM_PALETTE)
  }

  const contextValue = {
    customPalette,
    defaultPalette: DEFAULT_PALETTE,
    defaultTheme,
    palette,
    resolvedTheme,
    resetCustomPalette,
    resetPalette,
    resetTheme,
    theme,
    setCustomPalette,
    setPalette,
    setTheme,
  }

  return (
    <ThemeContext value={contextValue} {...props}>
      {children}
    </ThemeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
