(() => {
  const defaults={accent:'#f2a65a',background:'#17191c',fontSize:14,lineHeight:1.7,width:768,spacing:40,align:'left'};
  window.applyPortfolioStyle = (style={}) => {
    const s={...defaults,...style};
    const color=v=>/^#[0-9a-f]{6}$/i.test(v)?v:defaults.accent;
    const num=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||min));
    let el=document.getElementById('portfolio-custom-style');if(!el){el=document.createElement('style');el.id='portfolio-custom-style';document.head.append(el);}
    el.textContent=`
      [class*="text-[#F2A65A]"]{color:${color(s.accent)}!important}
      [class*="bg-[#F2A65A]"]{background-color:${color(s.accent)}!important}
      [class*="bg-[#F2A65A]/"]{background-color:${color(s.accent)}33!important}
      [class*="border-[#F2A65A]"]{border-color:${color(s.accent)}88!important}
      body, #root>div{background-color:${color(s.background)}!important}
      .portfolio-content{max-width:${num(s.width,600,1100)}px!important;text-align:${['left','right','center'].includes(s.align)?s.align:'left'}!important}
      .portfolio-content .text-xs,.portfolio-content .text-sm{font-size:${num(s.fontSize,12,20)}px!important;line-height:${num(s.lineHeight,1.3,2.2)}!important}
      .portfolio-content .text-center,.portfolio-content [class*="text-left"]{text-align:inherit!important}
      .portfolio-content> :not([hidden])~ :not([hidden]){margin-top:${num(s.spacing,16,64)}px!important}
    `;
  };
})();
