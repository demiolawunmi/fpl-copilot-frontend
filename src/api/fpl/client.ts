import { debugLog } from "./debug";

export async function fetchJson<T = any>(url: string): Promise<T> {
    debugLog("[FPL] GET", url);

    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        debugLog("[FPL] ERROR", res.status, text);
        throw new Error(`FPL request failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as T;
    debugLog("[FPL] OK", url, data);
    return data;
}
