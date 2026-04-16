import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Reportar from './pages/Reportar';
import Mapa from './pages/Mapa';
import Dados from './pages/Dados';
import Sucesso from './pages/Sucesso';
import Educacao from './pages/Educacao';

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
    path: '/sucesso',
    Component: Sucesso,
  },
]);