import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, MapPin, Trophy, Target, Calendar } from "lucide-react";
import { useState } from "react";

interface CampaignAnalyticsProps {
  campaignData: {
    title: string;
    artist: string;
    streams: string;
  };
}

export function CampaignAnalytics({ campaignData }: CampaignAnalyticsProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("mexico");
  const [selectedCity, setSelectedCity] = useState<string>("cdmx");

  // Datos de evolución de playlists (últimos 90 días)
  const playlistEvolution = [
    { day: 30, playlists: 45 },
    { day: 60, playlists: 128 },
    { day: 90, playlists: 342 },
    { day: 120, playlists: 456 },
    { day: 150, playlists: 578 },
    { day: 180, playlists: 634 },
  ];

  // Datos de ranking por países (mostrando solo los últimos 6 puntos)
  const countryRankings = {
    mexico: [
      { day: 30, rank: 45 },
      { day: 60, rank: 23 },
      { day: 90, rank: 12 },
      { day: 120, rank: 8 },
      { day: 150, rank: 5 },
      { day: 180, rank: 3 },
    ],
    colombia: [
      { day: 30, rank: 78 },
      { day: 60, rank: 34 },
      { day: 90, rank: 18 },
      { day: 120, rank: 12 },
      { day: 150, rank: 7 },
      { day: 180, rank: 5 },
    ],
    argentina: [
      { day: 30, rank: 89 },
      { day: 60, rank: 45 },
      { day: 90, rank: 25 },
      { day: 120, rank: 15 },
      { day: 150, rank: 9 },
      { day: 180, rank: 6 },
    ]
  };

  // Datos de ranking por ciudades  
  const cityRankings = {
    cdmx: [
      { day: 30, rank: 23 },
      { day: 60, rank: 12 },
      { day: 90, rank: 6 },
      { day: 120, rank: 4 },
      { day: 150, rank: 2 },
      { day: 180, rank: 1 },
    ],
    bogota: [
      { day: 30, rank: 34 },
      { day: 60, rank: 18 },
      { day: 90, rank: 8 },
      { day: 120, rank: 5 },
      { day: 150, rank: 3 },
      { day: 180, rank: 2 },
    ],
    miami: [
      { day: 30, rank: 56 },
      { day: 60, rank: 28 },
      { day: 90, rank: 15 },
      { day: 120, rank: 9 },
      { day: 150, rank: 6 },
      { day: 180, rank: 4 },
    ]
  };

  // Top 20 ciudades
  const topCities = [
    { city: "Ciudad de México", country: "México", playlists: 234, rank: 1 },
    { city: "Bogotá", country: "Colombia", playlists: 189, rank: 2 },
    { city: "Miami", country: "Estados Unidos", playlists: 156, rank: 3 },
    { city: "Buenos Aires", country: "Argentina", playlists: 134, rank: 4 },
    { city: "Guadalajara", country: "México", playlists: 123, rank: 5 },
    { city: "Medellín", country: "Colombia", playlists: 112, rank: 6 },
    { city: "Santiago", country: "Chile", playlists: 98, rank: 7 },
    { city: "Lima", country: "Perú", playlists: 87, rank: 8 },
    { city: "Monterrey", country: "México", playlists: 76, rank: 9 },
    { city: "Caracas", country: "Venezuela", playlists: 65, rank: 10 },
    { city: "San Juan", country: "Puerto Rico", playlists: 54, rank: 11 },
    { city: "Madrid", country: "España", playlists: 43, rank: 12 },
    { city: "Los Ángeles", country: "Estados Unidos", playlists: 38, rank: 13 },
    { city: "Barcelona", country: "España", playlists: 35, rank: 14 },
    { city: "Quito", country: "Ecuador", playlists: 29, rank: 15 },
    { city: "Cali", country: "Colombia", playlists: 25, rank: 16 },
    { city: "Valencia", country: "Venezuela", playlists: 22, rank: 17 },
    { city: "Puebla", country: "México", playlists: 19, rank: 18 },
    { city: "Tijuana", country: "México", playlists: 17, rank: 19 },
    { city: "Santo Domingo", country: "República Dominicana", playlists: 15, rank: 20 }
  ];

  // Top 10 países
  const topCountries = [
    { country: "México", playlists: 1247, rank: 1, growth: "+23%" },
    { country: "Colombia", playlists: 856, rank: 2, growth: "+18%" },
    { country: "Estados Unidos", playlists: 634, rank: 3, growth: "+15%" },
    { country: "Argentina", playlists: 523, rank: 4, growth: "+12%" },
    { country: "Chile", playlists: 345, rank: 5, growth: "+19%" },
    { country: "Perú", playlists: 287, rank: 6, growth: "+21%" },
    { country: "Venezuela", playlists: 234, rank: 7, growth: "+16%" },
    { country: "España", playlists: 198, rank: 8, growth: "+11%" },
    { country: "Puerto Rico", playlists: 156, rank: 9, growth: "+25%" },
    { country: "Ecuador", playlists: 134, rank: 10, growth: "+14%" }
  ];

  // Comparación con el #1
  const numberOneComparison = {
    artist: "Bad Bunny",
    song: "Monaco",
    playlists: 3456,
    myPlaylists: 634,
    difference: 2822,
    percentage: "18.3%"
  };

  const chartConfig = {
    playlists: {
      label: "Playlists",
      color: "hsl(var(--primary))",
    },
    rank: {
      label: "Ranking",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Evolución de Playlists - Últimos 90 días */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            📈 Evolución de Playlists - Últimos 90 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full aspect-auto overflow-hidden rounded-lg">
            <LineChart data={playlistEvolution}>
              <XAxis 
                dataKey="day" 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} días`}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(value) => `Día ${value}`}
              />
              <Line 
                type="monotone" 
                dataKey="playlists" 
                stroke="var(--color-playlists)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-playlists)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Evolución de Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking por País */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              🌎 Evolución Ranking por País
            </CardTitle>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mexico">México</SelectItem>
                <SelectItem value="colombia">Colombia</SelectItem>
                <SelectItem value="argentina">Argentina</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full aspect-auto overflow-hidden rounded-lg">
              <LineChart data={countryRankings[selectedCountry as keyof typeof countryRankings]} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Día ${value}`}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  reversed
                  domain={[1, 'dataMax + 10']}
                  allowDecimals={false}
                  tickFormatter={(value) => `#${value}`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [`#${value}`, 'Posición']}
                    labelFormatter={(value) => `Día ${value}`}
                  />}
                />
                <Line 
                  type="linear" 
                  dataKey="rank" 
                  stroke="var(--color-rank)" 
                  strokeWidth={3}
                  strokeLinecap="round"
                  dot={{ fill: "var(--color-rank)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ranking por Ciudad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              🏙️ Evolución Ranking por Ciudad
            </CardTitle>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cdmx">Ciudad de México</SelectItem>
                <SelectItem value="bogota">Bogotá</SelectItem>
                <SelectItem value="miami">Miami</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full aspect-auto overflow-hidden rounded-lg">
              <LineChart data={cityRankings[selectedCity as keyof typeof cityRankings]} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Día ${value}`}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  reversed
                  domain={[1, 'dataMax + 5']}
                  allowDecimals={false}
                  tickFormatter={(value) => `#${value}`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [`#${value}`, 'Posición']}
                    labelFormatter={(value) => `Día ${value}`}
                  />}
                />
                <Line 
                  type="linear" 
                  dataKey="rank" 
                  stroke="var(--color-rank)" 
                  strokeWidth={3}
                  strokeLinecap="round"
                  dot={{ fill: "var(--color-rank)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparación con el #1 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            👑 Comparación con el #1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-800">#{1} Actual</h3>
                  <p className="text-sm text-yellow-600">{numberOneComparison.artist} - {numberOneComparison.song}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-800 mb-2">{numberOneComparison.playlists.toLocaleString()}</div>
              <p className="text-sm text-yellow-600">playlists totales</p>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-blue-800">Tu Posición</h3>
                  <p className="text-sm text-blue-600">{campaignData.artist} - {campaignData.title}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-800 mb-2">{numberOneComparison.myPlaylists.toLocaleString()}</div>
              <p className="text-sm text-blue-600">
                {numberOneComparison.percentage} del #1 
                <span className="text-red-500 ml-2">(-{numberOneComparison.difference.toLocaleString()})</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Países */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top 10 Países</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead className="text-right">Playlists</TableHead>
                  <TableHead className="text-right">Crecimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCountries.map((country) => (
                  <TableRow key={country.rank}>
                    <TableCell className="font-medium">{country.rank}</TableCell>
                    <TableCell>{country.country}</TableCell>
                    <TableCell className="text-right font-medium">{country.playlists.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {country.growth}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top 20 Ciudades */}
        <Card>
          <CardHeader>
            <CardTitle>🌟 Top 20 Ciudades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead className="text-right">Playlists</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCities.map((city) => (
                    <TableRow key={city.rank}>
                      <TableCell className="font-medium">{city.rank}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{city.city}</div>
                          <div className="text-sm text-muted-foreground">{city.country}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{city.playlists}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}