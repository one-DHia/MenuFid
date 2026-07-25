import CustomerMenu from '@/components/CustomerMenu';

interface PageProps {
  params: Promise<{ hostname: string }>;
}

export default async function Page({ params }: PageProps) {
  const { hostname } = await params;
  return <CustomerMenu hostname={hostname} />;
}
