'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function UnsubscribeForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isUnsubscribed, setIsUnsubscribed] = useState(false)

  const searchParams = useSearchParams()

  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl))
    }
  }, [searchParams])

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('구독이 성공적으로 취소되었습니다.')
        setIsUnsubscribed(true)
      } else {
        setError(data.error || '구독 취소 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('구독 취소 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
      <div className="flex h-screen flex-col justify-center">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              구독 취소
            </h1>
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
              뉴스레터 구독을 취소하시겠습니까?
            </p>
          </div>

          {!isUnsubscribed ? (
            <form onSubmit={handleUnsubscribe} className="mt-8">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  이메일 주소
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="your@email.com"
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? '처리 중...' : '구독 취소'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 text-center">
              <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      구독이 성공적으로 취소되었습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/"
                  className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {message && !isUnsubscribed && (
            <div className="mt-4 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
            >
              ← 블로그로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
          <div className="flex h-screen flex-col justify-center">
            <div className="mx-auto max-w-md">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                  구독 취소
                </h1>
                <p className="mt-4 text-base text-gray-500 dark:text-gray-400">로딩 중...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <UnsubscribeForm />
    </Suspense>
  )
}
