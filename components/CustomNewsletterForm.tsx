'use client'

import { useRef, useState } from 'react'

interface CustomNewsletterFormProps {
  title?: string
  description?: string
  apiUrl?: string
}

const CustomNewsletterForm = ({
  title = '블로그 구독하기',
  description = '새로운 글이 올라올 때마다 이메일로 받아보세요!',
  apiUrl = '/api/newsletter',
}: CustomNewsletterFormProps) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const subscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!inputEl.current) return

    const res = await fetch(apiUrl, {
      body: JSON.stringify({
        email: inputEl.current.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const { error: errorResponse } = await res.json()

    if (errorResponse) {
      setError(true)
      setMessage('잘못된 이메일 주소이거나 이미 구독하셨습니다!')
      return
    }

    inputEl.current.value = ''
    setError(false)
    setMessage('📬 구독 완료! 이제 새로운 글이 발행되면 가장 먼저 알려드릴게요.')
    setSubscribed(true)
  }

  return (
    <div>
      <div className="pb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</div>
      <div className="pb-3 text-sm text-gray-600 dark:text-gray-400">{description}</div>
      <form className="flex flex-col sm:flex-row" onSubmit={subscribe}>
        <div>
          <label htmlFor="email-input">
            <span className="sr-only">이메일 주소</span>
            <input
              autoComplete="email"
              className="focus:ring-primary-600 w-72 rounded-md px-4 focus:border-transparent focus:ring-2 focus:outline-none dark:bg-black"
              id="email-input"
              name="email"
              placeholder={subscribed ? '구독 완료! 🎉' : '이메일 주소를 입력하세요'}
              ref={inputEl}
              required
              type="email"
              disabled={subscribed}
            />
          </label>
        </div>
        <div className="mt-2 flex w-full rounded-md shadow-sm sm:mt-0 sm:ml-3">
          <button
            className={`bg-primary-500 w-full rounded-md px-4 py-2 font-medium text-white sm:py-0 ${
              subscribed ? 'cursor-default' : 'hover:bg-primary-700 dark:hover:bg-primary-400'
            } focus:ring-primary-600 focus:ring-2 focus:ring-offset-2 focus:outline-none dark:ring-offset-black`}
            type="submit"
            disabled={subscribed}
          >
            {subscribed ? '감사합니다!' : '구독하기'}
          </button>
        </div>
      </form>
      {(error || (subscribed && message)) && (
        <div
          className={`w-72 pt-2 text-sm sm:w-96 ${
            error ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}

export default CustomNewsletterForm
