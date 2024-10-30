export type Scripts={
  scripts:{
    type:string,
    name:string,text:string,
    animation:string,duration:string,
    settings:string[]
  }[]
};

export abstract class Animator{
  isEnd=false;
  onend:()=>void=()=>{};

  constructor(onend?:()=>void){
    if(onend)this.onend=onend;
  }

  abstract start():void;
  abstract end():void;
}

export class NullAnimator extends Animator{
  
  constructor(onend?:()=>void){
    super(onend);
  }

  start(){
    this.end();
  }

  end(){
    this.isEnd=true;
    this.onend();
  }
}

export class AnimationAnimator extends Animator{
  animation:string;
  duration:number;
  el:HTMLDivElement;
  process=()=>{};
  transitionend=()=>{this.end();};

  constructor(animation:string,duration:string,onend?:()=>void){
    super(onend);
    this.animation=animation;
    this.duration=Number(duration);
    this.el=document.getElementById("animation-ui")!as HTMLDivElement;
    this.el.addEventListener('transitionend',this.transitionend);
    switch(animation){
      case "fade-in":
        this.el.style.backgroundColor="#333";
        this.el.offsetHeight;
        this.process=()=>{
          this.el.style.transition=`background-color ${duration}s ease-out`;
          this.el.style.backgroundColor="#3330";

        };
        break;
      case "fade-out":
        this.el.style.backgroundColor="#3330";
        this.el.offsetHeight;
        this.process=()=>{
          this.el.style.transition=`background-color ${duration}s ease-out`;
          this.el.style.backgroundColor="#333";
        };
        break;
    }
  }

  start(){
    this.process();
  }

  end(){
    this.el.removeEventListener('transitionend',this.transitionend);
    this.isEnd=true;
    this.onend();
  }
}

export class TextAnimator extends Animator{
  offsets:Map<number,number>=new Map();
  source:string;
  current:string="";
  wps=10;
  offset=0;
  id!:number;
  onupdate:(current:string)=>void=(_:string)=>{};

  constructor(src:string,wps?:number,onupdate?:(current:string)=>void,onend?:()=>void){
    super(onend);
    this.source=src;
    if(wps)this.wps=wps;
    Array.from(src.matchAll(/(<[^<]+>)|\n|\r|\s/g)).forEach(r=>{
      this.offsets.set(r.index,r[0].length);
      this.current+=r[0];
    });
    if(onupdate)this.onupdate=onupdate;
  }

  start(){
    this.id=setInterval(()=>{
      const end=!this.next();
      this.onupdate(this.current);
      if(end){
        clearInterval(this.id);
        this.isEnd=true;
        this.onend();
      }
    },1000/this.wps);
  }

  end(){
    clearInterval(this.id);
    this.current=this.source;
    this.onupdate(this.current);
    this.isEnd=true;
    this.onend();
  }

  private next():boolean{
    if(this.current==this.source)return false;
    const len=this.offsets.get(this.offset);
    if(len){
      this.offset+=len;
    }
    this.current=this.insert(this.current,this.source.charAt(this.offset),this.offset);
    this.offset++;
    return true;
  }

  private insert(src:string,text:string,pos:number):string{
    return src.slice(0,pos)+text+src.slice(pos);
  }
}

export class TextManager{
  text_box!:HTMLDivElement;
  name_box!:HTMLDivElement;
  script!:Scripts;
  index=0;
  autoplay=false;
  autonext=()=>{
    setTimeout(()=>{this.next()},750);
  };
  animator!:Animator;
  dialog_content:HTMLDivElement;

  constructor(){
    this.text_box=document.getElementById("text-box")as HTMLDivElement;
    this.name_box=document.getElementById("name-box")as HTMLDivElement;
    this.text_box.addEventListener('pointerdown',()=>{
      this.next();
    });
    const auto=document.getElementById("auto")!;
    auto.addEventListener("pointerdown",()=>{
      auto.classList.toggle("active");
      if(auto.classList.contains("active")){
        this.autoplay=true;
        this.animator.onend=this.autonext;
        if(this.animator.isEnd){
          this.autonext();
        }
      }else{
        this.autoplay=false;
        this.animator.onend=()=>{};
      }
    });
    this.dialog_content=document.getElementById("dialog-area")!as HTMLDivElement;
    const log=document.getElementById("log")!;
    const dialog=document.getElementById("log-dialog")!as HTMLDialogElement;
    log.addEventListener("pointerdown",()=>{
      dialog.showModal();
      log.classList.add("active");
    });
    dialog.addEventListener('pointerdown',(e)=>{
      if((e.target! as Element).closest('#dialog-area')===null){
        dialog.close();
        log.classList.remove("active");
      }
    });
  }

  loadScript(name:string,callback?:(json:Scripts)=>void){
    fetch(`./scripts/${name}.json`).then(r=>r.json()).then(r=>{
      this.script=r;
      this.show(0);
      if(callback)callback(this.script);
    }).catch(e=>console.log(e));
    this.index=0;
  }

  show(index:number){
    this.index=index;
    switch(this.script.scripts[index].type){
      case "setting":this.setting(index);break;
      case "animation":this.showAnimation(index);break;
      case undefined:this.showText(index);break;
    }
    this.animator.start();
  }

  showAnimation(index:number){
    this.animator=new AnimationAnimator(this.script.scripts[index].animation,this.script.scripts[index].duration,()=>{
      this.next();
    });
  }

  showText(index:number){
    if(this.script.scripts[index].name!==""){
      this.name_box.style.display="block";
      this.name_box.innerHTML=`<p>${this.script.scripts[index].name}</p>`;
      this.dialog_content.innerHTML+=`<div class="dialog-content dialog"><h3>${this.script.scripts[index].name}</h3><p>${this.script.scripts[index].text}</p><div>`;
    }else{
      this.name_box.style.display="none";
      this.dialog_content.innerHTML+=`<div class="dialog-content dialog"><p>${this.script.scripts[index].text}</p><div>`;
    }
    this.animator=new TextAnimator(this.script.scripts[index].text,undefined,(currnet:string)=>{this.text_box.innerHTML=`<p>${currnet}</p>`;},this.autoplay?this.autonext:()=>{});
  }

  next():boolean{
    if(this.animator.isEnd){
      if(this.index+1==this.script.scripts.length)return false;
      this.index++;
      this.show(this.index);
    }else{
      this.animator.end();
    }
    return true;
  }

  setting(index:number){
    this.script.scripts[index].settings.forEach(s=>{
      const target=s.split(":")[0];
      const state=s.split(":")[1];
      switch(target){
        case "text-ui":
          const ui=document.getElementById("text-ui")!;
          switch(state){
            case "hide":ui.style.display="none";break;
            case "show":ui.style.display="block";break;
          }
          break;
      }
    });
    this.animator=new NullAnimator(()=>{this.next()});
  }
}