import { Button } from '@/components/ui/Button';
import googleLogo from '@/assets/images/google-logo.png';
import appleLogo from '@/assets/images/appel-logo.png';

interface SocialLoginButtonsProps {
  loading: boolean;
  onGoogle: () => void;
  onApple: () => void;
}

export function SocialLoginButtons({ loading, onGoogle, onApple }: SocialLoginButtonsProps) {
  return (
    <div className="grid w-full gap-3">
      <Button
        variant="outline"
        loading={loading}
        onClick={onGoogle}
        className="relative w-full"
        leftIcon={<img src={googleLogo} alt="" className="absolute left-5 h-5 w-5 object-contain" />}
      >
        Continue with Google
      </Button>
      <Button
        variant="outline"
        disabled={loading}
        onClick={onApple}
        className="relative w-full"
        leftIcon={<img src={appleLogo} alt="" className="absolute left-5 h-5 w-5 object-contain dark:invert" />}
      >
        Continue with Apple
      </Button>
    </div>
  );
}
