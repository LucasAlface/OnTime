import type { ReactNode } from "react";

type AuthMode = "login" | "register";

interface AuthProps {
  children: ReactNode;
  mode: AuthMode;
}

interface AuthContent {
  storyEyebrow: string;
  storyTitle: ReactNode;
  storyCopy: string;
  cardEyebrow: string;
  cardTitle: string;
  cardDescription: string;
  cardTitleId: string;
  switchPrompt: string;
  switchHref: string;
  switchLabel: string;
}

const AUTH_CONTENT = {
  login: {
    storyEyebrow: "WELCOME BACK",
    storyTitle: (
      <>
        Your city,
        <br />
        on your time.
      </>
    ),
    storyCopy:
      "Sign in to pick up where your journey left off. Your routes and everyday connections are right here.",
    cardEyebrow: "YOUR ONTIME ACCOUNT",
    cardTitle: "Sign in",
    cardDescription: "Enter your details to continue.",
    cardTitleId: "login-title",
    switchPrompt: "New to OnTime?",
    switchHref: "/Register",
    switchLabel: "Create an account",
  },
  register: {
    storyEyebrow: "MOVE WITH ONTIME",
    storyTitle: (
      <>
        Make every
        <br />
        journey count.
      </>
    ),
    storyCopy:
      "A simpler way to stay connected to the city. Create an account and keep your public transport journeys in one place.",
    cardEyebrow: "GET STARTED",
    cardTitle: "Create your account",
    cardDescription: "A few details, then you're ready to go.",
    cardTitleId: "register-title",
    switchPrompt: "Already have an account?",
    switchHref: "/Login",
    switchLabel: "Sign in",
  },
} satisfies Record<AuthMode, AuthContent>;

export default function Auth({ children, mode }: AuthProps) {
  const content = AUTH_CONTENT[mode];

  return (
    <main className="auth-page">
      <header className="auth-header">
        <a aria-label="OnTime" className="ontime-brand" href="/">
          <span aria-hidden="true" className="ontime-brand-mark">
            <span />
            <span />
          </span>
          <span className="ontime-brand-copy">
            <strong>OnTime</strong>
            <small>SMARTER CITY TRAVEL</small>
          </span>
        </a>
        <span className="auth-header-note">
          <i /> Porto · Portugal
        </span>
      </header>

      <div className="auth-content">
        <section className="auth-story">
          <p className="auth-eyebrow">
            <span /> {content.storyEyebrow}
          </p>
          <h1>{content.storyTitle}</h1>
          <p className="auth-story-copy">{content.storyCopy}</p>
          <div aria-hidden="true" className="route-card">
            <div className="route-card-header">
              <span>CITY CONNECTIONS</span>
              <span className="route-live">
                <i /> LIVE NETWORK
              </span>
            </div>
            <div className="route-visual">
              <i />
              <i />
              <i />
            </div>
            <div className="route-stop-copy">
              <span>Aliados</span>
              <span>Casa da Música</span>
              <span>Boavista</span>
            </div>
            <div className="route-card-footer">
              <b>204</b>
              <span>One city. More ways to move.</span>
              <span>↗</span>
            </div>
          </div>
          <p className="auth-story-footnote">
            YOUR EVERYDAY JOURNEY, BETTER CONNECTED
          </p>
        </section>

        <section aria-labelledby={content.cardTitleId} className="auth-card">
          <div className="auth-card-topline" />
          <p className="auth-card-eyebrow">{content.cardEyebrow}</p>
          <h2 id={content.cardTitleId}>{content.cardTitle}</h2>
          <p className="auth-card-description">{content.cardDescription}</p>

          {children}

          <div className="auth-switch">
            <span>{content.switchPrompt}</span>
            <a className="auth-switch-link" href={content.switchHref}>
              {content.switchLabel} <span>→</span>
            </a>
          </div>
          <p className="auth-card-legal">ON TIME, EVERY TIME.</p>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© OnTime</span>
        <span>Public transport, in sync with you.</span>
      </footer>
    </main>
  );
}
