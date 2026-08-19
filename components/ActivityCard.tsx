'use client'

import React from 'react'

interface CreatedBy {
  id: string
  name: string
  initials: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  createdBy: CreatedBy
  createdAt: string
  createdAtFormatted: string
  updatedAt: string
}

interface ActivityCardProps {
  activity: Activity
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      call: '☎️',
      email: '📧',
      meeting: '🤝',
      note: '📝',
      task: '✓',
      default: '📌'
    }
    return icons[type?.toLowerCase()] || icons.default
  }

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      call: 'bg-blue-50 border-blue-200',
      email: 'bg-purple-50 border-purple-200',
      meeting: 'bg-green-50 border-green-200',
      note: 'bg-gray-50 border-gray-200',
      task: 'bg-yellow-50 border-yellow-200',
      default: 'bg-gray-50 border-gray-200'
    }
    return colors[type?.toLowerCase()] || colors.default
  }

  return (
    <div
      className={`
        border rounded-lg p-4 mb-3 transition-all hover:shadow-md
        ${getActivityColor(activity.type)}
      `}
    >
      {/* Header: Icon, Title, and ISR Name */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg mt-0.5">{getActivityIcon(activity.type)}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {activity.title || 'Activity'}
            </h4>
            <p className="text-xs text-gray-600 mt-0.5">
              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {activity.description && (
        <p className="text-sm text-gray-700 mb-3 pl-7">
          {activity.description}
        </p>
      )}

      {/* Footer: ISR name, initials avatar, and timestamp */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 pl-7">
        <div className="flex items-center gap-2">
          {/* Avatar with initials */}
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {activity.createdBy.initials}
            </span>
          </div>
          {/* ISR Name */}
          <div>
            <p className="text-xs font-medium text-gray-900">
              {activity.createdBy.name}
            </p>
          </div>
        </div>

        {/* Timestamp - exact date and time */}
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {activity.createdAtFormatted}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ActivityCard
