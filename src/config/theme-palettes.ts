export const palettes = [
  'default',
  'ocean',
  'forest',
  'sunset',
  'rose',
  'custom',
] as const

export type Palette = (typeof palettes)[number]

export const themePalettes: Array<{
  value: Palette
  label: string
  description: string
  preview: [string, string, string]
}> = [
  {
    value: 'default',
    label: 'Slate',
    description: 'Neutral slate accents',
    preview: ['bg-slate-950', 'bg-slate-400', 'bg-slate-200'],
  },
  {
    value: 'ocean',
    label: 'Ocean',
    description: 'Cool blue-cyan accents',
    preview: ['bg-sky-600', 'bg-cyan-400', 'bg-sky-200'],
  },
  {
    value: 'forest',
    label: 'Forest',
    description: 'Fresh green accents',
    preview: ['bg-emerald-600', 'bg-lime-400', 'bg-emerald-200'],
  },
  {
    value: 'sunset',
    label: 'Sunset',
    description: 'Warm amber-orange accents',
    preview: ['bg-amber-500', 'bg-orange-400', 'bg-amber-200'],
  },
  {
    value: 'rose',
    label: 'Rose',
    description: 'Bold rose-red accents',
    preview: ['bg-rose-600', 'bg-pink-400', 'bg-rose-200'],
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Build your own light and dark palette',
    preview: ['bg-primary', 'bg-secondary', 'bg-accent'],
  },
]
