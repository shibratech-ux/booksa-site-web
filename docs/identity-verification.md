# Selfie submission

The selfie upload uses the field and Storage path approved for this web flow:

- Storage: `users/{auth.uid}/identity-verification/selfies/{photoId}.jpg`
- Firestore: `users/{auth.uid}.identityVerificationSubmission.selfie`

`photoId` is a UUID generated once per captured image and retained for retries.
Firebase Storage objects have a path and generation, rather than a Firestore
document ID. The UUID is also included in the object's custom metadata.

The dictionary contains `id`, `storagePath`, `bucket`, `generation`, `contentType`,
`size` (bytes), `width`, `height`, `sha256`, and `uploadedAt` (Firestore server
timestamp). `users/{uid}.updatedAt` also receives a server timestamp. The image is
JPEG, at most 10 MiB, and validated before any upload. No download-token URL is
stored. Consumers should resolve the Storage path through authorized SDK access.

The write targets only the signed-in user's document. Session identity is checked
after asynchronous work and again after the transaction reads the profile. The
transaction merges only the selfie dictionary and `updatedAt`, preserving profile
fields, sibling submission fields, roles, and the existing `identityVerification`
field. It can create the uid document if it does not exist.

The success screen appears only after both Storage and Firestore acknowledge
success. It confirms receipt of a selfie, not verified identity. No email,
one-hour review guarantee, automated matching, or listing publication is triggered.
ID-document uploads, legal-name persistence, and review-method persistence remain
outside this selfie-only write.

The same UUID and image hash make committed retries idempotent. If the profile
write fails after upload, in-memory metadata allows retries without re-uploading
the image. Uploaded objects are retained on uncertain failures instead of risking
deleting an object referenced by an acknowledged-late write.

## Open integration items

- Confirm Flutter parity with this new field before merge; the mobile repository
  and its owner are not identified in this repository.
- The Firestore and Storage rules are not in this repository. Confirm that only
  the owner and authorized verification staff/server processes can access these
  identity images and metadata. Do not reuse publicly readable listing-photo rules.
- Agree on retention and server-side cleanup for abandoned or superseded uploads.
  In-memory retry metadata does not survive reloads or cancellation.
- Add a trusted verification worker, review lifecycle, approved biometric/privacy
  policy, and notifications before promising identity-review outcomes.
- Real-device camera behavior, production permissions, and live uploads are not
  exercised by the test suite; service tests use the Firebase test double only.

## Phone confirmation

The Phone number confirmation card opens a mobile-number form, then a six-digit
SMS PIN form. Firebase Phone Auth performs the verification with reCAPTCHA.
The credential is linked to the signed-in account, or updates its existing phone
provider, keeping the same uid. A number linked to another account is rejected;
this flow never signs in to or merges another account.

After Firebase accepts the credential, the service validates the Auth user's
phone number in international E.164 form and merges only the existing
`users/{auth.uid}.phoneNumber` field and `updatedAt` server timestamp. Other
profile fields are preserved, and a missing uid document can be created. No new
Firestore confirmation flags, collections, or Storage paths are introduced.
The card shows Completed only when the stored phone number matches the current
Firebase Auth user's verified phone number; a manually entered profile value is
insufficient. This verifies phone possession, not identity or listing publication.

Session checks run before Auth operations, after their completion and after the
transaction read. Challenges and PINs are kept only in memory and discarded on
exit. Resending replaces the active challenge, with a 60-second UI cooldown after
successful dispatch and Firebase throttling beyond that. If verification succeeds
but saving the profile fails, retrying (including after reopening) can save the
existing Auth-verified number without another SMS. Auth and Firestore cannot be
committed atomically; the completed UI appears only after the profile write.

Integration requirements:

- Enable the Phone provider, authorize the deployed web domain, and configure SMS
  region policy and billing/quota in Firebase. See the official
  [Firebase phone-auth setup](https://firebase.google.com/docs/auth/web/phone-auth).
- Linking a phone credential adds phone sign-in to the existing account. The SMS
  consent copy explains this and Google's spam-prevention processing.
- Confirm the existing `phoneNumber` field's E.164 format with Flutter. The new
  completion display uses Firebase Auth as the source of verified-phone status.
- Rules are outside this repository: review owner-only profile access and the
  Auth token's `phone_number` claim if trusted verification is required at the
  Firestore boundary. Existing profile editing can also write `phoneNumber`, so
  the presence of that field alone must never be treated as verified by consumers.
- The service tests replace Firebase Auth and Firestore with test doubles. Real
  SMS delivery, reCAPTCHA, authorized-domain behavior and browser/device layouts
  still need integration checks. No live Firebase writes were run for this change.
