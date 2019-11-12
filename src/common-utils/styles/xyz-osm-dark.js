export default {
  version: 8,
  name: 'XYZ Dark (OSM)',
  metadata: {},
  sources: {
    osm: {
      type: 'vector',
      tiles: [
        'https://xyz.api.here.com/tiles/osmbase/256/all/{z}/{x}/{y}.mvt',
      ],
    },
    natural_earth_2: {
      maxzoom: 5,
      tileSize: 512,
      tiles: [
        '',
      ],
      type: 'raster',
    },
  },
  sprite: 'https://s3-us-west-1.amazonaws.com/osm-vector-tiles-apollomapping/sprites/apollo-bright-icons',
  glyphs: 'https://s3-us-west-1.amazonaws.com/osm-vector-tiles-apollomapping/tile_fonts/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      filter: [
        'all',
      ],
      paint: {
        'background-color': 'rgba(9, 13, 30, 1)',
        'background-opacity': 1,
      },
    },
    {
      id: 'natural_earth',
      type: 'raster',
      source: 'natural_earth_2',
      maxzoom: 5,
      layout: {
        visibility: 'visible',
      },
      paint: {
        'raster-opacity': {
          base: 1.5,
          stops: [
            [
              0,
              0.6,
            ],
            [
              6,
              0.1,
            ],
          ],
        },
      },
    },
    {
      id: 'water-fill',
      type: 'fill',
      source: 'osm',
      'source-layer': 'water',
      filter: [
        'all',
        [
          '==',
          '$type',
          'Polygon',
        ],
      ],
      paint: {
        'fill-color': 'rgba(19, 37, 52, 1)',
        'fill-opacity': 1,
      },
    },
    {
      id: 'country-boundary-line',
      type: 'line',
      source: 'osm',
      'source-layer': 'boundaries',
      minzoom: 1,
      filter: [
        '==',
        'kind_detail',
        '2',
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': 'rgba(59, 59, 59, 1)',
        'line-width': {
          base: 1,
          stops: [
            [
              1,
              0.7,
            ],
            [
              8,
              2,
            ],
          ],
        },
      },
    },
    {
      id: 'state-boundary',
      type: 'line',
      source: 'osm',
      'source-layer': 'boundaries',
      maxzoom: 17,
      filter: [
        '==',
        'kind_detail',
        '4',
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      paint: {
        'line-color': 'rgba(59, 59, 59, 1)',
        'line-width': {
          base: 1,
          stops: [
            [
              5,
              1,
            ],
            [
              7,
              3,
            ],
          ],
        },
      },
    },
  ],
  id: 'xyz-osm-dark',
};
