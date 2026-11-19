'use client';

import { SyntheticEvent, useState } from 'react';

import { useFormatter, useTranslations } from 'next-intl';

import { PasskeyIcon } from '@/components/auth/CredentialsForm';
import { Link } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { isPasskeyCancelled, passkeyErrorCode, usePasskeySupport } from '@/lib/passkey';

const MAX_NAME_LENGTH = 64;

export function PasskeysCard() {
  const t = useTranslations('passkeys');
  const format = useFormatter();
  const supported = usePasskeySupport();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: passkeys, isPending: listPending } = authClient.useListPasskeys();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function onAdd(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setAdding(true);

    try {
      const { error } = await authClient.passkey.addPasskey({
        name: name.trim() || undefined,
      });

      if (error) {
        if (isPasskeyCancelled(error)) return;
        setError(
          t(
            passkeyErrorCode(error) === 'PREVIOUSLY_REGISTERED' ? 'alreadyRegistered' : 'addFailed',
          ),
        );
        return;
      }

      setName('');
    } catch (error) {
      console.error(error);
      setError(t('addFailed'));
    } finally {
      setAdding(false);
    }
  }

  async function onRemove(id: string) {
    setError('');
    setRemovingId(id);

    try {
      const { error } = await authClient.passkey.deletePasskey({ id });
      if (error) setError(t('removeFailed'));
    } catch (error) {
      console.error(error);
      setError(t('removeFailed'));
    } finally {
      setRemovingId(null);
    }
  }

  if (sessionPending) {
    return <div className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white" />;
  }

  if (!session) {
    return (
      <Card>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-3 text-stone-600">{t('signInRequired')}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover"
        >
          {t('signIn')}
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-beaver-100 text-beaver-700">
          <PasskeyIcon />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-stone-600">{t('description')}</p>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-stone-900">{t('yourPasskeys')}</h2>
        {listPending ? (
          <div className="mt-3 h-14 animate-pulse rounded-xl bg-stone-100" />
        ) : passkeys && passkeys.length > 0 ? (
          <ul className="mt-3 divide-y divide-stone-100 rounded-xl border border-stone-200">
            {passkeys.map((passkey) => (
              <li key={passkey.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {passkey.name || t('unnamed')}
                  </p>
                  <p className="text-xs text-stone-500">
                    {t('addedOn', {
                      date: format.dateTime(new Date(passkey.createdAt), { dateStyle: 'medium' }),
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={removingId !== null}
                  onClick={() => onRemove(passkey.id)}
                  className="shrink-0 text-sm font-medium text-red-600 transition-colors hover:text-red-800 disabled:opacity-50"
                >
                  {removingId === passkey.id ? t('removing') : t('remove')}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-stone-500">{t('empty')}</p>
        )}
      </section>

      {supported ? (
        <form onSubmit={onAdd} className="mt-6 flex flex-col gap-3">
          <label className="block text-sm font-medium text-stone-700">
            {t('nameLabel')}
            <input
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-beaver-400 focus:ring-2 focus:ring-beaver-100"
              name="passkeyName"
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={adding}
            className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:opacity-60"
          >
            {adding ? t('adding') : t('add')}
          </button>
        </form>
      ) : (
        <p className="mt-6 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
          {t('unsupported')}
        </p>
      )}

      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">{children}</div>
  );
}
