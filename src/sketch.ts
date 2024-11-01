import p5 from "p5";
import { Start, State, StateManager, Story, StorySelect } from "./classes";
import { Controller } from "./controller";

export let state:StateManager;
export let states:Map<string,State>=new Map();
export let controller:Controller;
export let mousePress=false;
export let keyPress=false;

export const sketch=(p:p5)=>{
  p.setup=()=>{
    p.createCanvas(innerWidth,innerHeight,"p2d");
    p.frameRate(60);
    p.textFont('Noto Sans JP');
    controller=new Controller(p);
    states.set("start",new Start(p));
    states.set("story-select",new StorySelect(p));
    states.set("story",new Story(p));
    state=new StateManager(states.get("start")!);
  }
  p.draw=()=>{
    state.display();
    state.update();
    controller.display();
    controller.update();
    keyPress=mousePress=false;
  }
  p.mousePressed=()=>{
    mousePress=true;
  }
  p.keyPressed=()=>{
    keyPress=true;
    controller.pressed(p.keyCode);
  }
  p.keyReleased=()=>{
    controller.released(p.keyCode);
  }
}

export function setNextState(s:string){
  state.set(states.get(s)!);
  state.state.init();
}

export function setLayer(l:"story-select"|"option"|"text"){
  const story_select=document.getElementById("story-select-layer")!;
  const text=document.getElementById("text-layer")!;
  const option=document.getElementById("option-layer")!;
  story_select.style.display="none";
  text.style.display="none";
  option.style.display="none";
  switch(l){
    case "story-select":story_select.style.display="block";break;
    case "option":option.style.display="block";break;
    case "text":option.style.display="block";text.style.display="block";break;
  }
}