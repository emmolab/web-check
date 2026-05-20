import { ComposableMap, Geographies, Geography, Annotation } from 'react-simple-maps';
import styled from '@emotion/styled';

import colors from 'client/styles/colors';
import MapFeatures from 'client/assets/data/map-features.json';

interface Props {
  lat: number;
  lon: number;
  label?: string;
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
    min-height: 220px;
  }
`;

const MapChart = (location: Props) => {
  const { lat, lon, label } = location;

  return (
    <MapShell>
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [0, 0, 0],
          center: [lon + 5, lat - 25],
          scale: 200,
        }}
      >
        <Geographies
          geography={MapFeatures}
          fill={colors.backgroundDarker}
          stroke={colors.primary}
          strokeWidth={0.5}
        >
          {({ geographies }: any) =>
            geographies.map((geo: any) => <Geography key={geo.rsmKey} geography={geo} />)
          }
        </Geographies>
        <Annotation
          subject={[lon, lat]}
          dx={-56}
          dy={-44}
          connectorProps={{
            stroke: colors.textColor,
            strokeWidth: 2,
            strokeLinecap: 'round',
          }}
        >
          <text x="-8" textAnchor="end" fill={colors.textColor} fontSize={16}>
            {label || 'Server'}
          </text>
        </Annotation>
      </ComposableMap>
    </MapShell>
  );
};

export default MapChart;
