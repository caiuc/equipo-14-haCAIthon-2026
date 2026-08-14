import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

const REGISTER_SERVICE_WORKER_SCRIPT = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es-CL">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0B1628" />
        <meta name="description" content="Recicla, aporta a tu comunidad UC y sube en el ranking." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: REGISTER_SERVICE_WORKER_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
