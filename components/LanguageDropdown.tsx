'use client'

import { Fragment } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { usePathname } from 'next/navigation'
import Link from './Link'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isSupportedLocale } from '@/lib/posts'

const LOCALE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function LanguageDropdown() {
  const pathname = usePathname()
  const activeLocale = (() => {
    if (!pathname || pathname === '/') {
      return DEFAULT_LOCALE
    }
    const [, firstSegment] = pathname.split('/')
    if (firstSegment && isSupportedLocale(firstSegment)) {
      return firstSegment
    }
    return DEFAULT_LOCALE
  })()

  const menuItems = SUPPORTED_LOCALES.map((locale) => {
    const label = LOCALE_LABELS[locale] ?? locale.toUpperCase()
    const href = locale === DEFAULT_LOCALE ? '/' : `/${locale}`
    const isActive = activeLocale === locale

    return (
      <MenuItem key={locale}>
        {({ focus }) => (
          <Link
            href={href}
            className={classNames(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm transition',
              focus ? 'bg-primary-500 text-white' : 'text-gray-700 dark:text-gray-200',
              isActive ? 'font-semibold' : 'font-normal'
            )}
          >
            <span>{label}</span>
            <span className="text-xs text-gray-400 uppercase">{locale}</span>
          </Link>
        )}
      </MenuItem>
    )
  })

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="hover:text-primary-500 dark:hover:text-primary-400 flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-gray-700 transition dark:text-gray-200">
          <span className="sm:inline">Language</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.937a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </MenuButton>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="ring-opacity-5 absolute right-0 z-40 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black focus:outline-hidden dark:divide-gray-700 dark:bg-gray-800">
          <div className="p-1">{menuItems}</div>
        </MenuItems>
      </Transition>
    </Menu>
  )
}
