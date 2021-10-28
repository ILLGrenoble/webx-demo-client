import './styles.scss';

import { WebXClient, WebXDisplay, WebXWebSocketTunnel } from './core';
import { WebXDemoDevTools } from './demo';

document.addEventListener('DOMContentLoaded', () => {

  const urlParams = new URLSearchParams(window.location.search);
  const tunnel = new WebXWebSocketTunnel(urlParams.get('url') || 'ws://localhost:8080');

  const client = new WebXClient(tunnel, {});

  const container = document.getElementById('display-container');

  client.initialise(container)
    .then((display: WebXDisplay) => {

      // Start animating the display once everything has been initialised
      display.animate();

      // Resize the display when the window is resized
      window.addEventListener('resize', () => display.resize());
      window.addEventListener('blur', () => {
          client.mouse.reset();
        client.keyboard.reset();
      });

      document.addEventListener('visibilitychange', () => {
        client.mouse.reset();
        client.keyboard.reset();
      });

      // Enter into full screen mode
      document.getElementById('btn-fullscreen').addEventListener('click', () => {
        display.containerElement.requestFullscreen().then(() => {
          // @ts-ignore
          if (navigator.keyboard) {
            // @ts-ignore
            navigator.keyboard.lock();
          }
          display.resize();
        });
      });

      new WebXDemoDevTools(client, display);
    })
    .catch(err => console.error(err));
});
