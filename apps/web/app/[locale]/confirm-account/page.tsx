import { VerifyEmailScreen } from '@/components/auth/VerifyEmailScreen';

type PageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ConfirmAccountPage({ searchParams }: PageProps) {
  const { token, error } = await searchParams;
  return <VerifyEmailScreen token={token} error={error} />;
}
