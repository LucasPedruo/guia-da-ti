import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import land from './data/world-land.json';

export function WorldMap() {
  const ref=useRef<SVGSVGElement>(null);
  useEffect(()=>{
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const context=gsap.context(()=>{
        gsap.from(ref.current,{opacity:0,scale:0.85,transformOrigin:'50% 50%',duration:0.65,ease:'power2.out',clearProps:'opacity,transform'});
        gsap.from(ref.current!.querySelectorAll('path'),{fill:'var(--muted-foreground)',opacity:0.15,duration:0.5,stagger:{amount:0.3},ease:'power2.out',clearProps:'fill,opacity'});
      },ref);
      return ()=>context.revert();
    });
    return ()=>media.revert();
  },[]);
  return <div className="flex min-h-64 flex-col items-center justify-center gap-3">
    <svg ref={ref} viewBox="0 0 720 360" role="img" aria-label="Mapa do mundo inteiro selecionado" className="w-full">
      {land.paths.map((d,index)=><path key={index} d={d} className="fill-primary" />)}
    </svg>
    <p className="text-center text-xs text-muted-foreground">Comunidades internacionais · mundo inteiro</p>
    <p className="text-[10px] text-muted-foreground">Natural Earth</p>
  </div>;
}
