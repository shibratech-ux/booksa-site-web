import {
  forwardRef,
  useEffect,
  useRef,
  type ForwardedRef,
  type ImgHTMLAttributes,
  type MutableRefObject
} from 'react';

type ShimmerImageProps = ImgHTMLAttributes<HTMLImageElement>;

const setForwardedRef = (
  forwardedRef: ForwardedRef<HTMLImageElement>,
  image: HTMLImageElement | null
) => {
  if (typeof forwardedRef === 'function') forwardedRef(image);
  else if (forwardedRef) (forwardedRef as MutableRefObject<HTMLImageElement | null>).current = image;
};

export const ShimmerImage = forwardRef<HTMLImageElement, ShimmerImageProps>(function ShimmerImage(
  { className = '', onError, onLoad, src, ...imageProps },
  forwardedRef
) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || !src) return;

    image.dataset.imageState = image.complete ? 'loaded' : 'loading';
  }, [src]);

  return (
    <img
      {...imageProps}
      ref={(image) => {
        imageRef.current = image;
        setForwardedRef(forwardedRef, image);
      }}
      src={src}
      data-image-state="loading"
      className={`shimmer-image ${className}`.trim()}
      onLoad={(event) => {
        event.currentTarget.dataset.imageState = 'loaded';
        onLoad?.(event);
      }}
      onError={(event) => {
        event.currentTarget.dataset.imageState = 'error';
        onError?.(event);
      }}
    />
  );
});
