import { Card, CardContent, CardHeader } from '@/shared/ui/Card';

import { HomeActions } from '@/widgets/home/ui/HomeActions';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Tron Explorer</h1>
            <p className="text-sm text-white/60">
              JWT auth + TronGrid history + limits + pagination
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <HomeActions />
        </CardContent>
      </Card>
    </div>
  );
}
