import HomePage from '../pages/home/home-page';
import DetailPage from '../pages/detail/detail-page';
import AddPage from '../pages/add/add-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import FavoritePage from '../pages/favorite/favorite-page';

const routes = {
  '/': new HomePage(),
  '/detail/:id': new DetailPage(),
  '/add': Object.assign(new AddPage(), { needsAuth: true }),
  '/about': new AboutPage(),
  '/login': new LoginPage(),         
  '/register': new RegisterPage(),
  '/favorite': Object.assign(FavoritePage, { needsAuth: true }), 
};

export default routes;