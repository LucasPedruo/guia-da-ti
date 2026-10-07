import assert from 'node:assert/strict';

export async function checkScrollbarLayout({send,evaluate,waitFor,navigate,click,key}) {
  const geometry=`(()=>{const main=document.querySelector('main').getBoundingClientRect(),header=document.querySelector('.header-inner').getBoundingClientRect();return {left:main.left,width:main.width,headerLeft:header.left,headerWidth:header.width,scrolling:document.documentElement.scrollHeight>innerHeight}})()`;
  for(const width of [1440,390]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await navigate('/explorar/');
    const long=await evaluate(geometry);
    assert.equal(long.scrolling,true,'Long route must need a scrollbar');
    await navigate('/eventos/');
    const short=await evaluate(geometry);
    assert.equal(short.scrolling,false,'Short route must not need a scrollbar');
    console.log('Scrollbar geometry:',JSON.stringify({width,long,short}));
    for(const property of ['left','width','headerLeft','headerWidth'])assert.ok(Math.abs(long[property]-short[property])<0.5,`Route shifted ${property}: ${JSON.stringify({long,short})}`);
    for(const route of ['/comunidades/','/comunidades/?publico=male']) {
      await navigate(route);
      const before=await evaluate(geometry);
      await click(`[...document.querySelectorAll('main button')].find(button=>button.textContent.includes('Filtrar comunidades'))`);
      await waitFor(`!!document.querySelector('[role="dialog"]')`);
      const during=await evaluate(geometry);
      for(const property of ['left','width','headerLeft','headerWidth'])assert.ok(Math.abs(before[property]-during[property])<0.5,`Dialog shifted ${property}: ${JSON.stringify({before,during})}`);
      await key('Escape');
      await waitFor(`!document.querySelector('[role="dialog"]')`);
      const after=await evaluate(geometry);
      assert.ok(Math.abs(before.width-after.width)<0.5 && Math.abs(before.left-after.left)<0.5,'Closing dialog shifted layout');
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  console.log('Scrollbar layout OK: long/short routes and dialog scroll locks keep content aligned on desktop and mobile.');
}
