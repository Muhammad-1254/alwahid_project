import React from "react";
import { useAuth } from "@/src/hooks/auth";
import { Redirect, Slot, Stack } from "expo-router";
import { AppState } from "react-native";
import { supabase } from "@/src/lib/supabase";

export default function _layout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href={"(tabs)"} />;
  }
  // Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

  return<Slot  />;

}
