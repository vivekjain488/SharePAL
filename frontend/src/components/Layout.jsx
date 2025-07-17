import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen gradient-bg">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}

export default Layout