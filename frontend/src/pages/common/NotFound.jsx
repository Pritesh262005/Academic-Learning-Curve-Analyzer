import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">The link you opened does not exist.</div>
        </CardHeader>
        <CardContent>
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

