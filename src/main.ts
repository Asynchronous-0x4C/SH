import p5 from "p5"
import { sketch } from "./sketch"

let p:p5;

window.addEventListener('load',()=>{
  p=new p5(sketch);
})

window.addEventListener('touchstart',(e)=>{
  p.mousePressed();
  if((e.target!as Element).closest(".scrollable")===null)e.preventDefault();
},{passive:false});

window.addEventListener('touchmove',(e)=>{
  if((e.target!as Element).closest(".scrollable")===null)e.preventDefault();
},{passive:false});

window.addEventListener('resize',()=>{
  p.resizeCanvas(window.innerWidth,window.innerHeight);
})