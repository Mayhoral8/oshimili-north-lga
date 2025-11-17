import { FileClockIcon } from 'lucide-react'
import React from 'react'

const Review = () => {
  return (
    <div className="text-lg text-gray-900 flex items-center justify-center flex-col gap-y-4 min-h-screen">
      <span>
        <FileClockIcon className="text-amber-500" size={64} />
      </span>
      <span className="text-xl font-bold">
        Your Application is currently being reviewed.
      </span>
      <span>Please check back soon</span>
    </div>
  )
}

export default Review