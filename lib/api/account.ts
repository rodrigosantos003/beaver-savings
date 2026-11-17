import { request } from './index';

/** Everything the API stores about the signed-in user (GDPR access / portability). */
export function exportAccountData() {
  return request<Record<string, unknown>>('/account/export');
}
