import Seo from './Seo';
import Logo from './Logo';
import TopplingText from './TopplingText';
import { SITE } from '../lib/site';

/**
 * Pre-launch holding page (zarach.pl register). Single screen, no scroll, black.
 * Wordmark small at top · "SOFT TENSION LAB" (letters settle in on load) ·
 * "WEBSITE COMING SOON" · exactly one action: the mailto link.
 */
export default function HoldingPage() {
  return (
    <main className="holding grain" id="main">
      <Seo title="Website Coming Soon" description={`${SITE.name} — website coming soon. ${SITE.email}`} path="/" />
      <header className="holding__top">
        <Logo variant="logotype" className="holding__mark" title="Soft Tension Lab" />
      </header>

      <div className="holding__center" data-topple-scope>
        <h1 className="holding__title">
          <TopplingText text="SOFT TENSION LAB" mode="load" />
        </h1>
        <p className="holding__label label">Website Coming Soon</p>
      </div>

      <footer className="holding__foot">
        <a className="holding__mail glitch" data-text={SITE.email} href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </footer>
    </main>
  );
}
