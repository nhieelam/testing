import React from 'react'

const NotFoundPage = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            fontFamily: 'sans-serif',
            backgroundColor: '#f2f2f2'
        }}>
            <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
            <p style={{ fontSize: '1.5rem' }}>Page Not Found</p>
        </div>
    )
}

export default NotFoundPage
