import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { getMyAttendance } from '../../services/attendance';

export function StudentAttendancePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const a = await getMyAttendance();
        if (ignore) return;
        setData(a);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load attendance');
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const pieData = useMemo(() => {
    const total = data?.total || 0;
    const present = data?.presentCount || 0;
    const absent = Math.max(0, total - present);
    return [
      { name: 'Present', value: present, fill: '#7c3aed' },
      { name: 'Absent', value: absent, fill: '#fb7185' },
    ];
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{data?.percentage || 0}%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Overall percentage</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{data?.presentCount || 0}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Days present/late</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{data?.total || 0}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Marked days</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie dataKey="value" data={pieData} innerRadius={55} outerRadius={90} paddingAngle={3} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

