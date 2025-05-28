import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import ScanPage from '../pages/scan/scan-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import ResultPage from '../pages/result/result-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/scan': new ScanPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/result/:id': new ResultPage(),  // route dinamis dengan :id
};

export default routes;
