const fs = require('fs');

let overview = fs.readFileSync('src/components/OverviewCharts.tsx', 'utf8');

// Inject imports
overview = overview.replace(
  "import DynamicIcon from './DynamicIcon';",
  "import DynamicIcon from './DynamicIcon';\nimport { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';"
);

// We need a color palette for the pie chart.
const getCatColorHex = `
  const getCatColorHex = (catName: string, dark: boolean) => {
    const name = catName.toLowerCase();
    if (name.includes('food')) return dark ? '#fb923c' : '#ea580c';
    if (name.includes('util')) return dark ? '#fbbf24' : '#d97706';
    if (name.includes('enter')) return dark ? '#f472b6' : '#db2777';
    if (name.includes('transp')) return dark ? '#60a5fa' : '#2563eb';
    if (name.includes('shop')) return dark ? '#c084fc' : '#9333ea';
    if (name.includes('sal')) return dark ? '#34d399' : '#059669';
    if (name.includes('transf')) return dark ? '#818cf8' : '#4f46e5';
    return dark ? '#a3a3a3' : '#525252';
  };
`;

overview = overview.replace(
  '  const getCatColor = ',
  getCatColorHex + '\n  const getCatColor = '
);

// We replace the progress bars logic with a pie chart layout
const pieChartUI = `
            {/* Pie Chart Visuals */}
            <div className="h-64 w-full mt-4 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="amountPHP"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={getCatColorHex(entry.name, isDark)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, 'PHP')}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', background: isDark ? '#171717' : '#ffffff', color: isDark ? '#f5f5f5' : '#171717' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Premium Category rows with spacious negative space */}
            <div className="grid grid-cols-1 gap-5">
`;

// Replace from '            {/* Premium Category rows' to before '{categorySpending.map((cat) => {'
overview = overview.replace(
  '            {/* Premium Category rows with spacious negative space */}\n            <div className="grid grid-cols-1 gap-5">',
  pieChartUI
);

// Remove the individual progress bars inside the map
// Let's locate the div for the track bar
const trackBarRegex = /                    \{\/\* Minimal custom accent track bar \*\/\}\n                    <div className=\{\`h-1\.5 w-full rounded-full overflow-hidden \$\{[\s\S]*?<\/div>\n                  <\/div>/g;
overview = overview.replace(trackBarRegex, '                  </div>');

fs.writeFileSync('src/components/OverviewCharts.tsx', overview);
