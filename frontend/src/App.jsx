import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth, ROLES } from "./context/AuthContext";

// ─── Lazy Page Imports ─────────────────────────────────────────────────────────
// Public
const LoginPage         = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage      = lazy(() => import("./pages/auth/RegisterPage"));
const VerifyEmailPage   = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ProfileSetupPage  = lazy(() => import("./pages/auth/ProfileSetupPage"));

// User
const HomePage          = lazy(() => import("./pages/user/HomePage"));
const SkillPathwayPage  = lazy(() => import("./pages/user/SkillPathwayPage"));
const MarketplacePage   = lazy(() => import("./pages/user/MarketplacePage"));
const JobsPage          = lazy(() => import("./pages/user/JobsPage"));
const WorkshopsPage     = lazy(() => import("./pages/user/WorkshopsPage"));

// Trainer
const TrainerWorkshops  = lazy(() => import("./pages/trainer/TrainerWorkshopsPage"));
const TrainerAnalytics  = lazy(() => import("./pages/trainer/TrainerAnalyticsPage"));

// Admin
const AdminFraudCheck   = lazy(() => import("./pages/admin/AdminFraudCheckPage"));
const AdminApprovals    = lazy(() => import("./pages/admin/AdminApprovalsPage"));
const AdminUsers        = lazy(() => import("./pages/admin/AdminUsersPage"));

// Recruiter
const RecruiterJobs     = lazy(() => import("./pages/recruiter/RecruiterJobsPage"));

// Seller
const SellerProducts    = lazy(() => import("./pages/seller/SellerProductsPage"));

// Shared
const NotFoundPage      = lazy(() => import("./pages/NotFoundPage"));

// ─── Page Transition Wrapper ──────────────────────────────────────────────────
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.22, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// ─── Loading Fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center"
       style={{ background: "#F9F6F0" }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 rounded-full border-4 border-t-transparent"
      style={{ borderColor: "#2D5A27", borderTopColor: "transparent" }}
    />
  </div>
);

// ─── Protected Route ──────────────────────────────────────────────────────────
/**
 * Requires the user to be authenticated.
 * Redirects to /login with `from` state for post-login redirect.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but USER profile not complete, force profile setup
  if (user?.role === ROLES.USER && user?.is_profile_complete === false && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  return <Outlet />;
};

// ─── Role Gate ────────────────────────────────────────────────────────────────
/**
 * Restricts access to a route based on allowed roles.
 * @param {string[]} roles - Array of allowed role strings (from ROLES enum)
 * @param {string}   fallback - Where to redirect unauthorized users
 */
const RoleGate = ({ roles, fallback = "/home" }) => {
  const { role } = useAuth();

  if (!roles.includes(role)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

// ─── Public Route ─────────────────────────────────────────────────────────────
/**
 * Redirect already-authenticated users away from auth pages.
 */
const PublicRoute = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    const redirectMap = {
      [ROLES.ADMIN]:     "/admin/approvals",
      [ROLES.TRAINER]:   "/trainer/workshops",
      [ROLES.RECRUITER]: "/recruiter/jobs",
      [ROLES.SELLER]:    "/seller/products",
      [ROLES.USER]:      "/home",
    };
    return <Navigate to={redirectMap[role] ?? "/home"} replace />;
  }

  return <Outlet />;
};

// ─── Animated Route Outlet ────────────────────────────────────────────────────
const AnimatedOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Outlet />
      </PageTransition>
    </AnimatePresence>
  );
};

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>

          {/* ── Root Redirect ─────────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* ── Public / Auth Routes ──────────────────────────────────────── */}
          <Route element={<PublicRoute />}>
            <Route path="/login"        element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/register"     element={<PageTransition><RegisterPage /></PageTransition>} />
          </Route>

          {/* Verify-email and profile-setup are semi-public (accessible after register) */}
          <Route path="/verify-email"   element={<PageTransition><VerifyEmailPage /></PageTransition>} />
          <Route path="/profile-setup"  element={<PageTransition><ProfileSetupPage /></PageTransition>} />

          {/* Public pages for unauthenticated users */}
          <Route path="/home"          element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/jobs"          element={<PageTransition><JobsPage /></PageTransition>} />
          <Route path="/workshops"     element={<PageTransition><WorkshopsPage /></PageTransition>} />
          <Route path="/marketplace"   element={<PageTransition><MarketplacePage /></PageTransition>} />

          {/* ── Protected Routes (any authenticated user) ─────────────────── */}
          <Route element={<ProtectedRoute />}>

            {/* ── USER Routes ─────────────────────────────────────────────── */}
            <Route element={<RoleGate roles={[ROLES.USER, ROLES.ADMIN, ROLES.TRAINER, ROLES.RECRUITER, ROLES.SELLER]} />}>
              <Route path="/skill-pathway" element={<PageTransition><SkillPathwayPage /></PageTransition>} />
            </Route>

            {/* ── TRAINER Routes ───────────────────────────────────────────── */}
            <Route element={<RoleGate roles={[ROLES.TRAINER, ROLES.ADMIN]} fallback="/home" />}>
              <Route path="/trainer/workshops" element={<PageTransition><TrainerWorkshops /></PageTransition>} />
              <Route path="/trainer/analytics" element={<PageTransition><TrainerAnalytics /></PageTransition>} />
            </Route>

            {/* ── ADMIN Routes ─────────────────────────────────────────────── */}
            <Route element={<RoleGate roles={[ROLES.ADMIN]} fallback="/home" />}>
              <Route path="/admin/fraud-check" element={<PageTransition><AdminFraudCheck /></PageTransition>} />
              <Route path="/admin/approvals"   element={<PageTransition><AdminApprovals /></PageTransition>} />
              <Route path="/admin/users"        element={<PageTransition><AdminUsers /></PageTransition>} />
            </Route>

            {/* ── RECRUITER Routes ─────────────────────────────────────────── */}
            <Route element={<RoleGate roles={[ROLES.RECRUITER, ROLES.ADMIN]} fallback="/home" />}>
              <Route path="/recruiter/jobs"    element={<PageTransition><RecruiterJobs /></PageTransition>} />
            </Route>

            {/* ── SELLER Routes ────────────────────────────────────────────── */}
            <Route element={<RoleGate roles={[ROLES.SELLER, ROLES.ADMIN]} fallback="/home" />}>
              <Route path="/seller/products"   element={<PageTransition><SellerProducts /></PageTransition>} />
            </Route>

          </Route>

          {/* ── 404 ──────────────────────────────────────────────────────── */}
          <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />

        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;