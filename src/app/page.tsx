import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Spore CMMS
          </h1>
          <h2 className="text-3xl text-gray-700 mb-8">
            Computerized Maintenance Management System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Streamline your maintenance operations with our comprehensive CMMS solution.
            Manage assets, work orders, preventive maintenance, and inventory all in one place.
          </p>
          
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold text-xl">A</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Assets</h3>
            <p className="text-gray-600">
              Track and manage all your equipment and facilities efficiently with detailed records and maintenance history.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 font-bold text-xl">W</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Work Orders</h3>
            <p className="text-gray-600">
              Create, assign, and track maintenance work orders seamlessly from creation to completion.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-yellow-600 font-bold text-xl">P</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Preventive Maintenance</h3>
            <p className="text-gray-600">
              Schedule and automate preventive maintenance tasks to keep your equipment running smoothly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 font-bold text-xl">R</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Reports</h3>
            <p className="text-gray-600">
              Generate comprehensive reports and gain insights into your maintenance operations.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Ready to get started?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of maintenance professionals who trust Spore CMMS to manage their operations.
            </p>
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors inline-block"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
