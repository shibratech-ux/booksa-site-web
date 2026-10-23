# Stay reservation simulator

The stay booking flow runs a test reservation in browser memory. It does not create a Firestore booking, hold real availability, or take payment. Reloading the app clears test reservations.

## Try the flow

1. Open a stay listing, select check-in and check-out dates, then choose **Reserve**.
2. Review the dates, guest count, total, and payment timing preview. Choose **Confirm test reservation**.
3. The confirmation shows a test reference. Signed-in guests can open **Trips** to inspect and cancel the test reservation.
4. Try the same listing and overlapping dates again in the same tab. The simulator rejects the second confirmed reservation. A stay starting on the first stay's check-out day is allowed.
5. Cancel the first test reservation in Trips, then try those dates again. The simulator permits a new request.

Each checkout attempt has a client-generated request ID. Retrying the same request returns its existing result, and every simulated status change records an actor and timestamp. Dates are half-open `[checkIn, checkOut)` calendar days. Published stay totals are recomputed with the shared `quoteStay` function; sample listings retain their existing display-price fallback.

The guest count cannot exceed the listing's stated capacity. The website also blocks a signed-in host from testing a reservation on their own published listing.

The simulator is scoped to one open browser tab. It cannot enforce availability across browsers or devices and must not be treated as a production booking backend.
