export type Scripts={scripts:{name:string,text:string}[]};

export class TextAnimator{
  offsets:Map<number,number>=new Map();
  source:string;
  current:string="";
  wps=10;
  offset=0;
  isEnd=false;
  id!:number;
  onupdate:(current:string)=>void=(_:string)=>{};
  onend:()=>void=()=>{};

  constructor(src:string,wps?:number,onupdate?:(current:string)=>void,onend?:()=>void){
    this.source=src;
    if(wps)this.wps=wps;
    Array.from(src.matchAll(/(<[^<]+>)|\n|\r|\s/g)).forEach(r=>{
      this.offsets.set(r.index,r[0].length);
      this.current+=r[0];
    });
    if(onupdate)this.onupdate=onupdate;
    if(onend)this.onend=onend;
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

  next():boolean{
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
  animator!:TextAnimator;

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
  }

  loadScript(name:string,callback?:(json:Scripts)=>void,index?:number){
    fetch(`./scripts/${name}/script${index?index:""}.json`).then(r=>r.json()).then(r=>{
      this.script=r;
      this.show(0);
      if(callback)callback(this.script);
    }).catch(e=>console.log(e));
    index=0;
  }

  show(index:number){
    this.index=index;
    if(this.script.scripts[index].name!==""){
      this.name_box.style.display="block";
      this.name_box.innerHTML=`<p>${this.script.scripts[index].name}</p>`;
    }else{
      this.name_box.style.display="none";
    }
    this.animator=new TextAnimator(this.script.scripts[index].text,undefined,(currnet:string)=>{this.text_box.innerHTML=`<p>${currnet}</p>`;},this.autoplay?this.autonext:()=>{});
    this.animator.start();
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
}