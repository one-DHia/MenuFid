import CustomerMenu from '@/components/CustomerMenu';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <CustomerMenu slug={slug} />;
}
