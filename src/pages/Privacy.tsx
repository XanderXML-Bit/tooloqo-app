import { Layout } from '@/components/layout/Layout';

/**
 * Privacy page. Tooloqo processes files in the browser and collects no user data.
 * tests/pages/Privacy.test.tsx fails if the source starts contacting a host this page does not name.
 */
export function Privacy() {
  return (
    <Layout title="Privacy" showBack>
      <article className="px-4 py-6 max-w-2xl mx-auto space-y-5 text-sm text-text-secondary leading-relaxed">
        <h2 className="text-xl font-semibold text-text-primary tracking-tight">
          How Tooloqo handles your files
        </h2>
        <p>
          Tooloqo processes your images, PDFs, audio, video, and text inside your
          browser. Files are never uploaded to a server. On the web, Tooloqo has no
          accounts, analytics, advertising, trackers, or cookies.
        </p>
        <h3 className="text-base font-semibold text-text-primary">What stays on your device</h3>
        <p>
          If you choose a theme in Settings, Tooloqo saves that choice in your
          browser's local storage. It saves nothing else. It keeps no list of your
          files, and a file you open is gone when you close or reload the tab.
        </p>
        <p>
          Your browser also keeps a copy of the app's own code, so Tooloqo can open
          without a connection. That copy holds none of your files. To remove the
          theme and the copy, clear this site's data in your browser.
        </p>
        <h3 className="text-base font-semibold text-text-primary">Other services the site contacts</h3>
        <p>
          Apart from tooloqo.zendren.net itself, the site contacts one host,
          cdn.jsdelivr.net. Every page loads the Geist font from it. The first time
          you use a media tool, that tool also downloads the FFmpeg engine (about
          32 MB) from it. The image, PDF, and text tools need no other host.
        </p>
        <p>
          jsDelivr receives the standard request data that any page load sends, such
          as your IP address. Tooloqo sends it no file contents.
        </p>
        <h3 className="text-base font-semibold text-text-primary">Hosting</h3>
        <p>
          Vercel hosts the site and keeps standard server request logs.
        </p>
        <h3 className="text-base font-semibold text-text-primary">Contact</h3>
        <p>
          Tooloqo is built by Zendren. Questions:{' '}
          <a href="https://zendren.net" className="underline underline-offset-2 text-text-primary">
            zendren.net
          </a>
          .
        </p>
      </article>
    </Layout>
  );
}
