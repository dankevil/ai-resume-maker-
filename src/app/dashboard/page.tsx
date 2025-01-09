import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Resume = {
  id: string;
  title: string;
  updatedAt: Date;
  templateId: string;
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const resumes = await prisma.resume.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      templateId: true,
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <a
          href="/resume/create"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Create New Resume
        </a>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No resumes found. Create your first resume!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume: Resume) => (
            <div
              key={resume.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{resume.title}</h2>
              <p className="text-muted-foreground mb-4">
                Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <a
                  href={`/resume/${resume.id}/edit`}
                  className="text-primary hover:underline"
                >
                  Edit
                </a>
                <a
                  href={`/resume/${resume.id}/view`}
                  className="text-primary hover:underline"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 