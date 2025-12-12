<script>
(function () {
    const urls = new Set(),
        pathRegex = /(https?:\/\/[^\s"'<>]+|\/[a-zA-Z0-9_\-\/\.]+)/g;

    document.querySelectorAll('[href],[src]').forEach(e => {
        const a = e.getAttribute('href') || e.getAttribute('src');
        if (a) try {
            urls.add(new URL(a, document.baseURI).href);
        } catch (e) {}
    });

    const promises = [];
    document.querySelectorAll('script').forEach(s => {
        if (!s.src) {
            const m = s.innerText.match(pathRegex);
            if (m) m.forEach(x => {
                try {
                    x.startsWith('/') ? urls.add(new URL(x, document.baseURI).href) : urls.add(x);
                } catch (e) {}
            });
            return;
        }

        const origin = (function () {
            try { return new URL(s.src).origin; }
            catch (e) { return document.location.origin; }
        })();

        const p = fetch(s.src)
            .then(r => {
                if (!r.ok) throw 0;
                return r.text();
            })
            .then(t => {
                const m = t.match(pathRegex);
                if (m) m.forEach(x => {
                    try {
                        x.startsWith('/') ? urls.add(origin + x) : urls.add(x);
                    } catch (e) {}
                });
            })
            .catch(() => {
                try { urls.add(s.src); } catch (e) {}
            });

        promises.push(p);
    });

    Promise.allSettled(promises).then(() => {
        const out = [...urls].sort();
        if (out.length === 0) {
            alert('Nenhuma URL encontrada.');
        } else {
            const text = out.join('\n');
            const w = window.open('', '_blank');
            if (w) {
                w.document.title = 'Found URLs';
                const pre = w.document.createElement('pre');
                pre.style.whiteSpace = 'pre-wrap';
                pre.textContent = text;
                w.document.body.appendChild(pre);
            } else {
                alert(text);
            }
        }
        console.log(out);
    });
})();
</script>
