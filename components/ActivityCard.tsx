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
  followUp?: {
    scheduledDate: string
    scheduledTime: string
    priority: string
  }
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
      'call-not-received': '📵',
      'follow-up-call': '☎️',
      'follow-up-meeting': '🔔',
      'meeting-booked': '📅',
      'meeting-happened': '✅',
      'follow-up-completed': '✅',
      'assigned': '👤',
      default: '📌'
    }
    return icons[type?.toLowerCase()] || icons.default
  }

  const getActivityLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'call': 'Call',
      'email': 'Email Sent',
      'meeting': 'Meeting',
      'note': 'Note',
      'task': 'Task',
      'call-not-received': 'Call Not Received',
      'follow-up-call': 'Follow-up Call',
      'follow-up-meeting': 'Follow-up for Meeting',
      'meeting-booked': 'Meeting Booked',
      'meeting-happened': 'Meeting Happened',
      'follow-up-completed': 'Follow-up Completed',
      'assigned': 'Assigned'
    }
    return labels[type?.toLowerCase()] || type
  }

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      call: 'bg-blue-50 border-blue-200',
      email: 'bg-purple-50 border-purple-200',
      meeting: 'bg-green-50 border-green-200',
      note: 'bg-gray-50 border-gray-200',
      task: 'bg-yellow-50 border-yellow-200',
      'call-not-received': 'bg-red-50 border-red-200',
      'follow-up-call': 'bg-blue-50 border-blue-200',
      'follow-up-meeting': 'bg-indigo-50 border-indigo-200',
      'meeting-booked': 'bg-emerald-50 border-emerald-200',
      'meeting-happened': 'bg-green-50 border-green-200',
      'follow-up-completed': 'bg-green-50 border-green-200',
      'assigned': 'bg-orange-50 border-orange-200',
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
      {/* Header: Icon and Activity Type Label */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-lg mt-0.5">{getActivityIcon(activity.type)}</span>
        <h4 className="font-semibold text-gray-900 text-sm">
          {getActivityLabel(activity.type)}
        </h4>
      </div>

      {/* Description - only if present and different from title */}
      {activity.description && activity.description !== getActivityLabel(activity.type) && (
        <p className="text-sm text-gray-700 mb-3 pl-7 leading-relaxed">
          {activity.description}
        </p>
      )}

      {/* Follow-up Preview - if this activity has a scheduled follow-up */}
      {activity.followUp && (
        <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '6px', margin: '8px 0', borderLeft: '3px solid #f59e0b', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '16px' }}>🔔</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#78350f' }}>
              Follow-up Scheduled
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#92400e' }}>
              📅 {new Date(activity.followUp.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at 🕐 {activity.followUp.scheduledTime}
              {activity.followUp.priority && ` • ${activity.followUp.priority.toUpperCase()}`}
            </p>
          </div>
        </div>
      )}

      {/* Footer: ISR name, initials avatar, and timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', paddingLeft: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Avatar with initials */}
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'white' }}>
              {activity.createdBy.initials}
            </span>
          </div>
          {/* ISR Name */}
          <p style={{ fontSize: '12px', fontWeight: '500', color: '#111827', margin: '0' }}>
            {activity.createdBy.name}
          </p>
        </div>

        {/* Timestamp - exact date and time */}
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0', textAlign: 'right' }}>
          {activity.createdAtFormatted}
        </p>
      </div>
    </div>
  )
}

export default ActivityCard
