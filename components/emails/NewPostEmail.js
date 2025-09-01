import React from 'react'

export default function NewPostEmail({ title, link }) {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement('h1', null, '새 글이 발행되었습니다!'),
    React.createElement('h2', null, title),
    React.createElement(
      'p',
      null,
      React.createElement('a', { href: link }, '글 보러 가기')
    )
  )
}
