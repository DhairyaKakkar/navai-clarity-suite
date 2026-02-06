import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-display-sm md:text-display-md font-semibold tracking-tight mb-8">
            Privacy
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                The short version
              </h2>
              <p className="leading-relaxed">
                NavAI keeps your data on your device. We don't track you, sell your data, 
                or share it with third parties. The demo runs entirely in your browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                What the demo collects
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interaction signals (clicks, scrolls, hesitation) — stored only in your browser's memory</li>
                <li>Your preferences (calm mode, text size, etc.) — stored in LocalStorage</li>
                <li>Session logs for debugging — exportable, never sent anywhere</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                All of this data stays on your device. You can clear it anytime by 
                resetting the demo or clearing your browser storage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                What the extension will collect
              </h2>
              <p className="leading-relaxed">
                The Chrome extension (coming soon) will offer optional AI-powered guidance. 
                If you enable this feature, page content may be sent to an AI provider 
                (like OpenAI) to generate step-by-step instructions. This is:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Opt-in only — disabled by default</li>
                <li>Transparent — you'll see exactly what's being sent</li>
                <li>Configurable — you can use your own API key</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                No medical inference
              </h2>
              <p className="leading-relaxed">
                NavAI does not detect, infer, or store any medical or diagnostic information. 
                Our "overwhelm-aware" adaptations are based purely on behavioral signals 
                (like misclicks or hesitation), not on any attempt to identify or label users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Contact
              </h2>
              <p className="leading-relaxed">
                Questions? Reach out at{' '}
                <a 
                  href="mailto:privacy@navai.app" 
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  privacy@navai.app
                </a>
              </p>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
