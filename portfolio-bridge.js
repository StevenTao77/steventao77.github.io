(() => {
  const defaults={accent:'#ff5a1f',background:'#ecebe6',fontSize:16,lineHeight:1.6,width:760,spacing:40,align:'left'};
  window.applyPortfolioStyle = (style={}) => {
    const s={...defaults,...style};
    const color=(v,d)=>/^#[0-9a-f]{6}$/i.test(v)?v:d;
    const num=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||min));
    let el=document.getElementById('portfolio-custom-style');if(!el){el=document.createElement('style');el.id='portfolio-custom-style';document.head.append(el);}
    // The page reads these CSS variables; the editor's style panel writes them.
    el.textContent=`:root{
      --accent:${color(s.accent,defaults.accent)};
      --bg:${color(s.background,defaults.background)};
      --body-size:${num(s.fontSize,12,20)}px;
      --body-leading:${num(s.lineHeight,1.3,2.2)};
      --content-width:${num(s.width,600,1100)}px;
      --block-gap:${num(s.spacing,16,64)}px;
      --content-align:${['left','right','center'].includes(s.align)?s.align:'left'};
    }`;
  };
})();
