"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await axios.post(
        `${API_URL}/auth/Login`,
        {
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
      const payload = response?.data;
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? payload.message
          : undefined;
      setError(
        !response
          ? "Não foi possível contactar a OnTime. Confirma que a API está em execução."
          : message === "User not found"
            ? "Não existe uma conta com este endereço de e-mail."
            : message === "Invalid password"
              ? "A palavra-passe está incorreta."
              : "Não foi possível iniciar sessão. Confirma os teus dados e tenta novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="login-email">Endereço de e-mail</label>
        <input
          autoComplete="email"
          className="auth-input"
          id="login-email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="login-password">Password</label>
        <input
          autoComplete="current-password"
          className="auth-input"
          id="login-password"
          name="password"
          placeholder="Introduz a tua palavra-passe"
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
        <span>{isSubmitting ? "A iniciar sessão…" : "Iniciar sessão"}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
