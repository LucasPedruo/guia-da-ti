import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type LoadingImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: ReactNode;
  imageClassName?: string;
};

export function LoadingImage(props: LoadingImageProps) {
  return <ImageContent key={props.src} {...props} />;
}

function ImageContent({ className, imageClassName, fallback, loading = 'lazy', onLoad, onError, ...props }: LoadingImageProps) {
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  useEffect(() => {
    if (image.current?.complete)
      setState(image.current.naturalWidth > 0 ? 'loaded' : 'failed');
  }, []);
  return <div data-image-state={state} className={cn('relative block overflow-hidden', className)}>
    {state === 'loading' && <Skeleton className="absolute inset-0 size-full rounded-none" />}
    {state === 'failed' ? fallback ?? <span aria-hidden="true" className="block size-full bg-muted" /> : <img
      {...props}
      ref={image}
      loading={loading}
      decoding="async"
      onLoad={event => { setState('loaded'); onLoad?.(event); }}
      onError={event => { setState('failed'); onError?.(event); }}
      className={cn('size-full transition-opacity duration-200 motion-reduce:transition-none', state === 'loaded' ? 'opacity-100' : 'opacity-0', imageClassName)}
    />}
  </div>;
}
