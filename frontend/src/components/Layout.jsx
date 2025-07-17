import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <main className="container mx-auto px-4 py-2">
        {children}
      </main>
    </div>
  )
}

export default Layout