import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "../../components/layout/AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | KSOP-K Si-Cekatan"
        description="Sistem Clearance kapal Tradisional"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}