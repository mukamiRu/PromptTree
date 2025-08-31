
// ----------------------
// DOM取得
// ----------------------
const inputText = document.getElementById('inputText');
const outputCode = document.getElementById('outputCode');
const sampleButton = document.getElementById('sampleButton');
const clearButton = document.getElementById('clearButton');
const copyButton = document.getElementById('copyButton');
const emojiToggle = document.getElementById('emojiToggle');
const markdownToggle = document.getElementById('markdownToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const copyMessage = document.getElementById('copyMessage');

// サンプルテキスト
const sampleText = `my_project
  src
    components
      Header.jsx
      Footer.jsx
    pages
      index.jsx
      about.jsx
  README.md
  package.json`;

// 状態管理
let sampleVisible = true;
let originalInput = '';

// ----------------------
// UI更新
// ----------------------
function updateSampleUI(){
  if(sampleVisible){
    inputText.classList.add('sample-active');
    inputText.classList.remove('user-input');
    sampleButton.textContent = "サンプル非表示";
  } else {
    inputText.classList.remove('sample-active');
    inputText.classList.add('user-input');
    sampleButton.textContent = "サンプル表示";
  }
}

// ----------------------
// ツリー生成
// ----------------------
function generateTree(){
  if(!inputText.value.trim()){ outputCode.textContent=''; return; }

  const lines = inputText.value.split('\n').filter(l=>l.trim()!=='');
  const useEmoji = emojiToggle.checked;
  let output=[];

  const parsed = lines.map(line=>{
    const indent = line.match(/^\s*/)[0].length/2;
    return {indent, name: line.trim()};
  });

  for(let i=0;i<parsed.length;i++){
    const cur = parsed[i];
    let prefix='';
    for(let j=0;j<cur.indent;j++){
      let hasSibling=false;
      for(let k=i+1;k<parsed.length;k++){
        if(parsed[k].indent===j){ hasSibling=true; break; }
        if(parsed[k].indent<j) break;
      }
      prefix += hasSibling ? '│   ' : '    ';
    }
    let isLast=true;
    for(let k=i+1;k<parsed.length;k++){
      if(parsed[k].indent===cur.indent){ isLast=false; break; }
      if(parsed[k].indent<cur.indent) break;
    }
    const linePrefix = cur.indent>0 ? (isLast ? '└── ':'├── ') : '';
    const icon = useEmoji ? (cur.name.includes('.')?'📄 ':'📁 ') : '';
    output.push(`${prefix}${linePrefix}${icon}${cur.name}`);
  }

  let text = output.join('\n');
  if(markdownToggle.checked) text='```\n'+text+'\n```';
  outputCode.textContent = text;
}

// ----------------------
// Tabキーでインデント
// ----------------------
inputText.addEventListener('keydown', function(e){
  if(e.key==='Tab'){
    e.preventDefault();
    const start=this.selectionStart;
    const end=this.selectionEnd;
    this.value=this.value.substring(0,start)+'  '+this.value.substring(end);
    this.selectionStart=this.selectionEnd=start+2;
    generateTree();
  }
});

// ----------------------
// 入力開始でサンプル非表示
// ----------------------
inputText.addEventListener('input', ()=>{
  if(sampleVisible){
    originalInput='';
    hideSample();
  } else {
    originalInput = inputText.value;
    generateTree();
  }
});

// ----------------------
// サンプル表示 / 非表示
// ----------------------
function showSample(){
  sampleVisible=true;
  inputText.value = sampleText;
  originalInput='';
  updateSampleUI();
  generateTree();
}
function hideSample(){
  sampleVisible=false;
  inputText.value = originalInput;
  updateSampleUI();
  generateTree();
}
sampleButton.addEventListener('click', ()=>{ sampleVisible?hideSample():showSample(); });

// ----------------------
// 全削除
// ----------------------
clearButton.addEventListener('click', ()=>{
  inputText.value='';
  outputCode.textContent='';
  sampleVisible=false;
  originalInput='';
  updateSampleUI();
});

// ----------------------
// コピー
// ----------------------
copyButton.addEventListener('click', ()=>{
  const ta=document.createElement('textarea');
  ta.value=outputCode.textContent;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  copyMessage.classList.remove('hidden');
  setTimeout(()=>copyMessage.classList.add('hidden'),2000);
});

// ----------------------
// Markdown切替・Emoji切替
// ----------------------
markdownToggle.addEventListener('change', generateTree);
emojiToggle.addEventListener('change', generateTree);

// ----------------------
// ダークモード
// ----------------------
darkModeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});
function applyInitialDarkMode(){
  const saved = localStorage.getItem('darkMode');
  if(saved==='true') document.body.classList.add('dark');
  else if(!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.body.classList.add('dark');
}

// 初期化
window.onload = ()=>{
  applyInitialDarkMode();
  showSample();
};