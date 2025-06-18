const E = {
  mounted(r) {
    var p;
    const a = r.nodeName;
    if (!["TABLE", "THEAD"].includes(a)) return;
    const o = a === "TABLE" ? r : r.parentElement, c = o.querySelector("thead"), l = (c == null ? void 0 : c.querySelectorAll("th")) || [], v = a === "TABLE" ? o.offsetHeight : (c == null ? void 0 : c.offsetHeight) || 0, i = document.createElement("div");
    o.style.position = "relative", i.style.position = "relative", i.style.width = `${o.offsetWidth}px`, i.className = "vue3-columns-resizable", (p = o.parentElement) == null || p.insertBefore(i, o);
    let u = !1, d = 0;
    l.forEach((s, t) => {
      if (s.style.width = `${s.offsetWidth}px`, t + 1 >= l.length) return;
      const n = l[t + 1], e = document.createElement("div");
      e.style.position = "absolute", e.style.left = `${n.offsetLeft - 4}px`, e.style.top = "0", e.style.height = `${v}px`, e.style.width = "8px", e.style.cursor = "col-resize", e.style.zIndex = "1", e.className = "columns-resize-bar", e.addEventListener("mousedown", () => {
        u = !0, d = t, document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
      }), i.appendChild(e);
    });
    const m = i.querySelectorAll(".columns-resize-bar");
    document.addEventListener("mouseup", () => {
      u && (u = !1, document.body.style.cursor = "", document.body.style.userSelect = "", m.forEach((s, t) => {
        const n = l[t], e = l[t + 1];
        n.style.width = `${n.offsetWidth}px`, e && (s.style.left = `${e.offsetLeft - 4}px`);
      }));
    });
    const h = (s) => +s.replace("px", ""), y = (s) => {
      if (!u) return;
      const t = l[d], n = l[d + 1], e = m[d], f = s.movementX, x = h(t.style.width) + f, b = h(n.style.width) - f;
      t.style.width = `${x}px`, n.style.width = `${b}px`, e.style.left = `${n.offsetLeft - 4 + f}px`, r.dispatchEvent(new CustomEvent("column-resized", {
        detail: {
          index: d,
          width: x,
          nextIndex: d + 1,
          nextWidth: b
        },
        bubbles: !0
      }));
    };
    i.addEventListener("mousemove", y), o.addEventListener("mousemove", y);
  }
}, w = {
  install(r) {
    r.directive("columns-resizable", E);
  }
};
export {
  w as default
};
