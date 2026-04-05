import { API_URL } from "./config";

type RequestOptions = {
  token?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

function sanitizePayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const entries = Object.entries(payload as Record<string, unknown>);
  return entries.reduce<Record<string, unknown>>(
    (accumulator, [key, value]) => {
      if (
        ["password", "token", "authorization", "jwt"].includes(
          key.toLowerCase(),
        )
      ) {
        accumulator[key] = "***";
        return accumulator;
      }

      accumulator[key] = value;
      return accumulator;
    },
    {},
  );
}

/**
 * Upload a local file to the backend using multipart/form-data.
 * `imagePath` should be a file:// URI from expo-image-picker.
 * The file is appended under the field name `imageUrl` which matches
 * the multer `upload.single("imageUrl")` middleware used by the backend.
 */
export async function apiRequestMultipart<T>(
  path: string,
  imagePath: string,
  extraFields: Record<string, string> = {},
  options: {
    token?: string;
    method?: "POST" | "PUT" | "PATCH";
    fileFieldName?: string;
  } = {},
): Promise<T> {
  const { token, method = "POST", fileFieldName = "imageUrl" } = options;
  const url = `${API_URL}${path}`;

  const filename = imagePath.split("/").pop() ?? "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  const formData = new FormData();
  // React Native FormData accepts this object shape for file entries
  formData.append(fileFieldName, {
    uri: imagePath,
    name: filename,
    type,
  } as unknown as Blob);
  Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));

  if (__DEV__) {
    console.log("[API Multipart]", {
      method,
      url,
      filename,
      fileFieldName,
      extraFields,
    });
  }

  const response = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type; fetch sets it automatically with boundary
    },
    body: formData,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (__DEV__) {
    console.log("[API Multipart Response]", {
      status: response.status,
      ok: response.ok,
      data,
    });
  }

  if (!response.ok) {
    throw new Error(data?.message || "Upload failed");
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, method = "GET", body } = options;
  const url = `${API_URL}${path}`;

  if (__DEV__) {
    console.log("[API Request]", {
      method,
      url,
      body: sanitizePayload(body),
    });
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (__DEV__) {
    console.log("[API Response]", {
      method,
      url,
      status: response.status,
      ok: response.ok,
      data: sanitizePayload(data),
    });
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}
