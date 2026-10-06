// Natural Earth 1:110m land boundaries, public domain; local SVG for production.
import {readFile,writeFile} from 'node:fs/promises';
const source='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';
const geo=process.argv[2]?JSON.parse(await readFile(process.argv[2],'utf8')):await(await fetch(source)).json();
const paths=geo.features.flatMap(feature=>{
  const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
  return polygons.map(polygon=>polygon.map(ring=>ring.map(([lon,lat],i)=>(i?'L':'M')+((lon+180)*2).toFixed(1)+','+((90-lat)*2).toFixed(1)).join('')+'Z').join(''));
});
await writeFile(new URL('../src/data/world-land.json',import.meta.url),JSON.stringify({source,license:'Public domain — Natural Earth',paths})+'\n');
console.log('World map: '+paths.length+' land polygons.');
