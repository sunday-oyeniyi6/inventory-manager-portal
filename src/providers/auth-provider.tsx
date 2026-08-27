"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import Keycloak from "keycloak-js";
import { createKeycloakInstance } from "@/lib/keycloak";

interface AuthUser {
  sub: string;
  email: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
  realm: string | null;
  login: (realmName: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  realm: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [realm, setRealm] = useState<string | null>(null);
  const keycloakRef = useRef<Keycloak | null>(null);
  const initCalledRef = useRef(false);

  /**
   * Attempt to restore a previous session from sessionStorage.
   */
  useEffect(() => {
    const storedRealm = sessionStorage.getItem("kc_realm");
    if (storedRealm && !initCalledRef.current) {
      initCalledRef.current = true;
      const kc = createKeycloakInstance(storedRealm);
      keycloakRef.current = kc;

      kc.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          typeof window !== "undefined"
            ? `${window.location.origin}/silent-check-sso.html`
            : undefined,
        checkLoginIframe: false,
      })
        .then((authenticated) => {
          if (authenticated && kc.token) {
            sessionStorage.setItem("kc_token", kc.token);
            setToken(kc.token);
            setRealm(storedRealm);
            setUser(kc.tokenParsed as unknown as AuthUser);
            setIsAuthenticated(true);

            // Set up token refresh
            kc.onTokenExpired = () => {
              kc.updateToken(30)
                .then(() => {
                  if (kc.token) {
                    sessionStorage.setItem("kc_token", kc.token);
                    setToken(kc.token);
                  }
                })
                .catch(() => {
                  handleLogout();
                });
            };
          } else {
            // Not authenticated, clear stored data
            sessionStorage.removeItem("kc_token");
            sessionStorage.removeItem("kc_realm");
          }
          setIsLoading(false);
        })
        .catch(() => {
          sessionStorage.removeItem("kc_token");
          sessionStorage.removeItem("kc_realm");
          setIsLoading(false);
        });
    } else if (!storedRealm) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Login: initialize Keycloak with the given realm and redirect.
   */
  const login = useCallback(async (realmName: string) => {
    const kc = createKeycloakInstance(realmName);
    keycloakRef.current = kc;
    sessionStorage.setItem("kc_realm", realmName);

    try {
      const authenticated = await kc.init({
        onLoad: "login-required",
        checkLoginIframe: false,
      });

      if (authenticated && kc.token) {
        sessionStorage.setItem("kc_token", kc.token);
        setToken(kc.token);
        setRealm(realmName);
        setUser(kc.tokenParsed as unknown as AuthUser);
        setIsAuthenticated(true);

        // Set up token refresh
        kc.onTokenExpired = () => {
          kc.updateToken(30)
            .then(() => {
              if (kc.token) {
                sessionStorage.setItem("kc_token", kc.token);
                setToken(kc.token);
              }
            })
            .catch(() => {
              handleLogout();
            });
        };
      }
    } catch (error) {
      console.error("Keycloak login failed:", error);
      throw error;
    }
  }, []);

  /**
   * Logout: destroy Keycloak session and redirect to login page.
   */
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("kc_token");
    sessionStorage.removeItem("kc_realm");
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setRealm(null);

    if (keycloakRef.current) {
      keycloakRef.current.logout({
        redirectUri: `${window.location.origin}/login`,
      });
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        realm,
        login,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
