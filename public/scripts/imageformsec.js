const btn = document.getElementById("btnsec");
const menu1 = document.getElementById("formsec");

menu1.addEventListener("click",(e)=>{
    e.stopPropagation();
})

btn.addEventListener("click", (e) => {
    e.stopPropagation();
    

    if (menu1.classList.contains("hidden")) {
        menu1.classList.remove("hidden");
        menu1.classList.add("flex");
    } else {
        menu1.classList.remove("flex");
        menu1.classList.add("hidden");
    }

});

document.body.addEventListener("click",()=>{
    menu1.classList.remove("flex");
        menu1.classList.add("hidden");
})




const dropArea = document.getElementById("dropArea");
const inputFile = document.getElementById("inFile");
// const imgView = document.getElementById("imgView");
 



function uploadImage(){
     menu1.classList.remove("hidden");
        menu1.classList.add("flex");
    
    let imgLink=URL.createObjectURL(inputFile.files[0]);
    dropArea.style.backgroundImage=`url(${imgLink})`;
    // imgView.textContent="";
    
}

inputFile.addEventListener("change",uploadImage)