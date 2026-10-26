"use strict";

// Dark mode (localStorage)
const btnTema = document.querySelector("#btn-tema");
function toggleTema() {
  document.body.classList.toggle("dark-mode");
  const sekarang = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("tema", sekarang);
}
if (btnTema) btnTema.addEventListener("click", toggleTema);
function muatTema() {
  if (localStorage.getItem("tema") === "dark") document.body.classList.add("dark-mode");
}
muatTema();

/*  1. Tampil/sembunyi aside -> localStorage */
const aside = document.querySelector("aside");
const btnAside = document.querySelector("#btn-toggle-aside");
const ASIDE_KEY = "asideTersembunyi";

function muatAside() {
  const tersembunyi = localStorage.getItem(ASIDE_KEY) === "true";
  if (tersembunyi) aside.classList.add("tersembunyi");
  btnAside.textContent = tersembunyi ? "Tampilkan Aside" : "Sembunyikan Aside";
}
btnAside.addEventListener("click", () => {
  const tersembunyi = aside.classList.toggle("tersembunyi");
  localStorage.setItem(ASIDE_KEY, String(tersembunyi));
  btnAside.textContent = tersembunyi ? "Tampilkan Aside" : "Sembunyikan Aside";
});
muatAside();

/*  2. Komentar -> localStorage (simpan + hapus per item)  */
const formKomentar = document.querySelector("#form-komentar");
const inputKomentar = document.querySelector("#input-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const KOMENTAR_KEY = "komentar";

function ambilKomentar() {
  return JSON.parse(localStorage.getItem(KOMENTAR_KEY) || "[]");
}
function simpanKomentar(daftar) {
  localStorage.setItem(KOMENTAR_KEY, JSON.stringify(daftar));
}

function renderKomentar() {
  daftarKomentar.replaceChildren();
  ambilKomentar().forEach((k) => {
    const item = document.createElement("div");
    item.classList.add("komentar");
    item.dataset.id = k.id;

    const isi = document.createElement("p");
    isi.textContent = k.teks;
    const waktu = document.createElement("small");
    waktu.textContent = k.waktu;

    const hapus = document.createElement("button");
    hapus.textContent = "Hapus";
    hapus.classList.add("btn-hapus");
    hapus.dataset.id = k.id;

    item.appendChild(isi);
    item.appendChild(waktu);
    item.appendChild(hapus);
    daftarKomentar.appendChild(item);
  });
}

function hapusSatu(id) {
  if (!confirm("Hapus komentar ini?")) return;
  const daftar = ambilKomentar().filter((k) => k.id !== id);
  simpanKomentar(daftar);
  renderKomentar();
}

daftarKomentar.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-hapus")) {
    hapusSatu(e.target.dataset.id);
  }
});

btnHapusSemua.addEventListener("click", () => {
  if (confirm("Hapus semua komentar?")) {
    simpanKomentar([]);
    renderKomentar();
  }
});

formKomentar.addEventListener("submit", (e) => {
  e.preventDefault();
  const teks = inputKomentar.value.trim();
  const err = document.querySelector("#pesan-error");
  if (teks.length < 5) {
    err.textContent = "Komentar minimal 5 karakter.";
    return;
  }
  err.textContent = "";

  const daftar = ambilKomentar();
  daftar.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    teks,
    waktu: new Date().toLocaleString("id-ID"),
  });
  simpanKomentar(daftar);
  renderKomentar();

  inputKomentar.value = "";
  sessionStorage.removeItem("draftKomentar"); // draft dihapus setelah terkirim
});

/*  3. Draft form komentar -> sessionStorage  */
const DRAFT_KEY = "draftKomentar";
inputKomentar.addEventListener("input", () => {
  sessionStorage.setItem(DRAFT_KEY, inputKomentar.value);
});
const draft = sessionStorage.getItem(DRAFT_KEY);
if (draft !== null) inputKomentar.value = draft;

/*  Portofolio (DOM, data awal)  */
const daftarPortofolio = [
  { judul: "Proyek Python: Enkripsi", isi: "Membuat program keamanan data sederhana menggunakan library Fernet." },
  { judul: "Proyek OOP UI", isi: "Aplikasi manajemen pengeluaran harian dengan Tkinter." },
  { judul: "Proyek Java", isi: "Sistem inventaris dan struktur data lanjutan." },
];
const containerPortofolio = document.querySelector("#daftar-portofolio");

function buatKartu(data) {
  const article = document.createElement("article");
  article.classList.add("kartu");

  const judul = document.createElement("h3");
  judul.textContent = data.judul;
  const isi = document.createElement("p");
  isi.textContent = data.isi;
  article.appendChild(judul);
  article.appendChild(isi);
  return article;
}

daftarPortofolio.forEach((data) => {
  containerPortofolio.appendChild(buatKartu(data));
});

const formPortofolio = document.querySelector("#form-portofolio");
const inputJudul = document.querySelector("#input-judul");
const inputIsi = document.querySelector("#input-isi");
const errorPortofolio = document.querySelector("#error-portofolio");

formPortofolio.addEventListener("submit", (e) => {
  e.preventDefault();
  const judul = inputJudul.value.trim();
  const isi = inputIsi.value.trim();
  if (judul === "" || isi === "") {
    errorPortofolio.textContent = "Nama dan deskripsi portofolio harus diisi.";
    return;
  }
  errorPortofolio.textContent = "";
  containerPortofolio.appendChild(buatKartu({ judul, isi }));
  inputJudul.value = "";
  inputIsi.value = "";
});

/* # Kembali ke atas  */
const btnAtas = document.querySelector("#btn-atas");
window.addEventListener("scroll", () => {
  btnAtas.classList.toggle("tersembunyi", window.scrollY <= 300);
});
btnAtas.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* # Reset semua data  */
document.querySelector("#btn-reset").addEventListener("click", () => {
  if (confirm("Hapus semua data tersimpan (tema, aside, komentar, draft)?") ) {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  }
});
