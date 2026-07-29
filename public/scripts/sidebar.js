var menu= document.querySelector("#menu");
var close = document.querySelector("#close");
var slide = document.querySelector("#slide");
var tl=gsap.timeline();



menu.addEventListener("click",(e)=>{
    e.stopPropagation();
})

slide.addEventListener("click",(e)=>{
    e.stopPropagation();
})


    tl.from(slide,{
        left:"-100%",
        duration:0.6
    });
    tl.pause();
menu.addEventListener("click",()=>{
    tl.play();
    
})

close.addEventListener("click",()=>{
    tl.reverse();
    
})
document.body.addEventListener("click",()=>{
    tl.reverse();
})




// tl.from("#side h2",{
//     x:50,
//     opacity:0,
//     stagger:0.1
// })


