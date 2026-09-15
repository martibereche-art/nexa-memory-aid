let context: AudioContext | undefined;
export async function playPrimeSound(id:string,volume:number){
 context??=new AudioContext();await context.resume();if(context.state!=='running')return;
 const ctx=context;
 const notes=id==='pulse'?[440,660,880]:id==='chime'?[659,988,1318]:[523,784,659,1047];
 notes.forEach((f,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();const start=ctx.currentTime+i*.13;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(Math.max(0,Math.min(100,volume))/100*.15,start+.025);g.gain.exponentialRampToValueAtTime(.001,start+.45);o.connect(g);g.connect(ctx.destination);o.start(start);o.stop(start+.5);});
}
