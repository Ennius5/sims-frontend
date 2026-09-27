import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Account</h1>
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Role(s)</dt>
            <dd className="font-medium text-gray-900">{user?.roles.join(', ')}</dd>
          </div>
          {user?.student_id && (
            <div>
              <dt className="text-gray-500">Linked Student Record</dt>
              <dd className="font-medium text-gray-900">#{user.student_id}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}