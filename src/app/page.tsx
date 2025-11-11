import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Spore CMMS
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-700 mb-6 sm:mb-8">
            Computerized Maintenance Management System
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
            Streamline your maintenance operations with our comprehensive CMMS solution.
            Manage assets, work orders, preventive maintenance, and inventory all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link
              href="/auth/signin"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 sm:py-3 px-8 rounded-lg text-base sm:text-lg transition-colors touch-manipulation"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-4 sm:py-3 px-8 rounded-lg text-base sm:text-lg transition-colors touch-manipulation"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto sm:mx-0">
              <span className="text-blue-600 font-bold text-2xl sm:text-xl">A</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left">Assets</h3>
            <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left">
              Track and manage all your equipment and facilities efficiently with detailed records and maintenance history.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto sm:mx-0">
              <span className="text-green-600 font-bold text-2xl sm:text-xl">W</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left">Work Orders</h3>
            <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left">
              Create, assign, and track maintenance work orders seamlessly from creation to completion.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto sm:mx-0">
              <span className="text-yellow-600 font-bold text-2xl sm:text-xl">P</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left">Preventive Maintenance</h3>
            <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left">
              Schedule and automate preventive maintenance tasks to keep your equipment running smoothly.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto sm:mx-0">
              <span className="text-purple-600 font-bold text-2xl sm:text-xl">R</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left">Reports</h3>
            <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left">
              Generate comprehensive reports and gain insights into your maintenance operations.
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center px-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">Ready to get started?</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Join thousands of maintenance professionals who trust Spore CMMS to manage their operations.
            </p>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 sm:py-3 px-8 rounded-lg text-base sm:text-lg transition-colors inline-block touch-manipulation"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
