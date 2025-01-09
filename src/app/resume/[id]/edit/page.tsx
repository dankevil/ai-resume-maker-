import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ResumeForm } from '@/components/resume-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumeEditPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!resume) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Resume</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <ResumeForm 
            initialData={resume}
            resumeId={id}
          />
        </div>
      </div>
    </div>
  );
} 