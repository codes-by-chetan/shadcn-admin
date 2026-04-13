import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation } from '@tanstack/react-router'
import { fonts } from '@/config/fonts'
import { palettes, themePalettes } from '@/config/theme-palettes'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const hexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, 'Use a valid hex color like #2563eb')

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  font: z.enum(fonts),
  palette: z.enum(palettes),
  customPalette: z.object({
    light: z.object({
      primary: hexColorSchema,
      secondary: hexColorSchema,
      accent: hexColorSchema,
    }),
    dark: z.object({
      primary: hexColorSchema,
      secondary: hexColorSchema,
      accent: hexColorSchema,
    }),
  }),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const hash = useLocation({ select: (location) => location.hash })
  const { font, setFont } = useFont()
  const {
    customPalette,
    palette,
    setCustomPalette,
    setPalette,
    theme,
    setTheme,
  } = useTheme()

  const defaultValues: Partial<AppearanceFormValues> = {
    theme,
    font,
    palette,
    customPalette,
  }

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset({ customPalette, font, palette, theme })
  }, [customPalette, font, form, palette, theme])

  useEffect(() => {
    if (hash !== '#custom-palette') return

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById('custom-palette')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash])

  function onSubmit(data: AppearanceFormValues) {
    if (data.font != font) setFont(data.font)
    if (data.palette != palette) setPalette(data.palette)
    if (data.theme != theme) setTheme(data.theme)
    if (JSON.stringify(data.customPalette) !== JSON.stringify(customPalette)) {
      setCustomPalette(data.customPalette)
    }

    showSubmittedData(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='font'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font</FormLabel>
              <div className='relative w-max'>
                <FormControl>
                  <select
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-[200px] appearance-none font-normal capitalize',
                      'dark:bg-background dark:hover:bg-background'
                    )}
                    {...field}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <ChevronDownIcon className='absolute end-3 top-2.5 h-4 w-4 opacity-50' />
              </div>
              <FormDescription className='font-manrope'>
                Set the font you want to use in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for the dashboard.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className='grid max-w-md grid-cols-2 gap-8 pt-2'
              >
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='light' className='sr-only' />
                    </FormControl>
                    <div className='items-center rounded-md border-2 border-muted p-1 hover:border-accent'>
                      <div className='space-y-2 rounded-sm bg-[#ecedef] p-2'>
                        <div className='space-y-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      Light
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='dark' className='sr-only' />
                    </FormControl>
                    <div className='items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground'>
                      <div className='space-y-2 rounded-sm bg-slate-950 p-2'>
                        <div className='space-y-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      Dark
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='palette'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Palette</FormLabel>
              <FormDescription>
                Choose the accent palette used across light and dark themes.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className='grid gap-4 pt-2 md:grid-cols-2 xl:grid-cols-3'
              >
                {themePalettes.map((item) => (
                  <FormItem key={item.value} className='h-full'>
                    <FormLabel className='block h-full [&:has([data-state=checked])>div]:border-primary'>
                      <FormControl>
                        <RadioGroupItem
                          value={item.value}
                          className='sr-only'
                        />
                      </FormControl>
                      <div className='h-full rounded-xl border-2 border-muted p-1 transition-colors hover:border-accent'>
                        <div className='flex h-full min-h-44 flex-col rounded-lg bg-card p-4'>
                          <div className='flex items-center gap-2'>
                            {item.preview.map((swatch) => (
                              <span
                                key={`${item.value}-${swatch}`}
                                className={cn('size-5 rounded-full', swatch)}
                              />
                            ))}
                          </div>
                          <div className='mt-4 flex flex-1 flex-col rounded-lg border border-border bg-background p-3'>
                            <div className='space-y-1'>
                              <div className='text-sm font-semibold'>
                                {item.label}
                              </div>
                              <div className='min-h-10 text-sm leading-5 text-muted-foreground'>
                                {item.description}
                              </div>
                            </div>
                            <div className='mt-auto space-y-3 pt-4'>
                              <div
                                className={cn(
                                  'inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-medium text-white',
                                  item.preview[0]
                                )}
                              >
                                Primary
                              </div>
                              <div className='grid grid-cols-2 gap-2'>
                                <div
                                  className={cn(
                                    'h-10 rounded-md',
                                    item.preview[1]
                                  )}
                                />
                                <div
                                  className={cn(
                                    'h-10 rounded-md',
                                    item.preview[2]
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormItem>
          )}
        />
        <div
          id='custom-palette'
          className='scroll-mt-6 space-y-4 rounded-xl border border-border bg-card p-4'
        >
          <div className='space-y-1'>
            <h3 className='font-medium'>Custom Palette</h3>
            <p className='text-sm text-muted-foreground'>
              Pick your own primary, secondary, and accent colors for light and
              dark themes. Select the `Custom` palette above to use them.
            </p>
          </div>
          <div className='grid gap-4 xl:grid-cols-2'>
            <div className='space-y-4 rounded-lg border border-border bg-background p-4'>
              <div>
                <div className='font-medium'>Light Theme Colors</div>
                <div className='text-sm text-muted-foreground'>
                  Applied whenever the dashboard is in light mode.
                </div>
              </div>
              <div className='space-y-3'>
                <CustomColorField
                  control={form.control}
                  colorName='Primary'
                  hexName='customPalette.light.primary'
                />
                <CustomColorField
                  control={form.control}
                  colorName='Secondary'
                  hexName='customPalette.light.secondary'
                />
                <CustomColorField
                  control={form.control}
                  colorName='Accent'
                  hexName='customPalette.light.accent'
                />
              </div>
            </div>
            <div className='space-y-4 rounded-lg border border-border bg-background p-4'>
              <div>
                <div className='font-medium'>Dark Theme Colors</div>
                <div className='text-sm text-muted-foreground'>
                  Applied whenever the dashboard is in dark mode.
                </div>
              </div>
              <div className='space-y-3'>
                <CustomColorField
                  control={form.control}
                  colorName='Primary'
                  hexName='customPalette.dark.primary'
                />
                <CustomColorField
                  control={form.control}
                  colorName='Secondary'
                  hexName='customPalette.dark.secondary'
                />
                <CustomColorField
                  control={form.control}
                  colorName='Accent'
                  hexName='customPalette.dark.accent'
                />
              </div>
            </div>
          </div>
        </div>

        <Button type='submit'>Update preferences</Button>
      </form>
    </Form>
  )
}

function CustomColorField({
  control,
  colorName,
  hexName,
}: {
  control: ReturnType<typeof useForm<AppearanceFormValues>>['control']
  colorName: string
  hexName:
    | 'customPalette.light.primary'
    | 'customPalette.light.secondary'
    | 'customPalette.light.accent'
    | 'customPalette.dark.primary'
    | 'customPalette.dark.secondary'
    | 'customPalette.dark.accent'
}) {
  return (
    <FormField
      control={control}
      name={hexName}
      render={({ field }) => (
        <FormItem className='rounded-lg border border-border bg-card p-3'>
          <FormControl>
            <div className='flex items-center gap-3'>
              <input
                type='color'
                value={field.value}
                onChange={field.onChange}
                aria-label={`${colorName} color picker`}
                className='size-11 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1'
              />
              <div className='min-w-0 flex-1 space-y-1'>
                <FormLabel className='block'>{colorName}</FormLabel>
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  className='font-mono uppercase'
                  placeholder='#2563EB'
                />
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
