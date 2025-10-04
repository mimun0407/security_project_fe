import { BrowserRouter, Routes, Route } from 'react-router-dom';
import List from './List';
import Login from './Login';
import UserMenu from './UserMenu';
import AdminMenu from './AdminMenu';
import History from './History';
import CreateUser from './CreateUser';
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/List' element={<List />} />
          <Route path='/' element={<Login />} />
          <Route path='/admin' element={<AdminMenu />} />
          <Route path='/user' element={<UserMenu />} />
          <Route path='/history' element={<History />} />
          <Route path='/createUser' element={<CreateUser />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;