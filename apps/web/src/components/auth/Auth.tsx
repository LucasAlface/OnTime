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
    storyEyebrow: "BEM-VINDO DE VOLTA",
    storyTitle: (
      <>
        A tua cidade,
        <br />
        ao teu ritmo.
      </>
    ),
    storyCopy:
      "Inicia sessão para continuares a tua viagem. As tuas linhas e ligações do dia a dia estão aqui.",
    cardEyebrow: "A TUA CONTA ONTIME",
    cardTitle: "Iniciar sessão",
    cardDescription: "Introduz os teus dados para continuar.",
    cardTitleId: "login-title",
    switchPrompt: "Ainda não tens conta?",
    switchHref: "/Register",
    switchLabel: "Criar conta",
  },
  register: {
    storyEyebrow: "VIAJA COM A ONTIME",
    storyTitle: (
      <>
        Faz com que cada
        <br />
        viagem conte.
      </>
    ),
    storyCopy:
      "Uma forma mais simples de te manteres ligado à cidade. Cria uma conta e reúne as tuas viagens de transportes públicos num só lugar.",
    cardEyebrow: "COMEÇA AQUI",
    cardTitle: "Criar conta",
    cardDescription: "Só precisas de preencher alguns dados para começar.",
    cardTitleId: "register-title",
    switchPrompt: "Já tens conta?",
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
          <small>TRANSPORTES À TUA MEDIDA</small>
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
              <span>LIGAÇÕES NA CIDADE</span>
              <span className="route-live">
                <i /> REDE EM TEMPO REAL
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
              <span>Uma cidade. Mais formas de viajar.</span>
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
          <p className="auth-card-legal">A TEMPO, SEMPRE.</p>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© OnTime</span>
        <span>Os transportes públicos ao teu ritmo.</span>
      </footer>
    </main>
  );
}
