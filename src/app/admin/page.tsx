'use client'

import { useState, useEffect } from 'react'
import { Contact } from '../../types'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'


export default function AdminPage() {
   const { data: session, status } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const loadContacts = async () => {
  try {
    const response = await fetch('/api/contact') // Тепер правильний URL
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    setContacts(data)
  } catch (error) {
    console.error('Error loading contacts:', error)
  } finally {
    setLoading(false)
  }
}

   useEffect(() => {
    if (status === 'loading') return // Чекаємо завантаження сесії
    
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  useEffect(() => {
    loadContacts()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Перевірка авторизації...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Перенаправлення вже відбувається
  }

 

 const updateStatus = async (contactId: string, newStatus: string) => {
  setUpdating(contactId)
  try {
    const response = await fetch(`/api/contact/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })

    const result = await response.json()
    
    if (response.ok && result.success) {
      await loadContacts()
    } else {
      console.error('Error updating status:', result.error)
      alert(`Помилка при оновленні статусу: ${result.error}`)
    }
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Помилка при оновленні статусу')
  } finally {
    setUpdating(null)
  }
}

const deleteContact = async (contactId: string) => {
  if (!confirm('Ви впевнені, що хочете видалити цю заявку?')) {
    return
  }

  try {
    const response = await fetch(`/api/contact/${contactId}`, {
      method: 'DELETE',
    })

    const result = await response.json()
    
    if (response.ok && result.success) {
      await loadContacts()
    } else {
      console.error('Error deleting contact:', result.error)
      alert(`Помилка при видаленні заявки: ${result.error}`)
    }
  } catch (error) {
    console.error('Error deleting contact:', error)
    alert('Помилка при видаленні заявки')
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Нова'
      case 'contacted':
        return 'На контакті'
      case 'completed':
        return 'Завершено'
      default:
        return status
    }
  }

  const getCourseText = (courseInterest: string | null) => {
    if (!courseInterest) return '—'
    switch (courseInterest) {
      case 'basic':
        return 'Базовий'
      case 'advanced':
        return 'Просунутий'
      case 'other':
        return 'Інше'
      default:
        return courseInterest
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження заявок...</p>
        </div>
      </div>
    )
  }

  return (
    
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8 py-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Управління заявками</h1>
            <p className="text-gray-600 mt-2">Перегляд та управління заявками від клієнтів</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
            <div className="text-sm text-gray-500">всього заявок</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Немає заявок</h3>
              <p className="text-gray-500">Заявки з&apos;являться тут після заповнення форми на сайті</p>
            </div>
          ) : (
            <>
              {/* Статистика по статусам */}
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Нові: {contacts.filter(c => c.status === 'new').length}
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    На контакті: {contacts.filter(c => c.status === 'contacted').length}
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Завершені: {contacts.filter(c => c.status === 'completed').length}
                  </div>
                </div>
              </div>

              {/* Таблиця */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Клієнт
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Контакти
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Курс
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дії
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {new Date(contact.createdAt).toLocaleDateString('uk-UA')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(contact.createdAt).toLocaleTimeString('uk-UA')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                              {contact.email}
                            </a>
                          </div>
                          <div className="text-sm text-gray-500">
                            <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                              {contact.phone}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {contact.courseInterest ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getCourseText(contact.courseInterest)}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={contact.status}
                            onChange={(e) => updateStatus(contact.id, e.target.value)}
                            disabled={updating === contact.id}
                            className={`text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(contact.status)} ${
                              updating === contact.id ? 'opacity-50' : ''
                            }`}
                          >
                            <option value="new">Нова</option>
                            <option value="contacted">На контакті</option>
                            <option value="completed">Завершено</option>
                          </select>
                          {updating === contact.id && (
                            <div className="inline-block ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            disabled={updating === contact.id}
                          >
                            Видалити
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Інструкція */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Як користуватися:</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Змінюйте статуси заявок через випадаючий список</li>
            <li>• &quot;Нова&quot; - заявка ще не оброблена</li>
            <li>• &quot;На контакті&quot; - ведете комунікацію з клієнтом</li>
            <li>• &quot;Завершено&quot; - заявка успішно оброблена</li>
            <li>• Видаляйте заявки, якщо вони не актуальні</li>
          </ul>
        </div>
      </div>
    </div>
  )
}