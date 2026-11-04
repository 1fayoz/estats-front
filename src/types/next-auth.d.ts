import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    accessToken: string;
  }

  interface Session {
    /** Backend JWT; `null` once it has expired. */
    accessToken: string | null;
    error?: "SessionExpired";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    error?: "SessionExpired";
  }
}
