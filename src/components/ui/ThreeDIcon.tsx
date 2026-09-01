import { useState, type ImgHTMLAttributes } from 'react';
import {
  getThreeDIconUrl,
  type ThreeDIconAngle,
  type ThreeDIconName,
  type ThreeDIconPalette,
  type ThreeDIconSize
} from '@/icons/threeDIcons';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

type ThreeDIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  name: ThreeDIconName;
  angle?: ThreeDIconAngle;
  palette?: ThreeDIconPalette;
  sourceSize?: ThreeDIconSize;
};

export function ThreeDIcon({
  name,
  angle,
  palette,
  sourceSize,
  alt = '',
  onError,
  ...imageProps
}: ThreeDIconProps) {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) return null;

  return (
    <ShimmerImage
      {...imageProps}
      src={getThreeDIconUrl(name, { angle, palette, size: sourceSize })}
      alt={alt}
      aria-hidden={alt ? imageProps['aria-hidden'] : true}
      decoding="async"
      onError={(event) => {
        setHasFailed(true);
        onError?.(event);
      }}
    />
  );
}
