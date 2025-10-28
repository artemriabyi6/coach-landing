import { getContacts } from '../../lib/db'

export default async function AdminPage() {
  const contacts = await getContacts()

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Заявки на тренування</h1>
            <p className="text-gray-600 mt-2">Управління заявками від клієнтів</p>
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
              <p className="text-gray-500">Заявки зявляться тут після заповнення форми на сайті</p>
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
                        Повідомлення
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                            {getStatusText(contact.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {contact.message}
                          </div>
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
            <li>• Заявки автоматично зявляться тут після заповнення форми на сайті</li>
            <li>• Статус Нова - заявка ще не оброблена</li>
            <li>• Для тесту заповніть форму на головній сторінці</li>
          </ul>
        </div>
      </div>
    </div>
  )
}