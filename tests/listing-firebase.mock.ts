type Listener = { next: (snapshot: any) => void; error: (error: Error) => void };
export const state = { docs: new Map<string, any>(), writes: [] as any[], afterRead: null as null | (() => void), listeners: new Map<string, Set<Listener>>(), deletedStorage: [] as string[], storageUploads: [] as any[], afterUpload: null as null | (() => void), uploadError: null as null | Error };
export const firebaseAuth = { currentUser: { uid: 'owner', displayName: 'Host', email: 'host@example.com', phoneNumber: null, photoURL: null } as any };
export const firebaseDb = {};
export const firebaseStorage = {};
export class Timestamp { constructor(public seconds: number, public nanoseconds: number) {} static now() { return new Timestamp(1, 0); } static fromMillis(ms: number) { return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6); } toMillis() { return this.seconds * 1000; } }
export const serverTimestamp = () => 'SERVER_TIMESTAMP';
export const collection = (_db: unknown, path: string) => ({ path });
let sequence = 0;
export const doc = (db: any, ...parts: string[]) => { const path = parts.length ? parts.join('/') : `${db.path}/generated-${++sequence}`; return { path, id: path.split('/').at(-1) }; };
const snapshot = (ref: any) => ({ exists: () => state.docs.has(ref.path), data: () => state.docs.get(ref.path), id: ref.id });
export const emitSnapshot = (path: string) => {
 for (const listener of state.listeners.get(path) ?? []) listener.next(snapshot({ path, id: path.split('/').at(-1) }));
};
export const failSnapshot = (path: string) => {
 for (const listener of state.listeners.get(path) ?? []) listener.error(new Error('permission-denied'));
};
export const onSnapshot = (ref: any, next: Listener['next'], error: Listener['error']) => {
 const listener = { next, error };
 const listeners = state.listeners.get(ref.path) ?? new Set<Listener>();
 state.listeners.set(ref.path, listeners);
 listeners.add(listener);
 next(snapshot(ref));
 return () => { listeners.delete(listener); };
};
export const getDoc = async (ref: any) => snapshot(ref);
export const limit = (count: number) => ({ limit: count });
export const getDocs = async ([collectionRef, ...allConstraints]: any[]) => {
 const constraints = allConstraints.filter(Array.isArray);
 const maximum = allConstraints.find(constraint => !Array.isArray(constraint))?.limit ?? Infinity;
 const docs = [...state.docs.keys()]
  .filter(path => path.startsWith(`${collectionRef.path}/`) && path.split('/').length === collectionRef.path.split('/').length + 1)
  .map(path => snapshot({ path, id: path.split('/').at(-1) }))
  .filter(document => constraints.every(([field, operator, value]: any[]) => {
   if (operator !== '==') throw new Error(`Unsupported query operator: ${operator}`);
   return document.data()[field] === value;
  }))
  .slice(0, maximum);
 state.afterRead?.();
 return { docs };
};
export const query = (...v: any[]) => v;
export const where = (...v: any[]) => v;
export const deleteDoc = async () => {};
export const deleteObject = async (reference: { path: string }) => { state.deletedStorage.push(reference.path); };
export const ref = (_storage: unknown, path: string) => ({ path, fullPath: path, bucket: 'test-bucket', name: path.split('/').at(-1) });
export const uploadBytes = async (reference: any, data?: any, options?: any) => {
 if (state.uploadError) throw state.uploadError;
 state.storageUploads.push({ path: reference.path, data, options });
 state.afterUpload?.();
 return { ref: reference, metadata: { bucket: reference.bucket, generation: String(state.storageUploads.length), contentType: options?.contentType ?? data?.type, size: data?.size, customMetadata: options?.customMetadata } };
};
export const getDownloadURL = async (reference: { path: string }) => `https://firebasestorage.googleapis.com/${reference.path}`;
export const runTransaction = async (_db: any, callback: any) => {
 const staged: any[] = [];
 const result = await callback({
   get: async (ref: any) => { const s = snapshot(ref); state.afterRead?.(); return s; },
   set: (ref: any, data: any, options: any) => staged.push({ ref, data, options }),
   update: (ref: any, data: any) => staged.push({ ref, data })
 });
 for (const write of staged) {
  let next = { ...state.docs.get(write.ref.path), ...write.data };
  if (write.options?.mergeFields) {
   next = { ...state.docs.get(write.ref.path) };
   for (const field of write.options.mergeFields) {
    const parts = field.split('.');
    const value = parts.reduce((current: any, part: string) => current[part], write.data);
    let target = next;
    for (const part of parts.slice(0, -1)) { target[part] = { ...target[part] }; target = target[part]; }
    target[parts.at(-1)] = value;
   }
  }
  state.docs.set(write.ref.path, next); state.writes.push(write);
 }
 for (const path of new Set(staged.map(write => write.ref.path))) emitSnapshot(path);
 return result;
};
