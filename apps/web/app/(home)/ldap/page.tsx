// components
import { AuthFooter } from "@/components/auth-screens/footer";
// helpers
import { EPageTypes } from "@/helpers/authentication.helper";
// layouts
import DefaultLayout from "@/layouts/default-layout";
// wrappers
import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";
// components
import { AuthHeaderBase } from "@/components/auth-screens/header";
// plane web imports
import { LDAPRoot } from "@/plane-web/components/auth/ldap/root";

function LDAPAuthPage() {
  return (
    <DefaultLayout>
      <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
        <div className="relative z-10 flex flex-col items-center w-screen h-screen overflow-hidden overflow-y-auto pt-6 pb-10 px-8">
          <AuthHeaderBase pageTitle={"LDAP Authentication - Plane"} />
          <LDAPRoot />
          <AuthFooter />
        </div>
      </AuthenticationWrapper>
    </DefaultLayout>
  );
}

export default LDAPAuthPage;
