import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { ErrorBoundary } from 'react-error-boundary'

import { Provider } from 'jotai'

import App from './App'
import './index.css'

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre>{error.message}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    )
}

ReactDOM.render(
    <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
            // reset the state of your app so the error doesn't happen again
        }}
    >
        <Provider>
            <Suspense fallback="Loading...">
                <App />
            </Suspense>
        </Provider>
    </ErrorBoundary>,
    document.getElementById('root'),
)
