import Link from 'next/link'
import { logout, getUser } from '../actions/auth'
import { getTournaments } from '../actions/tournaments'

export default async function DashboardPage() {
  const user = await getUser()
  const tournaments = await getTournaments()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Scorer Dashboard</h1>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Tournaments</h2>
          <Link
            href="/dashboard/tournament/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + New Tournament
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No tournaments yet. Create your first tournament!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/dashboard/tournament/${tournament.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tournament.name}
                </h3>
                <p className="text-sm text-gray-600">
                  📍 {tournament.location}
                </p>
                <p className="text-sm text-gray-600">
                  📅 {new Date(tournament.start_date).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Links</h3>
          <ul className="space-y-2 text-blue-700">
            <li>
              <Link href="/" className="hover:underline">
                → View Public Tournament List
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
