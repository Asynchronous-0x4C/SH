import p5, { Image, Vector } from "p5";
import { controller, setLayer, setNextState, state } from "./sketch";
import { TextManager } from "./system";

export class StateManager{
  state:State;

  constructor(state:State){
    this.state=state;
  }

  set(state:State){
    this.state=state;
  }

  display(){
    this.state.display();
  }

  update(){
    this.state.update();
  }
}

export class State{
  p:p5;

  constructor(p:p5){
    this.p=p;
  }

  init(){}

  display(){}

  update(){}
}

export class Start extends State{

  constructor(p:p5){
    super(p);
    const btn=document.getElementById("start-button")!;
    btn.addEventListener("pointerdown",()=>{
      setNextState("story-select");
    })
  }

  init(): void {
    setLayer("start");
  }

  display(): void {
    this.p.background(230);
    this.p.fill(30);
    this.p.textSize(100);
    this.p.textAlign("center");
    this.p.text("Project SH",this.p.width*0.5,120);
  }

  update(): void {
  }
}

import story_list from "../data/story-list.json";

export class StorySelect extends State{
  map:Image;
  mag:number=2048/256;
  currnet:Vector=new Vector(0,0);
  target:Vector=new Vector(0,0);

  constructor(p:p5){
    super(p);
    this.currnet.set(story_list.list[0].position.x+0.5,story_list.list[0].position.y+0.5);
    this.target.set(story_list.list[0].position.x+0.5,story_list.list[0].position.y+0.5);
    this.map=p.loadImage("./data/img/map.png");//draw in shader
    //(canvas as any).getTexture(this.map).setInterpolation(p.NEAREST,p.NEAREST);
    const list=document.getElementById("story-list")!;
    story_list.list.forEach(s=>{
      list.innerHTML+=`<div class="story-box scrollable" data-x="${s.position.x}" data-y="${s.position.y}">
                         <h3 class="scrollable">${s.name}</h3>
                         <button class="story-start scrollable" data-path="${s.file}"><p>Enter</p></button>
                       </div>`;
    });
    const btn=Array.from(list.getElementsByClassName("story-box")!)as HTMLButtonElement[];
    btn.forEach(b=>{
      b.addEventListener('click',()=>{
        this.target.set(Number(b.dataset.x)+0.5,Number(b.dataset.y)+0.5);
      });
    });
    const start=Array.from(list.getElementsByClassName("story-start")!)as HTMLButtonElement[];
    start.forEach(b=>{
      b.addEventListener('click',()=>{
        const anim=document.getElementById("animation-ui")!;
        anim.style.transitionDuration="1s";
        anim.style.backgroundColor="#333";
        anim.offsetHeight;
        anim.ontransitionend=()=>{
          setNextState("story");
          (state.state as Story).loadScript(b.dataset.path!);
        }
      });
    });
  }

  init(): void {
    setLayer("story-select");
  }

  display(): void {
    const offset=this.calcOffset(this.currnet);
    this.p.background(50,100,200);
    this.p.push();
    this.p.translate(offset.x,offset.y);
    this.p.noSmooth();
    this.p.image(this.map,0,0,2048,2048);
    this.p.noStroke();
    this.p.fill(230,200);
    const w=2;
    this.p.quad(this.target.x*this.mag,(this.target.y-0.5)*this.mag-1,(this.target.x+w)*this.mag,(this.target.y-5.5)*this.mag
                ,this.target.x*this.mag,(this.target.y-4)*this.mag,(this.target.x-w)*this.mag,(this.target.y-5.5)*this.mag);
    this.p.pop();
  }

  update(): void {
    this.currnet.add(this.target.copy().sub(this.currnet).mult(0.2));
  }

  private calcOffset(p:Vector):Vector{
    return p.copy().mult(-this.mag).add(this.p.width*0.3,this.p.height*0.5);
  }
}

export class Story extends State{
  manager:TextManager;

  constructor(p:p5){
    super(p);
    this.manager=new TextManager();
  }

  loadScript(path:string){
    this.manager.loadScript(path);
  }

  init(): void {
    setLayer("text");
  }

  display(): void {
    this.p.background(230);
  }

  update(): void {
  }
}

export class Main extends State{
  field!:Field;

  constructor(p:p5){
    super(p);
    this.init();
  }

  init(){
    const w=15;
    const h=10;
    const size=Math.min(this.p.width*0.8/w,this.p.height*0.8/h);
    this.field=new Field(new Vector((this.p.width-(w*size))*0.5,(this.p.height-(h*size))*0.5),w,h,size,this.p);
    setLayer("game");
  }

  display(): void {
    this.p.background(230);
    this.field.display();
  }

  update(): void {
    this.field.update();
  }
}

export class Field{
  position:Vector;
  tiles:Array<Tile>;
  grid:Array<Array<number>>;
  p:p5;

  constructor(position:Vector,w:number,h:number,size:number,p:p5){
    this.position=position;
    this.tiles=[];
    this.grid=[];
    this.p=p;
    for(let i=0;i<h;i++){
      this.grid.push([]);
      for(let j=0;j<w;j++){
        const t=new Tile(1,j,i,size,p);
        t.setDelay((i+j)*0.03);
        this.tiles.push(t);
        this.grid[i].push(t.weight);
      }
    }console.log(this.grid);
  }

  display(){
    this.p.translate(this.position.x,this.position.y);
    this.tiles.forEach(t=>t.display());
  }

  update(){
    this.tiles.forEach(t=>t.update());
  }
}

export class Tile{
  weight:number=0;
  position:Vector;
  size:number;
  delay=0;
  c_size=0;
  p:p5;

  constructor(weight:number,w:number,h:number,size:number,p:p5){
    this.weight=weight;
    this.position=new Vector((w+0.5)*size,(h+0.5)*size);
    this.size=size;
    this.p=p;
  }

  setDelay(d:number){
    this.delay=d;
  }

  display(){
    this.p.rectMode("center");
    this.p.noStroke();
    this.p.push();
    this.p.drawingContext.shadowOffsetX=5;
    this.p.drawingContext.shadowOffsetY=5;
    this.p.drawingContext.shadowBlur=5;
    this.p.drawingContext.shadowColor=this.p.color(0,0,0,128);
    this.p.fill(70,150,255,100);
    this.p.rect(this.position.x,this.position.y,this.c_size*0.95,this.c_size*0.95);
    this.p.pop();
  }

  update(){
    this.delay-=1/this.p.frameRate();
    if(this.delay<=0){
      this.c_size+=(this.size-this.c_size)*0.6;
    }
  }
}

export class Entity{
  
}

class Player{
  position:Vector;
  attack_angle:number=0;
  speed:number=3;
  p:p5;

  constructor(p:p5){
    this.position=new Vector(0,0);
    this.p=p;
  }

  display(){
    this.p.rectMode("center");
    this.p.fill(230);
    this.p.noStroke();
    this.p.push();
    this.p.translate(this.position.x,this.position.y);
    this.p.rect(0,0,50,50,5);
    this.p.fill(0,225,255);
    this.p.triangle(Math.cos(this.attack_angle-0.2)*45,Math.sin(this.attack_angle-0.2)*45,Math.cos(this.attack_angle+0.2)*45,Math.sin(this.attack_angle+0.2)*45,Math.cos(this.attack_angle)*50,Math.sin(this.attack_angle)*50);
    this.p.pop();
  }

  update(){
    const move=controller.getMove();
    this.position.add(Math.cos(move.angle)*move.mag*this.speed,Math.sin(move.angle)*move.mag*this.speed);
    const attack=controller.getAttack();
    if(attack.mag>0)this.attack_angle=attack.angle;
  }
}