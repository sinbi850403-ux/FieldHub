import React, { createContext, useContext, useMemo, useState } from "react";
import { setAccessToken } from "../services/api.client";

type Role = "CUSTOMER" | "PROVIDER" | "ADMIN" | null;
type AuthCtx = { token: string | null; role: Role; setToken: (t: string | null, role?: Role) => void };

const Ctx = createContext<AuthCtx>({ token: null, role: null, setToken: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, _setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);

  const setTokenFn = (t: string | null, r?: Role) => {
    _setToken(t);
    setAccessToken(t);
    if (r !== undefined) setRole(r);
  };

  const value = useMemo(() => ({ token, role, setToken: setTokenFn }), [token, role]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
