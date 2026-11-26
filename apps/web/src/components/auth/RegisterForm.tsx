"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await axios.post(
        `${API_URL}/auth/register`,
        {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        },
        { withCredentials: true },
      );

      window.location.assign("/Home");
    } catch (error: unknown) {
      const response = axios.isAxiosError<unknown>(error)
        ? error.response
        : undefined;
      setError(
        response
          ? "Não foi possível criar a conta. Confirma os dados e tenta novamente."
          : "Não foi possível contactar a OnTime. Confirma que a API está em execução.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="register-name">Nome</label>
        <input
          autoComplete="name"
          className="auth-input"
          id="register-name"
          name="name"
          placeholder="O teu nome"
          required
          type="text"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="register-email">Endereço de e-mail</label>
        <input
          autoComplete="email"
          className="auth-input"
          id="register-email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="register-password">Palavra-passe</label>
        <input
          autoComplete="new-password"
          className="auth-input"
          id="register-password"
          name="password"
          placeholder="Cria uma palavra-passe"
          required
          type="password"
        />
      </div>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="auth-submit" disabled={isSubmitting} type="submit">
        <span>
          {isSubmitting ? "A criar conta…" : "Criar conta"}
        </span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
