import p5 from "p5"
import { sketch } from "./sketch"

let p:p5;

window.addEventListener('load',()=>{
  p=new p5(sketch);
})

window.addEventListener('touchstart',(e)=>{
  p.mousePressed();
  e.preventDefault();
},{passive:false});

window.addEventListener('touchmove',(e)=>{
  e.preventDefault();
},{passive:false});