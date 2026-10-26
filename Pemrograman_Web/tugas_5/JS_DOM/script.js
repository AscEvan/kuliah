/* dark mode*/
const tombolTema = document.querySelector("#btn-tema");

function toggleTema(){
	document.body.classList.toggle("dark-mode");
}

tombolTema.addEventListener("click", toggleTema);


/*  render array data */
const daftarPortofolio = [
	{ judul: "Proyek Python: Enkripsi", isi: "Membuat program keamanan data sederhana menggunakan library Fernet." },
	{ judul: "Proyek OOP UI", isi: "Aplikasi manajemen pengeluaran harian dengan Tkinter." },
	{ judul: "Proyek Java", isi: "Sistem inventaris dan struktur data lanjutan." },
];

const containerPortofolio = document.querySelector("#daftar-portofolio");

function buatKartu(data){
	const article = document.createElement("article");
	article.classList.add("kartu");
	
	const judul = document.createElement("h3");
	judul.textContent = data.judul;
	
	const isi = document.createElement("p");
	isi.textContent = data.isi;
	
	const tombolHapus = document.createElement("button");
	tombolHapus.textContent = "Hapus";
	tombolHapus.classList.add("btn-hapus");
	
	article.appendChild(judul);
	article.appendChild(isi);
	article.appendChild(tombolHapus);
	return article;
}

daftarPortofolio.forEach((data) => {
	containerPortofolio.appendChild(buatKartu(data));
});

/* form tambah item portofolio  */
const formPortofolio = document.querySelector("#form-portofolio");
const inputJudul = document.querySelector("#input-judul");
const inputIsi = document.querySelector("#input-isi");
const errorPortofolio = document.querySelector("#error-portofolio");

formPortofolio.addEventListener("submit", (e) => {
	e.preventDefault();
	const judul = inputJudul.value.trim();
	const isi = inputIsi.value.trim();
	
	// Validasi: nama dan deskripsi tidak boleh kosong
	if (judul === "" || isi === "") {
		errorPortofolio.textContent = "Nama dan deskripsi portofolio harus diisi.";
		return;
	}
	errorPortofolio.textContent = "";
	
	containerPortofolio.appendChild(buatKartu({ judul: judul, isi: isi }));
	
	inputJudul.value = "";
	inputIsi.value = "";
});

/* hapus item portofolio  */
containerPortofolio.addEventListener("click", (e) => {
	if (e.target.classList.contains("btn-hapus")) {
		e.target.closest("article").remove();
	}
});


/* validasi, hapus semua, hapus per item komentar */
const formKomentar = document.querySelector("#form-komentar");
const inputKomentar = document.querySelector("#input-komentar");
const pesanError = document.querySelector("#pesan-error");
const daftarKomentar = document.querySelector("#daftar-komentar");
const tombolHapusSemua = document.querySelector("#btn-hapus-semua");

formKomentar.addEventListener("submit", (e) => {
	e.preventDefault();
	const teks = inputKomentar.value.trim();
	
	// Validasi: minimal 5 karakter, pesan error tampil di halaman (bukan alert)
	if (teks.length < 5) {
		pesanError.textContent = "Komentar minimal 5 karakter.";
		return;
	}
	pesanError.textContent = "";
	
	const item = document.createElement("div");
	item.classList.add("komentar");
	
	const isi = document.createElement("p");
	isi.textContent = teks;
	
	const tombolHapus = document.createElement("button");
	tombolHapus.textContent = "Hapus";
	tombolHapus.classList.add("btn-hapus");
	
	item.appendChild(isi);
	item.appendChild(tombolHapus);
	daftarKomentar.appendChild(item);
	
	inputKomentar.value = "";
});

/* hapus semua komentar */
tombolHapusSemua.addEventListener("click", () => {
	daftarKomentar.replaceChildren();
});

/* hapus satu komentar */
daftarKomentar.addEventListener("click", (e) => {
	if (e.target.classList.contains("btn-hapus")) {
		e.target.closest(".komentar").remove();
	}
});


/* kembali ke atas */
const tombolAtas = document.querySelector("#btn-atas");

window.addEventListener("scroll", () => {
	// Muncul setelah scroll melewati 300px
	tombolAtas.classList.toggle("tersembunyi", window.scrollY <= 300);
});

tombolAtas.addEventListener("click", () => {
	window.scrollTo({ top: 0, behavior: "smooth" });
});
