import { BrowserRouter, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import RoomPage from './pages/RoomPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/create" element={<CreateRoomPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
