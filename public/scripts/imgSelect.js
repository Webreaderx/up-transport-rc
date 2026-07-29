const dropArea = document.getElementById("dropArea");
const inputFile = document.getElementById("vimg");
const imgView = document.getElementById("imgView");
 




function uploadImage(){
    
    let imgLink=URL.createObjectURL(inputFile.files[0]);
    dropArea.style.backgroundImage=`url(${imgLink})`;
    imgView.textContent="";
    
}

inputFile.addEventListener("change",uploadImage)