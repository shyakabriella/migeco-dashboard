import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

const data = [
  { name: 'Minor Edits', value: 68, color: '#6366f1' },
  { name: 'Major Releases', value: 32, color: '#d946ef' },
];

const RevisionTypes = () => {
  return (
    <div className="bg-[#15162B] border border-[#1E203B] rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">Revision Types</h3>
        <p className="text-sm text-slate-500">Major vs. Minor Revision Distribution</p>
      </div>

      <div className="flex-1 relative min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as any;
                  return (
                    <g>
                      <text
                        x={cx}
                        y={cy - 10}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-white text-3xl font-bold"
                      >
                        2.4k
                      </text>
                      <text
                        x={cx}
                        y={cy + 15}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-slate-500 text-[10px] font-bold uppercase tracking-widest"
                      >
                        Total Edits
                      </text>
                    </g>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            <span className="text-slate-400 font-medium">Minor Edits (vX.1)</span>
          </div>
          <span className="text-white font-bold">68%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500"></div>
            <span className="text-slate-400 font-medium">Major Releases (vX.0)</span>
          </div>
          <span className="text-white font-bold">32%</span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#1E203B] text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Most Active Department</p>
        <p className="text-sm font-bold text-white">Engineering & Design</p>
      </div>
    </div>
  );
};

export default RevisionTypes;
