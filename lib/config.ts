import Constants from "expo-constants";

function getHostFromExpo() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (
      Constants as unknown as {
        manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
      }
    ).manifest2?.extra?.expoGo?.debuggerHost ??
    "";

  if (!hostUri) return "";
  return hostUri.split(":")[0];
}

const extraApiUrl =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  "";

const envApiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
const expoHost = getHostFromExpo();
const inferredLanApiUrl = expoHost ? `http://${expoHost}:8080` : "";

export const API_URL = (
  envApiUrl ||
  extraApiUrl ||
  inferredLanApiUrl ||
  "http://localhost:8080"
).replace(/\/$/, "");
