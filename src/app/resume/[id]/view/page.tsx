import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ResumeRenderer } from '@/components/resume-renderer';

export default async function ResumeViewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!resume) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <ResumeRenderer resume={resume} />
        </div>
      </div>
    </div>
  );
} 