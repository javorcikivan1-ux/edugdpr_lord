import { hydrateRoot } from 'react-dom/client'
import App from '../index'
import '../index.css'
import { AuthProvider } from '../features/AuthService'
import { TrainingProvider } from '../features/TrainingStore'
import { ToastProvider } from '../lib/ToastContext'

export function render() {
  hydrateRoot(
    document.getElementById('root')!,
    <AuthProvider>
      <ToastProvider>
        <TrainingProvider>
          <App />
        </TrainingProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
