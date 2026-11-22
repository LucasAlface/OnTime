import Auth from "@/components/auth/Auth";
import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  return (
    <Auth mode="login">
      <LoginForm />
    </Auth>
  );
}
