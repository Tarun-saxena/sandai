import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, distributionResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/sand-samples/stats/diameter'),
          axios.get('http://localhost:5000/api/sand-samples/stats/diameter-distribution')
        ]);
        
        setStats(statsResponse.data);
        setDistribution(distributionResponse.data);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sand Sample Analysis Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Statistics
              </Typography>
              {stats && (
                <>
                  <Typography>Total Samples: {stats.totalSamples}</Typography>
                  <Typography>Average Diameter: {stats.avgDiameter.toFixed(2)}mm</Typography>
                  <Typography>Min Diameter: {stats.minDiameter.toFixed(2)}mm</Typography>
                  <Typography>Max Diameter: {stats.maxDiameter.toFixed(2)}mm</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution Bar Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Diameter Distribution
              </Typography>
              <BarChart
                width={800}
                height={400}
                data={distribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Size Distribution (Pie Chart)
              </Typography>
              <PieChart width={400} height={400}>
                <Pie
                  data={distribution}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;