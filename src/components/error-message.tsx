interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="mt-2 text-sm text-red-600">{message}</p>
      </div>
    </div>
  );
} 