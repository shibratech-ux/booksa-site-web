import { useEffect, useId, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { useAuthStore } from '@/store/auth.store';
import type { IdentityDetails, SelfieUploadInput } from '@/domain/identity-verification';
import { SelfieSubmissionError, submitCurrentUserIdentityVerification, type SelfieSubmissionErrorCode } from '@/services/identity-verification.service';
import { ListingVerificationSubmittedPage } from './ListingVerificationSubmittedPage';

type CameraIssue = 'denied' | 'missing' | 'unavailable' | 'interrupted';
const stopCamera = (stream: MediaStream | null) => {
  stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
};

export function ListingSelfieCapturePage({ details, onBack, onComplete }: { details: IdentityDetails; onBack: () => void; onComplete: () => void }) {
  const { t } = useTranslation('dashboard');
  const id = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoRef = useRef<string | null>(null);
  const captureVersion = useRef(0);
  const payloadRef = useRef<SelfieUploadInput | null>(null);
  const submittingRef = useRef(false);
  const [ownerUid] = useState(() => useAuthStore.getState().user?.id ?? '');
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [cameraIssue, setCameraIssue] = useState<CameraIssue | null>(null);
  const [captureError, setCaptureError] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<SelfieSubmissionErrorCode | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      captureVersion.current++;
      stopCamera(streamRef.current);
      if (photoRef.current) URL.revokeObjectURL(photoRef.current);
      payloadRef.current = null;
    };
  }, []);

  useEffect(() => { headingRef.current?.focus(); }, [photo]);

  useEffect(() => {
    if (photo) return;
    let cancelled = false;
    let media: MediaStream | null = null;
    const video = videoRef.current;
    setReady(false);
    setCameraIssue(null);
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraIssue('unavailable');
        return;
      }
      try {
        media = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }
        });
        if (cancelled || !video) { stopCamera(media); return; }
        streamRef.current = media;
        media.getVideoTracks().forEach(track => {
          track.onended = () => {
            if (cancelled) return;
            setReady(false);
            setCameraIssue('interrupted');
            stopCamera(media);
          };
        });
        video.srcObject = media;
        await video.play();
      } catch (error) {
        stopCamera(media);
        if (cancelled) return;
        const name = error instanceof DOMException ? error.name : '';
        setReady(false);
        setCameraIssue(name === 'NotAllowedError' || name === 'SecurityError'
          ? 'denied' : name === 'NotFoundError' ? 'missing' : 'unavailable');
      }
    };
    void start();
    return () => {
      cancelled = true;
      stopCamera(media);
      if (streamRef.current === media) streamRef.current = null;
      if (video) video.srcObject = null;
    };
  }, [attempt, photo]);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!ready || takingPhoto || !video || !video.videoWidth || !video.videoHeight) return;
    const version = ++captureVersion.current;
    setTakingPhoto(true);
    setCaptureError(false);
    const canvas = document.createElement('canvas');
    const sourceWidth = Math.min(video.videoWidth, video.videoHeight * 4 / 3);
    const sourceHeight = sourceWidth * 3 / 4;
    canvas.width = Math.min(1280, Math.round(sourceWidth));
    canvas.height = Math.round(canvas.width * 3 / 4);
    const context = canvas.getContext('2d');
    const fail = () => {
      if (captureVersion.current !== version) return;
      setTakingPhoto(false);
      setCaptureError(true);
    };
    if (!context) { fail(); return; }
    try {
      context.drawImage(video, (video.videoWidth - sourceWidth) / 2, (video.videoHeight - sourceHeight) / 2,
        sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (captureVersion.current !== version) return;
        if (!blob) { fail(); return; }
        const url = URL.createObjectURL(blob);
        if (photoRef.current) URL.revokeObjectURL(photoRef.current);
        photoRef.current = url;
        payloadRef.current = { photoId: crypto.randomUUID(), expectedOwnerUid: ownerUid, image: blob, width: canvas.width, height: canvas.height };
        stopCamera(streamRef.current);
        setReady(false);
        setPhoto(url);
        setTakingPhoto(false);
      }, 'image/jpeg', 0.92);
    } catch { fail(); }
  };

  const retake = () => {
    captureVersion.current++;
    if (photoRef.current) URL.revokeObjectURL(photoRef.current);
    photoRef.current = null;
    payloadRef.current = null;
    setReady(false);
    setTakingPhoto(false);
    setCaptureError(false);
    setSubmissionError(null);
    setPhoto(null);
  };

  const submitPhoto = async () => {
    if (submittingRef.current || !payloadRef.current) return;
    const version = captureVersion.current;
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      await submitCurrentUserIdentityVerification(details, payloadRef.current);
      if (captureVersion.current !== version) return;
      if (photoRef.current) URL.revokeObjectURL(photoRef.current);
      photoRef.current = null;
      payloadRef.current = null;
      setSubmitted(true);
    } catch (error) {
      if (captureVersion.current === version) {
        setSubmissionError(error instanceof SelfieSubmissionError ? error.code : 'save-failed');
      }
    } finally {
      submittingRef.current = false;
      if (captureVersion.current === version) setIsSubmitting(false);
    }
  };

  if (submitted) return <ListingVerificationSubmittedPage onDone={onComplete} />;

  return (
    <section aria-labelledby={`${id}-title`} className="flex min-h-dvh flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[600px] flex-1">
        <header className="px-6 py-2 sm:pt-6">
          <BackButton label={t(photo ? 'identitySelfieCapture.backToCamera' : 'identitySelfieCapture.back')} onClick={photo ? retake : onBack} disabled={isSubmitting} className="-ml-3" />
        </header>
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
          {photo ? (
            <ShimmerImage src={photo} alt={t('identitySelfieCapture.photoAlt')} className="h-full w-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay muted playsInline disablePictureInPicture disableRemotePlayback
              aria-label={t('identitySelfieCapture.livePreview')}
              onPlaying={() => { if (streamRef.current?.active && videoRef.current?.videoWidth) setReady(true); }}
              className="h-full w-full -scale-x-100 object-cover"
            />
          )}
          {(photo || ready) ? <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" /> : null}
          {!photo && !ready ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-surface-muted)] px-6 text-center">
              <CameraOff className="h-7 w-7 text-[var(--color-text-secondary)]" strokeWidth={1.5} aria-hidden="true" />
              <p role={cameraIssue ? 'alert' : 'status'} className="max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
                {cameraIssue ? t(`identitySelfieCapture.errors.${cameraIssue}`) : t('identitySelfieCapture.starting')}
              </p>
              {cameraIssue ? <button type="button" onClick={() => setAttempt(current => current + 1)} className="min-h-11 rounded-button border border-[var(--color-border)] px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{t('identitySelfieCapture.retry')}</button> : null}
            </div>
          ) : null}
        </div>

        <div className="px-6 pb-8 pt-2">
          <h1 id={`${id}-title`} ref={headingRef} tabIndex={-1} className="text-2xl font-semibold leading-tight tracking-tight outline-none sm:text-[32px]">
            {t(photo ? 'identitySelfieCapture.reviewTitle' : 'identitySelfieCapture.title')}
          </h1>
          <p className="mt-2 text-base leading-5 text-[var(--color-text-secondary)] sm:leading-6">
            {t(photo ? 'identitySelfieCapture.reviewInstructions' : 'identitySelfieCapture.instructions')}
          </p>
          {captureError ? <p role="alert" className="mt-4 text-sm leading-6 text-[var(--color-danger)]">{t('identitySelfieCapture.captureError')}</p> : null}
          {submissionError ? <p role="alert" className="mt-4 rounded-card bg-[var(--color-surface-muted)] p-4 text-sm leading-6">{t(`identitySelfieSubmission.errors.${submissionError}`)}</p> : null}
        </div>
      </div>

      <footer className="sticky bottom-0 shrink-0 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-[600px] items-center justify-between gap-4 px-6 py-3">
          {photo ? <button type="button" onClick={retake} disabled={isSubmitting} className="-ml-2 min-h-11 rounded-button px-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50">{t('identitySelfieCapture.retake')}</button> : null}
          <button
            type="button"
            disabled={isSubmitting || (!photo && (!ready || takingPhoto))}
            aria-busy={takingPhoto || isSubmitting || undefined}
            onClick={photo ? () => void submitPhoto() : takePhoto}
            className={`inline-flex min-h-12 items-center justify-center gap-1.5 rounded-button bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] enabled:hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)] ${photo ? '' : 'w-full'}`}
          >
            {!photo ? <Camera className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> : null}
            {t(isSubmitting ? 'identitySelfieSubmission.uploading' : photo ? 'identitySelfieCapture.submit' : takingPhoto ? 'identitySelfieCapture.taking' : 'identitySelfieCapture.take')}
          </button>
        </div>
      </footer>
    </section>
  );
}
