/* Shared data contract: used by the editor, player and local server. */
(() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => 'p-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2));
  const defaults = {accent:'#f2a65a',background:'#17191c',fontSize:14,lineHeight:1.7,width:768,spacing:40,align:'left'};
  const layout = {width:960,padding:28,gap:24,background:'#17191c',color:'#e5e7eb',fontSize:16,fontFamily:'sans',mobileStack:true};
  const blockNames = {heading:'标题',text:'正文',image:'图片',gallery:'图集',video:'视频',split:'图文组合',info:'项目信息',code:'技术 / 代码',button:'按钮',divider:'分隔线',spacer:'留白'};
  function block(type='text') {return {id:uid(),type,hidden:false,title:type==='heading'?'新标题':'',text:type==='text'?'在这里介绍你的项目。':'',src:'',caption:'',alt:'',poster:'',items:[],url:'',label:'了解更多',action:'link',level:2,fontSize:type==='heading'?28:16,color:'#e5e7eb',align:'left',lineHeight:1.7,radius:12,ratio:'16 / 9',fit:'cover',columns:3,reverse:false,imageWidth:50,padding:0,space:24,background:'transparent',videoMode:'file',autoplay:false,loop:false};}
  function project(input={}) {
    const p={id:uid(),title:'新项目',subtitle:'',genre:'',cartridgeCode:'',accentColor:'#f2a65a',coverImage:'',techTags:[],description:'',githubUrl:'',downloadUrl:'',hidden:false,unityVersion:'',player:{mode:'none',url:'',ratio:'16 / 9',controls:'WASD：移动\n鼠标：视角 / 操作',bridge:false},layout:{...layout},blocks:[],...clone(input)};
    p.player={mode:p.sampleId?'sample':p.webglUrl?'url':'none',url:p.webglUrl||'',ratio:'16 / 9',controls:'',bridge:false,...input.player};
    p.layout={...layout,...input.layout};
    if (!Array.isArray(input.blocks)) {
      p.blocks=[{...block('heading'),title:p.title},{...block('image'),src:p.coverImage,alt:p.title},{...block('text'),text:p.description}];
      if(p.techTags.length)p.blocks.push({...block('info'),items:p.techTags.map(value=>({label:'技术',value}))});
      p.blocks.push({...block('button'),label:'Play Demo',action:'play'});
      if(p.githubUrl)p.blocks.push({...block('button'),label:'Source Code',url:p.githubUrl});
    }
    delete p.srcDoc; return p;
  }
  function migrate(value, original={}) {
    const v=clone(value||{version:2,data:original,style:defaults});
    v.version=2;v.style={...defaults,...v.style};v.data={...clone(original),...v.data};
    v.data.games=(v.data.games||original.games||[]).map(p=>project(p));return v;
  }
  const safeUrl = (u,media=false) => typeof u==='string' && (!u || /^https?:\/\/[^\s]+$/i.test(u) || /^\/(?!\/)[^\s]*$/.test(u) || /^\.\.?\/[^\s]*$/.test(u) || (media && /^data:(image\/(png|jpeg|webp|gif)|application\/pdf);base64,[a-z0-9+/=]+$/i.test(u))) && !/[\u0000-\u001f]/.test(u);
  const str = v => typeof v==='string';
  const strs = v => Array.isArray(v)&&v.every(str);
  const color = v => /^#[a-f\d]{6}$/i.test(v);
  const number = (v,a,b) => Number.isFinite(v)&&v>=a&&v<=b;
  function validate(v) {
    const d=v?.data,s=v?.style;
    if(v?.version!==2||!d||!s)throw Error('配置版本或内容不正确');
    if(!str(d.header?.name)||!str(d.header?.role)||!str(d.hero?.title)||!safeUrl(d.about?.avatar,true)||!strs(d.about?.bio)||!strs(d.about?.skills))throw Error('基本资料格式不正确');
    if(!safeUrl(d.resume?.downloadPdfUrl,true)||!Array.isArray(d.resume?.experiences)||!d.resume.experiences.every(x=>str(x.role)&&str(x.company)&&str(x.period)&&strs(x.highlights))||!Array.isArray(d.resume?.education)||!d.resume.education.every(x=>str(x.degree)&&str(x.school)&&str(x.period)))throw Error('简历格式不正确');
    if(!str(d.contact?.email)||!Array.isArray(d.contact?.links)||!d.contact.links.every(x=>str(x.label)&&safeUrl(x.url)&&str(x.icon)))throw Error('联系方式需要完整的 http(s) 链接');
    if(!color(s.accent)||!color(s.background)||!['left','center','right'].includes(s.align)||!number(s.fontSize,12,20)||!number(s.lineHeight,1.3,2.2)||!number(s.width,600,1100)||!number(s.spacing,16,64))throw Error('排版数值超出范围');
    if(!Array.isArray(d.games)||d.games.length>100)throw Error('项目列表不正确（最多 100 项）');
    const ids=new Set();
    for(const p of d.games){
      if(!/^[a-z\d_-]+$/i.test(p.id)||ids.has(p.id))throw Error('项目 ID 重复或无效');ids.add(p.id);
      if(!str(p.title)||!str(p.subtitle)||!strs(p.techTags)||!color(p.accentColor)||!safeUrl(p.coverImage,true)||!safeUrl(p.downloadUrl)||!safeUrl(p.githubUrl))throw Error('项目内容或链接无效');
      if(!['none','sample','local','url'].includes(p.player?.mode)||!safeUrl(p.player.url)||!['16 / 9','4 / 3','9 / 16','1 / 1'].includes(p.player.ratio)||!str(p.player.controls))throw Error('游戏设置无效');
      const l=p.layout;if(!l||!number(l.width,480,1400)||!number(l.padding,0,80)||!number(l.gap,0,80)||!number(l.fontSize,12,24)||!color(l.background)||!color(l.color)||!['sans','mono','serif'].includes(l.fontFamily))throw Error('详情布局无效');
      if(!Array.isArray(p.blocks)||p.blocks.length>150)throw Error('详情区块过多或无效');
      const bids=new Set();
      for(const b of p.blocks){
        if(!b||!blockNames[b.type]||!str(b.id)||bids.has(b.id))throw Error('区块类型或 ID 无效');bids.add(b.id);
        if(!safeUrl(b.src,true)||!safeUrl(b.url)||!safeUrl(b.poster,true)||!color(b.color)||(b.background!=='transparent'&&!color(b.background))||!['left','center','right'].includes(b.align)||!number(b.fontSize,10,64)||!number(b.lineHeight,1,3)||!number(b.radius,0,60)||!number(b.padding,0,80)||!number(b.space,0,160)||!number(b.imageWidth,20,80)||!number(b.columns,1,4)||!['auto','16 / 9','4 / 3','9 / 16','1 / 1'].includes(b.ratio)||!['cover','contain'].includes(b.fit)||!['link','play','download'].includes(b.action)||!['file','embed'].includes(b.videoMode)||!number(b.level,1,4)||!str(b.title)||!str(b.text)||!str(b.label)||!str(b.caption)||!str(b.alt))throw Error('区块内容、格式或网址无效');
        if(!Array.isArray(b.items)||b.items.length>100||!b.items.every(x=>b.type==='gallery'?safeUrl(x.src,true)&&str(x.alt)&&str(x.caption):str(x.label)&&str(x.value)))throw Error('图集或信息列表无效');
      }
    }
    return true;
  }
  function embedUrl(value){try{const u=new URL(value);if(['www.youtube.com','youtube.com','m.youtube.com'].includes(u.hostname)){const id=u.searchParams.get('v')||u.pathname.split('/').pop();if(/^[\w-]{11}$/.test(id))return 'https://www.youtube-nocookie.com/embed/'+id;}if(u.hostname==='youtu.be'&&/^[\w-]{11}$/.test(u.pathname.slice(1)))return 'https://www.youtube-nocookie.com/embed/'+u.pathname.slice(1);if(['www.youtube-nocookie.com','www.youtube.com'].includes(u.hostname)&&/^\/embed\/[\w-]{11}$/.test(u.pathname))return value;if(['vimeo.com','player.vimeo.com'].includes(u.hostname)){const id=u.pathname.split('/').pop();if(/^\d+$/.test(id))return 'https://player.vimeo.com/video/'+id;}}catch{}return '';}
  globalThis.PortfolioModel={clone,uid,defaults,layout,blockNames,block,project,migrate,validate,safeUrl,embedUrl};
})();
