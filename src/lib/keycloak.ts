import Keycloak from "keycloak-js";

/**
 * Create a Keycloak instance for a specific realm.
 * Each tenant has its own Keycloak realm, resolved from the tenant name.
 */
export function createKeycloakInstance(realmName: string): Keycloak {
  return new Keycloak({
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8085",
    realm: realmName,
    clientId:
      process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ||
      "inventory-manager-frontend",
  });
}

/**
 * Derive the Keycloak realm name from the tenant name.
 * Must match the backend logic: lowercase, remove non-alpha characters.
 */
export function deriveRealmName(tenantName: string): string {
  return tenantName.toLowerCase().replace(/[^a-z]/g, "");
}
