"use strict";

/* =============================================================
   MODUL 9 — Konsumsi REST API: POST, PATCH, DELETE
   Mata Kuliah: Pemrograman Berbasis Web (PROG31W)

   Fitur:
     - POST   : kirim komentar baru
     - PATCH  : edit komentar (tombol "Edit" -> isi form -> PATCH)
     - DELETE : hapus komentar
     - pesanDariStatus() dipakai pada seluruh operasi POST/PATCH/DELETE
     - Tombol dinonaktifkan selama request agar tidak terklik dua kali
   ============================================================= */

const BASE = "https://jsonplaceholder.typicode.com";
const $ = (s) => document.querySelector(s);

/* === Penanganan status code (B.6) === */
class HttpError extends Error {
  constructor(status) {
    super("Status: " + status);
    this.status = status;
  }
}

function pesanDariStatus(status) {
  if (!status) return "Tidak dapat terhubung ke server, periksa koneksi internet.";
  if (status === 404) return "Data tidak ditemukan di server.";
  if (status === 400) return "Data yang dikirim tidak valid.";
  if (status >= 500) return "Server sedang bermasalah, coba lagi nanti.";
  return "Terjadi kesalahan tidak terduga.";
}

/* Helper fetch: lempar HttpError jika status bukan 2xx */
async function request(path, opsi) {
  const response = await fetch(BASE + path, opsi);
  if (!response.ok) throw new HttpError(response.status);
  return response;
}

/* === Storage helper === */
function baca(key, bawaan) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v === null || v === undefined ? bawaan : v;
  } catch {
    return bawaan;
  }
}
const tulis = (key, nilai) => localStorage.setItem(key, JSON.stringify(nilai));

/* === Dark mode & aside (Modul 6)=== */
const btnTema = $("#btn-tema");
function toggleTema() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
}
btnTema?.addEventListener("click", toggleTema);
if (localStorage.getItem("tema") === "dark") document.body.classList.add("dark-mode");

const aside = $("aside");
const btnAside = $("#btn-toggle-aside");
function setAside(hidden) {
  aside?.classList.toggle("tersembunyi", hidden);
  if (btnAside) btnAside.textContent = hidden ? "Tampilkan Aside" : "Sembunyikan Aside";
  localStorage.setItem("asideTersembunyi", String(hidden));
}
btnAside?.addEventListener("click", () => setAside(!aside.classList.contains("tersembunyi")));
setAside(localStorage.getItem("asideTersembunyi") === "true");

/* === Artikel & penulis dari API (Modul 8) === */
async function muatArtikel() {
  const wadah = $("#daftar-artikel");
  const loading = $("#loading");
  const err = $("#error-artikel");
  err.classList.add("tersembunyi");
  loading.classList.remove("tersembunyi");
  try {
    const data = await (await request("/posts?_limit=6")).json();
    wadah.replaceChildren();
    data.forEach((p) => {
      const art = document.createElement("article");
      const h3 = document.createElement("h3");
      h3.textContent = p.title;
      const isi = document.createElement("p");
      isi.textContent = p.body;
      art.append(h3, isi);
      wadah.append(art);
    });
  } catch (e) {
    err.textContent = "Gagal memuat artikel. " + pesanDariStatus(e.status);
    err.classList.remove("tersembunyi");
    console.error(e);
  } finally {
    loading.classList.add("tersembunyi");
  }
}

async function muatPenulis() {
  try {
    const u = await (await request("/users/1")).json();
    $("#nama-penulis").textContent = u.name;
    $("#email-penulis").textContent = u.email;
  } catch (e) {
    $("#nama-penulis").textContent = "-";
    $("#email-penulis").textContent = "-";
    console.error(e);
  }
}

/* === Portofolio (lokal, Modul 6-7) === */
const PKEY = "portofolio";
let portofolio = baca(PKEY, []);
const daftarPorto = $("#daftar-portofolio");

function renderPortofolio() {
  daftarPorto.replaceChildren();
  portofolio.forEach((p) => {
    const art = document.createElement("article");
    art.dataset.id = p.id;
    const h3 = document.createElement("h3");
    h3.textContent = p.judul;
    const isi = document.createElement("p");
    isi.textContent = p.isi;
    const btn = document.createElement("button");
    btn.textContent = "Hapus";
    btn.className = "btn-hapus-porto";
    art.append(h3, isi, btn);
    daftarPorto.append(art);
  });
}

$("#form-portofolio").addEventListener("submit", (e) => {
  e.preventDefault();
  const judul = $("#input-judul").value.trim();
  const isi = $("#input-isi").value.trim();
  const err = $("#error-portofolio");
  if (!judul || !isi) {
    err.textContent = "Nama dan deskripsi portofolio wajib diisi.";
    return;
  }
  err.textContent = "";
  portofolio.push({ id: Date.now(), judul, isi });
  tulis(PKEY, portofolio);
  renderPortofolio();
  e.target.reset();
});

daftarPorto.addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn-hapus-porto")) return;
  const id = Number(e.target.closest("article").dataset.id);
  portofolio = portofolio.filter((p) => p.id !== id);
  tulis(PKEY, portofolio);
  renderPortofolio();
});

/* 
   KOMENTAR — POST, PATCH, DELETE
 */
const daftarKomentar = $("#daftar-komentar");
const loadKomentar = $("#loading-komentar");
const errKomentar = $("#error-komentar");
const formKomentar = $("#form-komentar");
const inputKomentar = $("#input-komentar");
const pesanError = $("#pesan-error");
const btnKirim = $("#btn-kirim");
const btnBatal = $("#btn-batal");

const LKEY = "komentarLokal";   // komentar buatan pengguna
const CKEY = "koreksiApi";      // hasil edit/hapus pada komentar dari API

let apiKomentar = [];                       // hasil GET /posts/1/comments
let lokal = baca(LKEY, []);                 // {key, serverId, isi, waktu}
let koreksi = baca(CKEY, { hapus: [], edit: {} });
let editKey = null;                         // key komentar yang sedang diedit

/* JSONPlaceholder hanya punya 500 komentar. id hasil POST (501) tidak ada di
   server, sehingga PATCH ke id itu ditolak 500. Untuk simulasi, PATCH
   diarahkan ke resource yang ada. */
const idUntukPatch = (id) => (Number(id) > 500 ? 1 : id);

/* Gabungan komentar API (setelah koreksi) dan komentar lokal */
function semuaKomentar() {
  const dariApi = apiKomentar
    .filter((c) => !koreksi.hapus.includes(c.id))
    .map((c) => ({
      key: "api-" + c.id,
      sumber: "api",
      serverId: c.id,
      nama: c.name,
      isi: koreksi.edit[c.id] ?? c.body,
      waktu: "Komentar dari API",
    }));
  const dariLokal = lokal.map((k) => ({ ...k, sumber: "lokal", nama: "" }));
  return [...dariApi, ...dariLokal];
}

function buatKomentar(k) {
  const el = document.createElement("div");
  el.className = "komentar";
  el.dataset.key = k.key;

  const p = document.createElement("p");
  p.textContent = k.nama ? `${k.nama}: ${k.isi}` : k.isi;
  const small = document.createElement("small");
  small.textContent = k.waktu;

  const btnEdit = document.createElement("button");
  btnEdit.textContent = "Edit";
  btnEdit.className = "btn-edit";
  const btnHapus = document.createElement("button");
  btnHapus.textContent = "Hapus";
  btnHapus.className = "btn-hapus";

  el.append(p, small, document.createElement("br"), btnEdit, btnHapus);
  return el;
}

function renderKomentar() {
  daftarKomentar.replaceChildren();
  const data = semuaKomentar();
  if (data.length === 0) {
    const kosong = document.createElement("p");
    kosong.textContent = "Belum ada komentar.";
    daftarKomentar.append(kosong);
    return;
  }
  data.forEach((k) => daftarKomentar.append(buatKomentar(k)));
}

/* ----- GET ----- */
async function muatKomentar() {
  loadKomentar.classList.remove("tersembunyi");
  errKomentar.classList.add("tersembunyi");
  try {
    apiKomentar = await (await request("/posts/1/comments")).json();
  } catch (e) {
    errKomentar.textContent = "Gagal memuat komentar. " + pesanDariStatus(e.status);
    errKomentar.classList.remove("tersembunyi");
    console.error(e);
  } finally {
    loadKomentar.classList.add("tersembunyi");
    renderKomentar();
  }
}

/* ----- B.2 POST ----- */
async function kirimKomentarKeServer(nama, pesan) {
  const response = await request("/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nama, body: pesan, postId: 1 }),
  });
  return response.json(); // server membalas data + id baru
}

/* ----- B.3 PATCH ----- */
async function perbaruiKomentarKeServer(id, pesan) {
  const response = await request(`/comments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: pesan }), // PATCH: hanya field yang berubah
  });
  return response.json();
}

/* ----- B.5 DELETE ----- */
async function hapusKomentarDariServer(id) {
  return request(`/comments/${id}`, { method: "DELETE" });
}

/* ----- Mode edit ----- */
const labelKirim = () => (editKey ? "Simpan Perubahan" : "Kirim");

function masukModeEdit(k) {
  editKey = k.key;
  inputKomentar.value = k.isi;
  pesanError.textContent = "";
  btnKirim.textContent = labelKirim();
  btnBatal.classList.remove("tersembunyi");
  inputKomentar.focus();
}

function keluarModeEdit() {
  editKey = null;
  inputKomentar.value = "";
  sessionStorage.removeItem("draftKomentar");
  btnKirim.textContent = labelKirim();
  btnBatal.classList.add("tersembunyi");
}

btnBatal.addEventListener("click", () => {
  pesanError.textContent = "";
  keluarModeEdit();
});

/* ----- Submit: POST (baru) atau PATCH (edit) ----- */
formKomentar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const teks = inputKomentar.value.trim();
  if (teks.length < 5) {
    pesanError.textContent = "Komentar minimal 5 karakter.";
    return;
  }
  pesanError.textContent = "";
  errKomentar.classList.add("tersembunyi");

  // Loading: nonaktifkan tombol selama request
  btnKirim.disabled = true;
  btnBatal.disabled = true;
  btnKirim.classList.add("loading");
  btnKirim.textContent = "Mengirim...";

  try {
    if (editKey) {
      const k = semuaKomentar().find((x) => x.key === editKey);
      if (!k) throw new Error("Komentar yang diedit sudah tidak ada.");
      const hasil = await perbaruiKomentarKeServer(idUntukPatch(k.serverId), teks);
      const isiBaru = hasil.body ?? teks;
      if (k.sumber === "api") {
        koreksi.edit[k.serverId] = isiBaru;
        tulis(CKEY, koreksi);
      } else {
        const item = lokal.find((x) => x.key === k.key);
        item.isi = isiBaru;
        item.waktu = new Date().toLocaleString("id-ID") + " (diedit)";
        tulis(LKEY, lokal);
      }
    } else {
      const hasil = await kirimKomentarKeServer("Pengunjung", teks);
      lokal.push({
        key: `lokal-${hasil.id}-${Date.now()}`,
        serverId: hasil.id,
        isi: hasil.body,
        waktu: new Date().toLocaleString("id-ID"),
      });
      tulis(LKEY, lokal);
    }
    keluarModeEdit();
    renderKomentar();
  } catch (error) {
    pesanError.textContent = error instanceof HttpError ? pesanDariStatus(error.status) : pesanDariStatus(null);
    console.error(error);
  } finally {
    btnKirim.disabled = false;
    btnBatal.disabled = false;
    btnKirim.classList.remove("loading");
    btnKirim.textContent = labelKirim();
  }
});

/* ----- Klik Edit / Hapus (event delegation) ----- */
daftarKomentar.addEventListener("click", async (e) => {
  const tombol = e.target.closest("button");
  if (!tombol) return;
  const el = tombol.closest(".komentar");
  if (!el) return;
  const k = semuaKomentar().find((x) => x.key === el.dataset.key);
  if (!k) return;

  if (tombol.classList.contains("btn-edit")) {
    masukModeEdit(k);
    return;
  }

  if (tombol.classList.contains("btn-hapus")) {
    if (!confirm("Hapus komentar ini?")) return;
    errKomentar.classList.add("tersembunyi");

    // Loading: nonaktifkan semua tombol pada komentar ini
    const semuaTombol = el.querySelectorAll("button");
    semuaTombol.forEach((b) => (b.disabled = true));
    tombol.classList.add("loading");
    tombol.textContent = "Menghapus...";

    try {
      await hapusKomentarDariServer(k.serverId);
      if (k.sumber === "api") {
        koreksi.hapus.push(k.serverId);
        tulis(CKEY, koreksi);
      } else {
        lokal = lokal.filter((x) => x.key !== k.key);
        tulis(LKEY, lokal);
      }
      if (editKey === k.key) keluarModeEdit();
      renderKomentar();
    } catch (error) {
      errKomentar.textContent = error instanceof HttpError ? pesanDariStatus(error.status) : pesanDariStatus(null);
      errKomentar.classList.remove("tersembunyi");
      console.error(error);
      semuaTombol.forEach((b) => (b.disabled = false));
      tombol.classList.remove("loading");
      tombol.textContent = "Hapus";
    }
  }
});

/* ----- Hapus semua komentar lokal ----- */
$("#btn-hapus-semua").addEventListener("click", () => {
  if (!confirm("Hapus semua komentar lokal?")) return;
  lokal = [];
  tulis(LKEY, lokal);
  if (editKey && editKey.startsWith("lokal-")) keluarModeEdit();
  renderKomentar();
});

/* ----- Draft komentar (sessionStorage) ----- */
inputKomentar.addEventListener("input", () => sessionStorage.setItem("draftKomentar", inputKomentar.value));
const draft = sessionStorage.getItem("draftKomentar");
if (draft !== null) inputKomentar.value = draft;

/* === Reset, kembali ke atas, shortcut === */
$("#btn-reset").addEventListener("click", () => {
  if (confirm("Hapus semua data tersimpan (tema, aside, komentar, draft)?")) {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  }
});

const btnAtas = $("#btn-atas");
window.addEventListener("scroll", () => btnAtas.classList.toggle("tersembunyi", window.scrollY < 300));
btnAtas.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.toLowerCase() === "d") toggleTema();
});

/* === Inisialisasi === */
renderPortofolio();
muatArtikel();
muatPenulis();
muatKomentar();
