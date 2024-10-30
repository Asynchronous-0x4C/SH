import p5, { Vector } from "p5";
import { controller } from "./sketch";
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
  manager:TextManager;

  constructor(p:p5){
    super(p);
    this.manager=new TextManager();
    this.manager.loadScript("prologue/main");
  }

  init(): void {
  }

  display(): void {
    this.p.background(180);
  }

  update(): void {
  }
}

export class Main extends State{
  player:Player|null=null;

  constructor(p:p5){
    super(p);
    this.init();
  }

  init(){
    this.player=new Player(this.p);
  }

  display(): void {
    this.p.background(30);
    this.player!.display();
  }

  update(): void {
    this.player!.update();
  }
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