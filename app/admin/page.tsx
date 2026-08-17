'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase, supabaseServer } from '@/lib/supabase'

interface UserItem {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

export default function AdminPanel() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState('sales')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetUserId, setResetUserId] = useState('')
  const [resetPassword, setResetPassword] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user || userProfile?.role !== 'admin') {
        router.push('/login')
        return
      }
      fetchUsers()
    }
  }, [user, userProfile, authLoading, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch users')

      setUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
          role: newUserRole
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to create user')

      setSuccess(`User ${newUserName} created successfully!`)
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserName('')
      setNewUserRole('sales')
      setShowCreateForm(false)
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete user')

      setSuccess('User deleted successfully')
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPassword) {
      setError('Please enter a new password')
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${resetUserId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword })
      })

      if (!res.ok) throw new Error('Failed to reset password')

      setSuccess('Password reset successfully')
      setShowResetModal(false)
      setResetPassword('')
      setResetUserId('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff'
      }}>
        <div style={{ fontSize: '18px', color: '#666666' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '900',
          color: '#000000',
          margin: '0 0 8px 0'
        }}>
          👨‍💼 Admin Panel
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666666',
          margin: '0'
        }}>
          Manage users and system settings
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #6ee7b7',
          color: '#047857',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Create User Section */}
      <div style={{
        background: '#f5f5f5',
        border: '2px solid #000000',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '40px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#000000',
            margin: '0'
          }}>
            Create New User
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '8px 16px',
              background: '#000000',
              color: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {showCreateForm ? '✕ Close' : '+ Add User'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '8px'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #000000',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #000000',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '8px'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #000000',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '8px'
                }}>
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #000000',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="sales">Sales</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#000000',
                color: '#ffffff',
                border: '2px solid #000000',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create User
            </button>
          </form>
        )}
      </div>

      {/* Users Table */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #000000',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          background: '#f5f5f5',
          borderBottom: '2px solid #000000'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#000000',
            margin: '0'
          }}>
            All Users ({users.length})
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #000000' }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  Name
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  Role
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  Created
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#000000'
                  }}>
                    {userItem.name}
                  </td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#666666'
                  }}>
                    {userItem.email}
                  </td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: userItem.role === 'admin' ? '#fee2e2' : userItem.role === 'manager' ? '#fef3c7' : '#d1fae5',
                      color: userItem.role === 'admin' ? '#dc2626' : userItem.role === 'manager' ? '#92400e' : '#047857',
                      borderRadius: '4px',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>
                      {userItem.role}
                    </span>
                  </td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#666666'
                  }}>
                    {new Date(userItem.created_at).toLocaleDateString()}
                  </td>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setResetUserId(userItem.id)
                          setShowResetModal(true)
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fcd34d',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        🔑 Reset Password
                      </button>
                      {userItem.email !== 'admin@airanix.com' && (
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            border: '2px solid #000000',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '20px'
            }}>
              Reset User Password
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '8px'
              }}>
                New Password
              </label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #000000',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowResetModal(false)
                  setResetPassword('')
                  setResetUserId('')
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#f5f5f5',
                  color: '#000000',
                  border: '1px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#000000',
                  color: '#ffffff',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
