import { Card, CardContent, CardHeader } from '@/shared/ui/Card';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-sm text-white/60">Authorization</div>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
