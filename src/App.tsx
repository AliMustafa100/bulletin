import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { WelcomePage } from './pages/WelcomePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
