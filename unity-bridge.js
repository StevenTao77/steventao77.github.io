/* Inserted into the COPY of a standard Unity Web build, before its loader. */
(() => {
  let instance,quitting=false;
  const send=(state,extra={})=>{if(parent!==window)parent.postMessage({type:'unity-status',state,...extra},location.origin);};
  function wrap(fn){if(typeof fn!=='function')return fn;return function(canvas,config,progress){send('loading',{progress:0});if(config){const banner=config.showBanner;config.showBanner=(text,type)=>{if(type==='error')send('error',{message:String(text)});if(banner)banner(text,type);};}return fn(canvas,config,p=>{send('loading',{progress:p});if(progress)progress(p);}).then(value=>{instance=value;if(quitting)return value.Quit().then(()=>value);send('ready');return value;}).catch(error=>{send('error',{message:String(error)});throw error;});};}
  window.portfolioCreateUnityInstance=(canvas,config,progress)=>wrap(window.createUnityInstance)(canvas,config,progress);
  window.addEventListener('error',e=>send('error',{message:e.message||'Unity 资源加载失败'}));
  window.addEventListener('unhandledrejection',e=>send('error',{message:String(e.reason)}));
  window.addEventListener('message',async e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='unity-quit')return;quitting=true;try{if(instance)await instance.Quit();}finally{send('quit');}});
  // The imported page should fill the cartridge screen at any browser size.
  const css=document.createElement('style');css.textContent='html,body{margin:0!important;width:100%!important;height:100%!important;overflow:hidden!important}#unity-container{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;transform:none!important}#unity-canvas{width:100%!important;height:100%!important;display:block!important}#unity-footer{display:none!important}';document.head.append(css);
  document.addEventListener('pointerdown',()=>document.querySelector('canvas')?.focus());
})();
