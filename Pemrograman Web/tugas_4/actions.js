// var a = document.getElementById('bilangan1').value;
// var b = document.getElementById('bilangan2').value;

function tambah(a, b){
    document.getElementById('hasil').innerHTML=parseInt(a)+parseInt(b);
}

function kurang(a, b){
    document.getElementById('hasil').innerHTML=parseInt(a)-parseInt(b);
}

function kali(a, b){
    document.getElementById('hasil').innerHTML=parseInt(a)*parseInt(b);
}

function bagi(a, b){
    document.getElementById('hasil').innerHTML=parseInt(a)/parseInt(b);
}
