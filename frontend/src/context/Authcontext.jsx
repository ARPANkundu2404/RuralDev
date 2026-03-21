import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, userAPI } from "../utils/api";

// ─── Role Constants ────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "ADMIN",
  TRAINER: "TRAINER",
  RECRUITER: "RECRUITER",
  SELLER: "SELLER",
  USER: "USER",
};

// ─── Context Setup ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const persistAuth = (token, refreshToken, user) => {
  localStorage.setItem("ruraldev_token", token);
  if (refreshToken)
    localStorage.setItem("ruraldev_refresh_token", refreshToken);
  localStorage.setItem("ruraldev_user", JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem("ruraldev_token");
  localStorage.removeItem("ruraldev_refresh_token");
  localStorage.removeItem("ruraldev_user");
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("ruraldev_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("ruraldev_token") || null,
  );

  const [role, setRole] = useState(() => {
    try {
      const stored = localStorage.getItem("ruraldev_user");
      return stored ? JSON.parse(stored)?.role : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync role whenever user changes
  useEffect(() => {
    setRole(user?.role ?? null);
  }, [user]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.login({ email, password });
        const { data } = response;

        const { token, email: userEmail, role } = data;
        
        // Create user object from response
        const userData = {
          email: userEmail,
          role: role,
          // Additional fields can be fetched from dashboard if needed
        };

        persistAuth(token, null, userData);
        setToken(token);
        setUser(userData);
        setRole(role);

        // Role-based redirect
        const redirectMap = {
          [ROLES.ADMIN]: "/admin/approvals",
          [ROLES.TRAINER]: "/trainer/workshops",
          [ROLES.RECRUITER]: "/recruiter/jobs",
          [ROLES.SELLER]: "/seller/products",
          [ROLES.USER]: "/home",
        };
        navigate(redirectMap[role] ?? "/home", { replace: true });

        return { success: true };
      } catch (err) {
        const msg = err.friendlyMessage || "Login failed. Please try again.";
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async ({ email, password, username, role: selectedRole }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.register({
          username: username || email.split("@")[0],
          email,
          password,
          role: selectedRole,
        });

        const { data } = response;

        // Redirect to login page with success message
        navigate("/login", { 
          state: { 
            successMessage: "Registration successful! Check your email, then sign in." 
          } 
        });
        return { success: true };
      } catch (err) {
        const msg =
          err.friendlyMessage || "Registration failed. Please try again.";
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );



  // ── Complete Profile ───────────────────────────────────────────────────────
  const completeProfile = useCallback(
    async (userId, profileData) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await userAPI.updateProfile(userId, profileData);

        const updatedUser = { ...user, ...data.user, profileComplete: true };
        localStorage.setItem("ruraldev_user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Route to appropriate dashboard
        const redirectMap = {
          [ROLES.ADMIN]: "/admin/approvals",
          [ROLES.TRAINER]: "/trainer/workshops",
          [ROLES.RECRUITER]: "/recruiter/jobs",
          [ROLES.SELLER]: "/seller/products",
          [ROLES.USER]: "/home",
        };
        navigate(redirectMap[updatedUser.role] ?? "/home", { replace: true });
        return { success: true };
      } catch (err) {
        const msg = err.friendlyMessage || "Failed to save profile.";
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [user, navigate],
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Silent fail — still clear local state
    } finally {
      clearAuth();
      setToken(null);
      setUser(null);
      setRole(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ── Update Local User ──────────────────────────────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("ruraldev_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── Role Guards ────────────────────────────────────────────────────────────
  const isAdmin = role === ROLES.ADMIN;
  const isTrainer = role === ROLES.TRAINER;
  const isRecruiter = role === ROLES.RECRUITER;
  const isSeller = role === ROLES.SELLER;
  const isUser = role === ROLES.USER;
  const isAuthenticated = !!token && !!user;

  const hasRole = useCallback((...roles) => roles.includes(role), [role]);

  const value = {
    // State
    user,
    token,
    role,
    loading,
    error,
    isAuthenticated,

    // Role flags
    isAdmin,
    isTrainer,
    isRecruiter,
    isSeller,
    isUser,
    hasRole,

    // Actions
    login,
    register,
    completeProfile,
    logout,
    updateUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
