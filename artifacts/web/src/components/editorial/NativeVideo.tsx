import type { VideoHTMLAttributes } from 'react';

export default function NativeVideo({ className = '', ...rest }: VideoHTMLAttributes<HTMLVideoElement>) {
  return <video controls playsInline preload="metadata" {...rest} className={`mx-auto block h-auto max-h-[80vh] w-full object-contain ${className}`} />;
}
