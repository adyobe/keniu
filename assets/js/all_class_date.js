const zeroPadding = (a = 0, b = 2, c = true) => {
  a = String(a);
  b = Math.abs(parseInt(b));
  return (Array(b).join("0") + a).slice(-(c ? Math.max(a.length, b) : b));
};/*a(文字列に変換)の前にb(絶対値の数値に変換,0のときそのまま,default2)桁になるように0を詰める 桁溢れはc=TRUEで消さない、c=falseで消す*/

(() => {
  let now = new Date();
  for (const i of document.getElementsByClassName("date")) {
    i.innerHTML = "<span>00月00日00時00分00</span>秒";
    i.children[0].innerHTML = zeroPadding(now.getMonth() + 1) + "月" + zeroPadding(now.getDate()) + "日" + zeroPadding(now.getHours()) + "時" + zeroPadding(now.getMinutes()) + "分" + zeroPadding(now.getSeconds());
  }
})();
setInterval(() => {
  let now = new Date();
  for (const i of document.getElementsByClassName("date")) {
    i.children[0].innerHTML = zeroPadding(now.getMonth() + 1) + "月" + zeroPadding(now.getDate()) + "日" + zeroPadding(now.getHours()) + "時" + zeroPadding(now.getMinutes()) + "分" + zeroPadding(now.getSeconds());
  }
}, 100);