// Firebase(Firestore) 연결. 아래 firebaseConfig를 본인 프로젝트 값으로 바꾸면 켜집니다.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};
const V = "10.12.2", COL = "cheerLinks";
export const enabled = () => !!(firebaseConfig.apiKey && firebaseConfig.projectId);
let dbp = null;
async function db() {
  if (!enabled()) throw new Error("not-configured");
  if (!dbp) dbp = (async () => {
    const app = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
    const fs = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
    return { fs, db: fs.getFirestore(app.initializeApp(firebaseConfig)) };
  })();
  return dbp;
}
const clean = r => String(r || "").trim().toLowerCase().replace(/[^a-z0-9가-힣-]/g, "").slice(0, 20);
export const cleanRoom = clean;
export async function send(room, group, url) {
  room = clean(room); group = parseInt(group, 10);
  if (!room) throw new Error("room");
  if (!(group >= 1 && group <= 12)) throw new Error("group");
  if (!/^https:\/\/makecode\.(microbit\.org|com)\//i.test(url)) throw new Error("url");
  const { fs, db: d } = await db();
  await fs.setDoc(fs.doc(d, COL, room + "_" + group), { room, group, url, t: fs.serverTimestamp() });
}
export async function listen(room, cb, err) {
  room = clean(room);
  const { fs, db: d } = await db();
  return fs.onSnapshot(fs.query(fs.collection(d, COL), fs.where("room", "==", room)), s => {
    const o = {}; s.forEach(x => { const v = x.data(); o[v.group] = v.url; }); cb(o);
  }, err);
}
