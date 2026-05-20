import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import colors from 'client/styles/colors';

interface Props {
  lat: number;
  lon: number;
  label?: string;
}

interface MapDeps {
  ComposableMap: any;
  Geographies: any;
  Geography: any;
  Marker: any;
  geography: any;
}

const MapShell = styled.div`
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid ${colors.borderSubtle};
  background: ${colors.surfaceAccent};

  svg {
    display: block;
    width: 100%;
    height: auto;
    min-height: 240px;
  }
`;

const MapFallback = styled.div`
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textColorSecondary};
  font-size: 0.88rem;
`;

const MapChart = (location: Props) => {
  const { lat, lon, label } = location;
  const [deps, setDeps] = useState<MapDeps | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      import('react-simple-maps'),
      import('client/assets/data/map-features.json'),
    ]).then(([maps, geography]) => {
      if (!active) return;
      setDeps({
        ComposableMap: maps.ComposableMap,
        Geographies: maps.Geographies,
        Geography: maps.Geography,
        Marker: maps.Marker,
        geography: geography.default,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  if (!deps) {
    return (
      <MapShell>
        <MapFallback>Loading map…</MapFallback>
      </MapShell>
    );
  }

  const { ComposableMap, Geographies, Geography, Marker, geography } = deps;

  return (
    <MapShell>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [lon, lat],
          scale: 700,
        }}
      >
        <Geographies
          geography={geography}
          fill={colors.backgroundDarker}
          stroke={colors.primary}
          strokeWidth={0.5}
        >
          {({ geographies }: any) =>
            geographies.map((geo: any) => <Geography key={geo.rsmKey} geography={geo} />)
          }
        </Geographies>
        <Marker coordinates={[lon, lat]}>
          <circle
            r={6}
            fill={colors.primary}
            stroke={colors.background}
            strokeWidth={2}
          />
          <circle r={12} fill={colors.primaryTransparent} />
        </Marker>
      </ComposableMap>
    </MapShell>
  );
};

export default MapChart;
