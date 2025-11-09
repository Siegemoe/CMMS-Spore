'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'

export default function GlobalError(props: any) {
  const { error, reset } = props
  
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <NextError
          error={error}
          reset={reset}
          statusCode={500}
        />
      </body>
    </html>
  )
}