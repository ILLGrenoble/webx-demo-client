import './styles.scss';

import { Application } from './src';

document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.run();
});
