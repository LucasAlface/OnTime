import Auth from "@/components/auth/Auth";
import RegisterForm from "@/components/auth/RegisterForm";

export default function Register() {
  return (
    <Auth mode="register">
      <RegisterForm />
    </Auth>
  );
}
