
const fakultasProdiData = {
    "Keguruan dan Ilmu Pendidikan": [
        "Pendidikan Guru Sekolah Dasar (S1)",
        "Bimbingan dan Konseling (S1)",
        "Pendidikan Bahasa Inggris (S1)",
        "Pendidikan Bahasa, Sastra Indonesia & Daerah (S1)",
        "Pendidikan Sejarah (S1)",
        "Pendidikan Ekonomi (S1)",
        "Pendidikan Akuntansi (S1)",
        "Pendidikan Matematika (S1)",
        "Pendidikan Fisika (S1)",
        "Pendidikan Biologi (S1)",
        "Pendidikan Agama Katolik (S1)"
    ],
    "Ekonomi": [
        "Akuntansi (S1)",
        "Manajemen (S1)"
    ],
    "Sastra": [
        "Sastra Indonesia (S1)",
        "Sastra Inggris (S1)",
        "Ilmu Sejarah (S1)"
    ],
    "Sains dan Teknologi": [
        "Mekatronika (D3)",
        "Teknik Elektro (S1)",
        "Teknik Mesin (S1)",
        "Teknik Informatika (S1)",
        "Matematika (S1)",
        "Fisika (S1)"
    ],
    "Farmasi": [
        "Farmasi (S1)"
    ],
    "Psikologi": [
        "Psikologi (S1)"
    ]
};

const genderOptions = ["Laki-laki", "Perempuan"];
const statusOptions = ["Belum Menikah", "Menikah", "Biarawan/Biarawati"];
const agamaOptions = ["Islam", "Katolik", "Kristen", "Budha", "Hindu", "Lain-lain"];
const kewarganegaraanOptions = ["WNI", "WNA"];
const pendidikanOrtuOptions = [
    "Tidak lulus SD", "SD", "SLTP", "SMA", "Diploma", 
    "Sarjana Muda", "Sarjana", "Magister", "Doktor"
];

// mengisi opsi standar
function isiDropdown(selector, dataArray) {
    const selectElement = document.querySelector(selector);
    dataArray.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
}

// mengisi dropdown Fakultas
function isiFakultas(selector) {
    const selectElement = document.querySelector(selector);
    Object.keys(fakultasProdiData).forEach(fakultas => {
        const option = document.createElement("option");
        option.value = fakultas;
        option.textContent = fakultas;
        selectElement.appendChild(option);
    });
}

//  Cascading: Mengubah isi Program Studi saat Fakultas dipilih
function setupCascading(fakultasSelector, prodiSelector) {
    const fakultasEl = document.querySelector(fakultasSelector);
    const prodiEl = document.querySelector(prodiSelector);

    fakultasEl.addEventListener("change", () => {
        const selectedFakultas = fakultasEl.value;
        prodiEl.innerHTML = '<option value="">-- Pilih Program Studi --</option>';
        
        if (selectedFakultas && fakultasProdiData[selectedFakultas]) {
            prodiEl.disabled = false;
            fakultasProdiData[selectedFakultas].forEach(prodi => {
                const option = document.createElement("option");
                option.value = prodi;
                option.textContent = prodi;
                prodiEl.appendChild(option);
            });
        } else {
            prodiEl.disabled = true;
        }
    });
}

// Inisialisasi saat DOM dimuat
document.addEventListener("DOMContentLoaded", () => {
    isiDropdown("#gender", genderOptions);
    isiDropdown("#status", statusOptions);
    isiDropdown("#agama", agamaOptions);
    isiDropdown("#kewarganegaraan", kewarganegaraanOptions);
    isiDropdown("#pendidikan-ortu", pendidikanOrtuOptions);

    // Inisialisasi Fakultas untuk Pilihan I, II, dan III
    isiFakultas("#fakultas1");
    isiFakultas("#fakultas2");
    isiFakultas("#fakultas3");

    // Hubungkan relasi Fakultas dan Program Studi
    setupCascading("#fakultas1", "#prodi1");
    setupCascading("#fakultas2", "#prodi2");
    setupCascading("#fakultas3", "#prodi3");
});

const formDaftar = document.querySelector("#form-daftar");

const fields = [
    { el: document.querySelector("#nama"), err: document.querySelector("#error-nama") },
    { el: document.querySelector("#gender"), err: document.querySelector("#error-gender") },
    { el: document.querySelector("#status"), err: document.querySelector("#error-status") },
    { el: document.querySelector("#agama"), err: document.querySelector("#error-agama") },
    { el: document.querySelector("#kewarganegaraan"), err: document.querySelector("#error-kewarganegaraan") },
    { el: document.querySelector("#alamat"), err: document.querySelector("#error-alamat") },
    { el: document.querySelector("#hp"), err: document.querySelector("#error-hp") },
    { el: document.querySelector("#email"), err: document.querySelector("#error-email") },
    { el: document.querySelector("#nama-ortu"), err: document.querySelector("#error-nama-ortu") },
    { el: document.querySelector("#pendidikan-ortu"), err: document.querySelector("#error-pendidikan-ortu") },
    { el: document.querySelector("#nama-sekolah"), err: document.querySelector("#error-nama-sekolah") },
    { el: document.querySelector("#alamat-sekolah"), err: document.querySelector("#error-alamat-sekolah") },
    { el: document.querySelector("#telp-sekolah"), err: document.querySelector("#error-telp-sekolah") },
    { el: document.querySelector("#fakultas1"), err: document.querySelector("#error-fakultas1") },
    { el: document.querySelector("#prodi1"), err: document.querySelector("#error-prodi1") },
    { el: document.querySelector("#fakultas2"), err: document.querySelector("#error-fakultas2") },
    { el: document.querySelector("#prodi2"), err: document.querySelector("#error-prodi2") },
    { el: document.querySelector("#fakultas3"), err: document.querySelector("#error-fakultas3") },
    { el: document.querySelector("#prodi3"), err: document.querySelector("#error-prodi3") }
];

function validasiField(input, errorElement) {
    if (!input.checkValidity()) {
        if (input.validity.valueMissing) {
            errorElement.textContent = "Field ini wajib diisi";
        } else if (input.validity.tooShort) {
            errorElement.textContent = `Minimal karakter adalah ${input.minLength}`;
        } else if (input.validity.patternMismatch) {
            errorElement.textContent = "Format penulisan atau nomor tidak valid";
        } else if (input.validity.typeMismatch) {
            errorElement.textContent = "Format email tidak valid";
        } else {
            errorElement.textContent = input.validationMessage;
        }
    } else {
        errorElement.textContent = "";
    }
}

fields.forEach(item => {
    item.el.addEventListener("input", () => validasiField(item.el, item.err));
    item.el.addEventListener("change", () => validasiField(item.el, item.err));
});

formDaftar.addEventListener("submit", (e) => {
    fields.forEach(item => validasiField(item.el, item.err));

    if (!formDaftar.checkValidity()) {
        e.preventDefault();
    } else {
        e.preventDefault();
        alert("Pendaftaran mahasiswa baru berhasil dikirim (simulasi)!");
        formDaftar.reset();
        
        // Reset dropdown prodi agar kembali disabled setelah form di-reset
        document.querySelector("#prodi1").disabled = true;
        document.querySelector("#prodi2").disabled = true;
        document.querySelector("#prodi3").disabled = true;
        
        fields.forEach(item => item.err.textContent = "");
    }
});
