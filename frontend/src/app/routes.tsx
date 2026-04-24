import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Reportar from './pages/Reportar';
import Mapa from './pages/Mapa';
import Dados from './pages/Dados';
import Sucesso from './pages/Sucesso';
import Educacao from './pages/Educacao';
import Login from './pages/Login';
import Painel from './pages/Painel';
import Orgaos from './pages/Orgaos';
import { RequireFirefighterAccess } from './auth/RequireFirefighterAccess';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/reportar',
    Component: Reportar,
  },
  {
    path: '/mapa',
    Component: Mapa,
  },
  {
    path: '/dados',
    Component: Dados,
  },
  {
    path: '/educacao',
    Component: Educacao,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/painel',
    element: (
      <RequireFirefighterAccess>
        <Painel />
      </RequireFirefighterAccess>
    ),
  },
  {
    path: '/orgaos',
    element: (
      <RequireFirefighterAccess>
        <Orgaos />
      </RequireFirefighterAccess>
    ),
  },
  {
    path: '/sucesso',
    Component: Sucesso,
  },
]);