import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/http";

const SESSION_KEY = "@appointdi_mobile_session";
const THEME_PREF_KEY = "@appointdi_mobile_theme_pref";
const PRIMARY_COLOR_KEY = "@appointdi_mobile_primary_color";

async function safeGetSession() {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

async function safeSetSession(value: string) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, value);
  } catch {
    return;
  }
}

async function safeClearSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
}

type User = {
  id: string;
  email: string;
  role: "business" | "personal" | "staff" | "admin";
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessId?: string;
  theme?: "light" | "dark";
  primaryColor?: string;
  profilePictureUrl?: string;
};

function normalizeUser(user: Partial<User> & { _id?: string }): User {
  return {
    id: String(user.id ?? user._id ?? ""),
    email: String(user.email ?? ""),
    role: (user.role as User["role"]) ?? "personal",
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    businessId: user.businessId,
    theme: user.theme,
    primaryColor: user.primaryColor,
    profilePictureUrl: user.profilePictureUrl,
  };
}

type Business = {
  _id: string;
  businessName?: string;
  category?: string;
  aboutUs?: string;
  phone?: string;
  email?: string;
  website?: string;
};

type Location = {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
};

type Session = {
  token: string;
  user: User;
  business?: Business | null;
  locations?: Location[];
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: "business" | "personal";
};

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  selectedLocationId: string | null;
  selectedLocation: Location | null;
  themePreference: "light" | "dark";
  primaryColor: string;
  setSelectedLocationId: (locationId: string | null) => void;
  setThemePreference: (theme: "light" | "dark") => void;
  setPrimaryColor: (color: string) => void;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSessionData: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

async function loadBusinessData(
  token: string,
  user: User,
): Promise<{ business?: Business | null; locations?: Location[] }> {
  if (user.role !== "business" || !user.businessId) {
    return { business: null, locations: [] };
  }

  const business = await apiRequest<Business>(
    `/api/business/${user.businessId}`,
    {
      token,
    },
  );

  const locations = await apiRequest<Location[]>(
    `/api/locations?businessId=${user.businessId}`,
    { token },
  ).catch(() => []);

  return { business, locations };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [themePreference, setThemePreferenceState] = useState<"light" | "dark">(
    "dark",
  );
  const [primaryColor, setPrimaryColorState] = useState("#6849a7");

  const setThemePreference = (theme: "light" | "dark") => {
    setThemePreferenceState(theme);
    void safeSetSessionPreference(THEME_PREF_KEY, theme);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    void safeSetSessionPreference(PRIMARY_COLOR_KEY, color);
  };

  useEffect(() => {
    const restore = async () => {
      try {
        const [storedTheme, storedPrimaryColor] = await Promise.all([
          safeGetSessionPreference(THEME_PREF_KEY),
          safeGetSessionPreference(PRIMARY_COLOR_KEY),
        ]);
        if (storedTheme === "light" || storedTheme === "dark") {
          setThemePreferenceState(storedTheme);
        }
        if (storedPrimaryColor) {
          setPrimaryColorState(storedPrimaryColor);
        }

        const raw = await safeGetSession();
        if (!raw) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(raw) as Session;
        if (!parsed?.token || !parsed?.user?.id) {
          await safeClearSession();
          setLoading(false);
          return;
        }

        const fetchedUser = await apiRequest<User & { _id?: string }>(
          `/api/auth/user/${parsed.user.id}`,
          {
            token: parsed.token,
          },
        );
        const freshUser = normalizeUser(fetchedUser);
        const businessData = await loadBusinessData(parsed.token, freshUser);

        const restored: Session = {
          token: parsed.token,
          user: freshUser,
          ...businessData,
        };
        setSession(restored);
        if (freshUser.theme === "light" || freshUser.theme === "dark") {
          setThemePreferenceState(freshUser.theme);
          await safeSetSessionPreference(THEME_PREF_KEY, freshUser.theme);
        }
        if (freshUser.primaryColor) {
          setPrimaryColorState(freshUser.primaryColor);
          await safeSetSessionPreference(
            PRIMARY_COLOR_KEY,
            freshUser.primaryColor,
          );
        }
        const restoredLocations = restored.locations ?? [];
        setSelectedLocationId((previous) => {
          if (
            previous &&
            restoredLocations.some((location) => location._id === previous)
          ) {
            return previous;
          }
          return restoredLocations[0]?._id ?? null;
        });
        await safeSetSession(JSON.stringify(restored));
      } catch {
        await safeClearSession();
        setSession(null);
        setSelectedLocationId(null);
      } finally {
        setLoading(false);
      }
    };

    void restore();
  }, []);

  const login = async ({ email, password }: LoginPayload) => {
    const result = await apiRequest<{ token: string; user: User }>(
      "/api/auth/login",
      {
        method: "POST",
        body: { email, password },
      },
    );

    const fetchedUser = await apiRequest<User & { _id?: string }>(
      `/api/auth/user/${result.user.id}`,
      {
        token: result.token,
      },
    ).catch(() => result.user as User & { _id?: string });
    const freshUser = normalizeUser(fetchedUser);

    const businessData = await loadBusinessData(result.token, freshUser);

    const nextSession: Session = {
      token: result.token,
      user: freshUser,
      ...businessData,
    };

    setSession(nextSession);
    if (freshUser.theme === "light" || freshUser.theme === "dark") {
      setThemePreferenceState(freshUser.theme);
      await safeSetSessionPreference(THEME_PREF_KEY, freshUser.theme);
    }
    if (freshUser.primaryColor) {
      setPrimaryColorState(freshUser.primaryColor);
      await safeSetSessionPreference(PRIMARY_COLOR_KEY, freshUser.primaryColor);
    }
    const nextLocations = nextSession.locations ?? [];
    setSelectedLocationId(
      nextLocations.length > 1 ? null : (nextLocations[0]?._id ?? null),
    );
    await safeSetSession(JSON.stringify(nextSession));
  };

  const register = async ({
    email,
    password,
    firstName,
    lastName,
    phone,
    role = "business",
  }: RegisterPayload) => {
    await apiRequest<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: { email, password, firstName, lastName, phone, role },
    });

    await login({ email, password });
  };

  const logout = async () => {
    setSession(null);
    setSelectedLocationId(null);
    await safeClearSession();
  };

  const refreshSessionData = async () => {
    if (!session?.token || !session?.user?.id) return;

    const fetchedUser = await apiRequest<User & { _id?: string }>(
      `/api/auth/user/${session.user.id}`,
      {
        token: session.token,
      },
    );
    const freshUser = normalizeUser(fetchedUser);
    const businessData = await loadBusinessData(session.token, freshUser);

    const nextSession: Session = {
      token: session.token,
      user: freshUser,
      ...businessData,
    };

    setSession(nextSession);
    if (freshUser.theme === "light" || freshUser.theme === "dark") {
      setThemePreferenceState(freshUser.theme);
      await safeSetSessionPreference(THEME_PREF_KEY, freshUser.theme);
    }
    if (freshUser.primaryColor) {
      setPrimaryColorState(freshUser.primaryColor);
      await safeSetSessionPreference(PRIMARY_COLOR_KEY, freshUser.primaryColor);
    }
    setSelectedLocationId((previous) => {
      const refreshedLocations = nextSession.locations ?? [];
      if (
        previous &&
        refreshedLocations.some((location) => location._id === previous)
      ) {
        return previous;
      }
      return refreshedLocations[0]?._id ?? null;
    });
    await safeSetSession(JSON.stringify(nextSession));
  };

  const needsOnboarding = useMemo(() => {
    if (!session?.user) return false;
    if (session.user.role !== "business") return false;
    return session.business?.businessName === "Pending Setup";
  }, [session]);

  const selectedLocation = useMemo(() => {
    if (!session?.locations?.length) return null;
    if (!selectedLocationId) return session.locations[0] ?? null;
    return (
      session.locations.find(
        (location) => location._id === selectedLocationId,
      ) ??
      session.locations[0] ??
      null
    );
  }, [session?.locations, selectedLocationId]);

  const value: AuthContextValue = {
    session,
    loading,
    isAuthenticated: !!session?.token,
    needsOnboarding,
    selectedLocationId,
    selectedLocation,
    themePreference,
    primaryColor,
    setSelectedLocationId,
    setThemePreference,
    setPrimaryColor,
    login,
    register,
    logout,
    refreshSessionData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function safeGetSessionPreference(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function safeSetSessionPreference(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    return;
  }
}
