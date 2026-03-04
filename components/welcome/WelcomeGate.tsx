"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { WelcomeFlow } from "./WelcomeFlow";

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) setChecked(true);
  }, [loading]);

  const showWelcome =
    checked &&
    user &&
    !dismissed &&
    !(user.user_metadata && (user.user_metadata as Record<string, unknown>).welcome_completed);

  async function handleComplete() {
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { welcome_completed: true } });
    setDismissed(true);
  }

  return (
    <>
      {children}
      {showWelcome && <WelcomeFlow onComplete={handleComplete} />}
    </>
  );
}
