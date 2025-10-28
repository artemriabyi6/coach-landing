'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Contact } from '../../types'

interface AnalyticsData {
  totalContacts: number
  statusCounts: {
    new: number
    contacted: number
    completed: number
  }
  courseStats: {
    basic: number
    advanced: number
    other: number
    none: number
  }
  weeklyStats: {
    date: string
    count: number
  }[]
}

type TimeRange = '7days' | '30days' | 'all'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')


  

  const calculateAnalytics = useCallback((contacts: Contact[], range: TimeRange): AnalyticsData => {
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'all':
        startDate = new Date(0) // Початок часу
        break
    }

    const filteredContacts = contacts.filter(contact => 
      new Date(contact.createdAt) >= startDate
    )

    // Статистика по статусах
    const statusCounts = {
      new: filteredContacts.filter(c => c.status === 'new').length,
      contacted: filteredContacts.filter(c => c.status === 'contacted').length,
      completed: filteredContacts.filter(c => c.status === 'completed').length,
    }

    // Статистика по курсах
    const courseStats = {
      basic: filteredContacts.filter(c => c.courseInterest === 'basic').length,
      advanced: filteredContacts.filter(c => c.courseInterest === 'advanced').length,
      other: filteredContacts.filter(c => c.courseInterest === 'other').length,
      none: filteredContacts.filter(c => !c.courseInterest).length,
    }

    // Статистика по днях
    const weeklyStats = calculateDailyStats(filteredContacts)

    return {
      totalContacts: filteredContacts.length,
      statusCounts,
      courseStats,
      weeklyStats,
    }
  }, [])

  const calculateDailyStats = (contacts: Contact[]) => {
    const stats: { [key: string]: number } = {}
    
    contacts.forEach(contact => {
      const date = new Date(contact.createdAt).toISOString().split('T')[0] // YYYY-MM-DD
      stats[date] = (stats[date] || 0) + 1
    })

    return Object.entries(stats)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14) // Останні 14 днів
  }

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/contact')
      const contacts: Contact[] = await response.json()
      
      const analyticsData = calculateAnalytics(contacts, timeRange)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [calculateAnalytics, timeRange])

   useEffect(() => {
    if (status === 'loading') return // Чекаємо завантаження сесії
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    // Якщо авторизовані, завантажуємо контакти
    if (status === 'authenticated') {
     loadAnalytics()
    }
  }, [session, status, router])


  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const getConversionRate = () => {
    if (!analytics) return 0
    const total = analytics.totalContacts
    const completed = analytics.statusCounts.completed
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження аналітики...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Не вдалося завантажити аналітику</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Аналітика заявок</h1>
            <p className="text-gray-600 mt-2">Статистика та аналіз ефективності</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Останні 7 днів</option>
            <option value="30days">Останні 30 днів</option>
            <option value="all">За весь час</option>
          </select>
        </div>

        {/* Основні метрики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalContacts}</div>
            <div className="text-sm text-gray-500">Всього заявок</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{getConversionRate()}%</div>
            <div className="text-sm text-gray-500">Конверсія</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{analytics.statusCounts.contacted}</div>
            <div className="text-sm text-gray-500">На контакті</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{analytics.courseStats.basic + analytics.courseStats.advanced}</div>
            <div className="text-sm text-gray-500">Зацікавлені курсами</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Статистика по статусах */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Статуси заявок</h2>
            <div className="space-y-4">
              {[
                { status: 'new', label: 'Нові', count: analytics.statusCounts.new, color: 'bg-blue-500' },
                { status: 'contacted', label: 'На контакті', count: analytics.statusCounts.contacted, color: 'bg-yellow-500' },
                { status: 'completed', label: 'Завершені', count: analytics.statusCounts.completed, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{item.count}</span>
                    <span className="text-gray-500 text-sm">
                      ({analytics.totalContacts > 0 ? Math.round((item.count / analytics.totalContacts) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Статистика по курсах */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Зацікавленість курсами</h2>
            <div className="space-y-4">
              {[
                { course: 'basic', label: 'Базовий курс', count: analytics.courseStats.basic, color: 'bg-blue-500' },
                { course: 'advanced', label: 'Просунутий курс', count: analytics.courseStats.advanced, color: 'bg-green-500' },
                { course: 'other', label: 'Інше', count: analytics.courseStats.other, color: 'bg-yellow-500' },
                { course: 'none', label: 'Не вказано', count: analytics.courseStats.none, color: 'bg-gray-300' },
              ].map((item) => (
                <div key={item.course} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Графік активності */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Активність по дням</h2>
          {analytics.weeklyStats.length > 0 ? (
            <div className="flex items-end space-x-1 h-32">
              {analytics.weeklyStats.map((day) => {
                const maxCount = Math.max(...analytics.weeklyStats.map(d => d.count))
                const height = maxCount > 0 ? (day.count / maxCount) * 80 : 0
                
                return (
                  <div key={day.date} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-blue-500 rounded-t w-full transition-all duration-300"
                      style={{ height: `${height}px` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {new Date(day.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs font-semibold">{day.count}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Немає даних для відображення</p>
          )}
        </div>
      </div>
    </div>
  )
}