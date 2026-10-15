import { API_URL } from "../constants";

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message?: string,
    ) {
        super(message ?? `Request failed (${status})`);
        this.name = 'HttpError';
    }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!res.ok) throw new HttpError(res.status);
    return res.status === 204 ? (undefined as T) : res.json();
}

export function withQuery(path: string, params: Record<string, string>) {
    return `${path}?${new URLSearchParams(params)}`;
}