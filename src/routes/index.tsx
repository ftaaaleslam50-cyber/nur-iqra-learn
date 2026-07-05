import { createFileRoute, redirect } from "@tanstack/react-router";

// The home route just routes users to the right place based on session.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("lms:session:v1");
      if (raw) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "isRedirect" in e) throw e;
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
