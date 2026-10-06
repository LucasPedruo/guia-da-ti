// Offline production asset from the IBGE simplified UF boundaries.
// Run: node scripts/prepare-brazil-map.mjs [downloaded GeoJSON]
import { readFile, writeFile } from 'node:fs/promises';
const source = 'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?intrarregiao=UF&formato=application/vnd.geo%2Bjson&qualidade=minima';
const geo = process.argv[2] ? JSON.parse(await readFile(process.argv[2], 'utf8')) : await (await fetch(source)).json();
const states = [
  [11,'RO','Rondônia','norte'],[12,'AC','Acre','norte'],[13,'AM','Amazonas','norte'],[14,'RR','Roraima','norte'],
  [15,'PA','Pará','norte'],[16,'AP','Amapá','norte'],[17,'TO','Tocantins','norte'],
  [21,'MA','Maranhão','nordeste'],[22,'PI','Piauí','nordeste'],[23,'CE','Ceará','nordeste'],[24,'RN','Rio Grande do Norte','nordeste'],
  [25,'PB','Paraíba','nordeste'],[26,'PE','Pernambuco','nordeste'],[27,'AL','Alagoas','nordeste'],[28,'SE','Sergipe','nordeste'],[29,'BA','Bahia','nordeste'],
  [31,'MG','Minas Gerais','sudeste'],[32,'ES','Espírito Santo','sudeste'],[33,'RJ','Rio de Janeiro','sudeste'],[35,'SP','São Paulo','sudeste'],
  [41,'PR','Paraná','sul'],[42,'SC','Santa Catarina','sul'],[43,'RS','Rio Grande do Sul','sul'],
  [50,'MS','Mato Grosso do Sul','centro-oeste'],[51,'MT','Mato Grosso','centro-oeste'],[52,'GO','Goiás','centro-oeste'],[53,'DF','Distrito Federal','centro-oeste'],
];
const project = ([lon,lat]) => [lon, -Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))*180/Math.PI];
const polygons = feature => feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
const points = geo.features.flatMap(feature => polygons(feature).flat(2).map(project));
const minX=Math.min(...points.map(p=>p[0])), maxX=Math.max(...points.map(p=>p[0]));
const minY=Math.min(...points.map(p=>p[1])), maxY=Math.max(...points.map(p=>p[1]));
const scale=Math.min(460/(maxX-minX),460/(maxY-minY));
const xy = point => {const [x,y]=project(point);return [(x-minX)*scale+20,(y-minY)*scale+20]};
const entries=states.map(([id,uf,name,region]) => {
  const feature=geo.features.find(f=>Number(f.properties.codarea)===id);
  if (!feature) throw Error('Missing UF: '+uf);
  const d=polygons(feature).map(polygon => polygon.map(ring=>ring.map((p,i)=> (i?'L':'M')+xy(p).map(v=>v.toFixed(1)).join(',')).join('')+'Z').join('')).join('');
  const ring=polygons(feature).sort((a,b)=>b[0].length-a[0].length)[0][0].map(xy);
  let area=0,cx=0,cy=0;
  for(let i=0;i<ring.length;i++) {
    const a=ring[i],b=ring[(i+1)%ring.length],cross=a[0]*b[1]-b[0]*a[1];
    area+=cross;cx+=(a[0]+b[0])*cross;cy+=(a[1]+b[1])*cross;
  }
  return {uf,name,region,d,x:Number((cx/(3*area)).toFixed(1)),y:Number((cy/(3*area)).toFixed(1))};
});
await writeFile(new URL('../src/data/brazil-states.json',import.meta.url),JSON.stringify({source,viewBox:'0 0 500 500',states:entries})+'\n');
console.log('Brazil map: '+entries.length+' UFs.');
