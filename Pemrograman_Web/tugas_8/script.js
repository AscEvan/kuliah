"use strict";

const BASE = "https://jsonplaceholder.typicode.com";
const $ = (s) => document.querySelector(s);

/* ---------- Tema & aside ---------- */
const btnTema = $("#btn-tema");
function toggleTema() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
}
btnTema?.addEventListener("click", toggleTema);
if (localStorage.getItem("tema") === "dark") document.body.classList.add("dark-mode");

const aside = $("aside"), btnAside = $("#btn-toggle-aside");
function setAside(hidden) {
  aside?.classList.toggle("tersembunyi", hidden);
  if (btnAside) btnAside.textContent = hidden ? "Tampilkan Aside" : "Sembunyikan Aside";
  localStorage.setItem("asideTersembunyi", String(hidden));
}
btnAside?.addEventListener("click", () => setAside(!aside.classList.contains("tersembunyi")));
setAside(localStorage.getItem("asideTersembunyi") === "true");

/* ---------- Helper fetch ---------- */
async function api(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error("Status: " + res.status);
  return res.json();
}

/* ---------- Artikel dari API ---------- */
const listArtikel = $("#daftar-artikel");
const loadArtikel = $("#loading");
const errArtikel = $("#error-artikel");

(async function muatArtikel() {
  if (!listArtikel) return;
  loadArtikel?.classList.remove("tersembunyi");
  errArtikel?.classList.add("tersembunyi");
  try {
    const posts = await api("/posts?_limit=5");
    const likes = JSON.parse(localStorage.getItem("semuaLike") || "{}");
    posts.forEach((p) => {
      const art = document.createElement("article");
      art.className = "kartu";
      const h = document.createElement("h3"); h.textContent = p.title;
      const body = document.createElement("p"); body.textContent = p.body;
      const n = likes[p.title] || 0;
      const likeBtn = document.createElement("button");
      likeBtn.textContent = `Like (${n})`; likeBtn.dataset.like = n;
      const delBtn = document.createElement("button");
      delBtn.textContent = "Hapus"; delBtn.className = "btn-hapus";
      art.append(h, body, likeBtn, delBtn);
      listArtikel.append(art);
    });
  } catch (e) {
    listArtikel.innerHTML = "";
    if (errArtikel) { errArtikel.textContent = "Gagal memuat artikel, silakan coba lagi nanti."; errArtikel.classList.remove("tersembunyi"); }
    console.error(e);
  } finally {
    loadArtikel?.classList.add("tersembunyi");
  }
})();

listArtikel?.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  if (e.target.textContent.startsWith("Like")) {
    let n = +e.target.dataset.like + 1;
    e.target.dataset.like = n;
    e.target.textContent = `Like (${n})`;
    const title = e.target.closest("article").querySelector("h3").textContent;
    const likes = JSON.parse(localStorage.getItem("semuaLike") || "{}");
    likes[title] = n;
    localStorage.setItem("semuaLike", JSON.stringify(likes));
  } else if (e.target.textContent === "Hapus") {
    e.target.closest("article").remove();
  }
});

/* ---------- Profil penulis ---------- */
(async function muatProfil() {
  const nama = $("#nama-penulis"), email = $("#email-penulis");
  if (!nama || !email) return;
  try {
    const u = await api("/users/1");
    nama.textContent = u.name;
    email.textContent = u.email;
  } catch (e) {
    nama.textContent = email.textContent = "Gagal memuat";
    console.error(e);
  }
})();

/* ---------- Komentar ---------- */
const daftarKomentar = $("#daftar-komentar");
const loadKomentar = $("#loading-komentar");
const errKomentar = $("#error-komentar");
const KKEY = "komentar";
const getLocal = () => JSON.parse(localStorage.getItem(KKEY) || "[]");
const setLocal = (d) => localStorage.setItem(KKEY, JSON.stringify(d));

function buatKomentar({ id, teks, waktu, sumber }) {
  const item = document.createElement("div");
  item.className = "komentar"; item.dataset.id = id; item.dataset.sumber = sumber;
  const p = document.createElement("p"); p.textContent = teks;
  const small = document.createElement("small"); small.textContent = waktu;
  item.append(p, small);
  if (sumber === "lokal") {
    const b = document.createElement("button");
    b.textContent = "Hapus"; b.className = "btn-hapus"; b.dataset.id = id;
    item.append(b);
  }
  return item;
}

async function muatKomentar() {
  if (!daftarKomentar) return;
  loadKomentar?.classList.remove("tersembunyi");
  errKomentar?.classList.add("tersembunyi");
  try {
    const apiComments = await api("/posts/1/comments");
    daftarKomentar.replaceChildren();
    apiComments.forEach((c) => daftarKomentar.append(buatKomentar({
      id: `api-${c.id}`, teks: `${c.name}: ${c.body}`, waktu: "Komentar dari API", sumber: "api",
    })));
    getLocal().forEach((k) => daftarKomentar.append(buatKomentar({
      id: k.id, teks: k.teks, waktu: k.waktu, sumber: "lokal",
    })));
  } catch (e) {
    daftarKomentar.replaceChildren();
    getLocal().forEach((k) => daftarKomentar.append(buatKomentar({
      id: k.id, teks: k.teks, waktu: k.waktu, sumber: "lokal",
    })));
    if (errKomentar) { errKomentar.textContent = "Gagal memuat komentar, silakan coba lagi nanti."; errKomentar.classList.remove("tersembunyi"); }
    console.error(e);
  } finally {
    loadKomentar?.classList.add("tersembunyi");
  }
}
muatKomentar();

daftarKomentar?.addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn-hapus")) return;
  if (!confirm("Hapus komentar ini?")) return;
  setLocal(getLocal().filter((k) => k.id !== e.target.dataset.id));
  muatKomentar();
});

const formKomentar = $("#form-komentar");
const inputKomentar = $("#input-komentar");
formKomentar?.addEventListener("submit", (e) => {
  e.preventDefault();
  const teks = inputKomentar.value.trim();
  const err = $("#pesan-error");
  if (teks.length < 5) { if (err) err.textContent = "Komentar minimal 5 karakter."; return; }
  if (err) err.textContent = "";
  const daftar = getLocal();
  daftar.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, teks, waktu: new Date().toLocaleString("id-ID") });
  setLocal(daftar);
  inputKomentar.value = "";
  sessionStorage.removeItem("draftKomentar");
  muatKomentar();
});

inputKomentar?.addEventListener("input", () => sessionStorage.setItem("draftKomentar", inputKomentar.value));
const draft = sessionStorage.getItem("draftKomentar");
if (draft !== null && inputKomentar) inputKomentar.value = draft;

$("#btn-hapus-semua")?.addEventListener("click", () => {
  if (confirm("Hapus semua komentar lokal?")) { setLocal([]); muatKomentar(); }
});

/* ---------- Portofolio ---------- */
const portofolio = [
  { judul: "Proyek Python: Enkripsi", isi: "Membuat program keamanan data sederhana menggunakan library Fernet." },
  { judul: "Proyek OOP UI", isi: "Aplikasi manajemen pengeluaran harian dengan Tkinter." },
  { judul: "Proyek Java", isi: "Sistem inventaris dan struktur data lanjutan." },
];
const listPortofolio = $("#daftar-portofolio");
function kartu(data) {
  const art = document.createElement("article"); art.className = "kartu";
  const h = document.createElement("h3"); h.textContent = data.judul;
  const p = document.createElement("p"); p.textContent = data.isi;
  art.append(h, p); return art;
}
portofolio.forEach((d) => listPortofolio?.append(kartu(d)));
$("#form-portofolio")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const judul = $("#input-judul").value.trim();
  const isi = $("#input-isi").value.trim();
  const err = $("#error-portofolio");
  if (!judul || !isi) { if (err) err.textContent = "Nama dan deskripsi portofolio harus diisi."; return; }
  if (err) err.textContent = "";
  listPortofolio?.append(kartu({ judul, isi }));
  $("#input-judul").value = ""; $("#input-isi").value = "";
});

/* ---------- Utilitas ---------- */
const btnAtas = $("#btn-atas");
if (btnAtas) {
  window.addEventListener("scroll", () => btnAtas.classList.toggle("tersembunyi", window.scrollY <= 300));
  btnAtas.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
$("#btn-reset")?.addEventListener("click", () => {
  if (confirm("Hapus semua data tersimpan (tema, aside, komentar, draft)?")) {
    localStorage.clear(); sessionStorage.clear(); location.reload();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key.toLowerCase() === "d") toggleTema();
});