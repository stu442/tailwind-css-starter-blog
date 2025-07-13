interface ReadingTimeProps {
  readingTime: {
    text: string
    minutes: number
    time: number
    words: number
  }
}

export default function ReadingTime({ readingTime }: ReadingTimeProps) {
  return (
    <span className="text-gray-500 dark:text-gray-400">
      {Math.ceil(readingTime.minutes)} min read
    </span>
  )
}
