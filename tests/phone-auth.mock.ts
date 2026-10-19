export const phoneAuthState = {
  sent: [] as string[], linked: [] as string[], updated: [] as string[], cleared: 0,
  error: null as null | string,
  afterSend: null as null | (() => Promise<void> | void),
  afterConfirm: null as null | (() => void)
};
const challenges = new Map<string, string>();
export class RecaptchaVerifier {
  constructor(..._args: unknown[]) {}
  clear() { phoneAuthState.cleared++; }
}
export class PhoneAuthProvider {
  constructor(..._args: unknown[]) {}
  async verifyPhoneNumber(phone: string, _verifier: unknown) {
    if (phoneAuthState.error) throw { code: phoneAuthState.error };
    phoneAuthState.sent.push(phone);
    const id = `challenge-${phoneAuthState.sent.length}`;
    challenges.set(id, phone);
    await phoneAuthState.afterSend?.();
    return id;
  }
  static credential(id: string, pin: string) { return { id, pin }; }
}
function confirm(user: any, credential: { id: string; pin: string }) {
  if (phoneAuthState.error) throw { code: phoneAuthState.error };
  if (credential.pin !== '123456') throw { code: 'auth/invalid-verification-code' };
  const phone = challenges.get(credential.id);
  if (!phone) throw { code: 'auth/session-expired' };
  user.phoneNumber = phone;
  challenges.delete(credential.id);
  phoneAuthState.afterConfirm?.();
}
export async function linkWithCredential(user: any, credential: any) {
  confirm(user, credential);
  phoneAuthState.linked.push(user.uid);
  return { user };
}
export async function updatePhoneNumber(user: any, credential: any) {
  confirm(user, credential);
  phoneAuthState.updated.push(user.uid);
}
