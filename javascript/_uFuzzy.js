class TacFuzzy {
    /*! https://github.com/leeoniya/uFuzzy (v1.0.14) */
    static #uFuzzy = function(){"use strict";const e=new Intl.Collator("en",{numeric:!0,sensitivity:"base"}).compare,t=1/0,l=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),n="eexxaacctt",r=/\p{P}/gu,i=(e,t,l)=>e.replace("A-Z",t).replace("a-z",l),s={unicode:!1,alpha:null,interSplit:"[^A-Za-z\\d']+",intraSplit:"[a-z][A-Z]",interBound:"[^A-Za-z\\d]",intraBound:"[A-Za-z]\\d|\\d[A-Za-z]|[a-z][A-Z]",interLft:0,interRgt:0,interChars:".",interIns:t,intraChars:"[a-z\\d']",intraIns:null,intraContr:"'[a-z]{1,2}\\b",intraMode:0,intraSlice:[1,t],intraSub:null,intraTrn:null,intraDel:null,intraFilt:()=>!0,sort:(t,l)=>{let{idx:n,chars:r,terms:i,interLft2:s,interLft1:a,start:g,intraIns:u,interIns:f}=t;return n.map(((e,t)=>t)).sort(((t,h)=>r[h]-r[t]||u[t]-u[h]||i[h]+s[h]+.5*a[h]-(i[t]+s[t]+.5*a[t])||f[t]-f[h]||g[t]-g[h]||e(l[n[t]],l[n[h]])))}},a=(e,l)=>0==l?"":1==l?e+"??":l==t?e+"*?":e+`{0,${l}}?`,g="(?:\\b|_)";function u(e){e=Object.assign({},s,e);let{unicode:t,interLft:u,interRgt:f,intraMode:c,intraSlice:o,intraIns:p,intraSub:d,intraTrn:m,intraDel:x,intraContr:b,intraSplit:R,interSplit:L,intraBound:A,interBound:S,intraChars:z}=e;p??=c,d??=c,m??=c,x??=c;let E=e.letters??e.alpha;if(null!=E){let e=E.toLocaleUpperCase(),t=E.toLocaleLowerCase();L=i(L,e,t),R=i(R,e,t),S=i(S,e,t),A=i(A,e,t),z=i(z,e,t),b=i(b,e,t)}let I=t?"u":"";const C='".+?"',y=RegExp(C,"gi"+I),k=RegExp(`(?:\\s+|^)-(?:${z}+|${C})`,"gi"+I);let{intraRules:j}=e;null==j&&(j=e=>{let t=s.intraSlice,l=0,n=0,r=0,i=0;if(/[^\d]/.test(e)){let s=e.length;s>4?(t=o,l=p,n=d,r=m,i=x):3>s||(r=Math.min(m,1),4==s&&(l=Math.min(p,1)))}return{intraSlice:t,intraIns:l,intraSub:n,intraTrn:r,intraDel:i}});let Z=!!R,$=RegExp(R,"g"+I),w=RegExp(L,"g"+I),M=RegExp("^"+L+"|"+L+"$","g"+I),B=RegExp(b,"gi"+I);const D=e=>{let t=[];e=(e=e.replace(y,(e=>(t.push(e),n)))).replace(M,"").toLocaleLowerCase(),Z&&(e=e.replace($,(e=>e[0]+" "+e[1])));let l=0;return e.split(w).filter((e=>""!=e)).map((e=>e===n?t[l++]:e))},T=/[^\d]+|\d+/g,F=(t,n=0,r=!1)=>{let i=D(t);if(0==i.length)return[];let s,h=Array(i.length).fill("");if(i=i.map(((e,t)=>e.replace(B,(e=>(h[t]=e,""))))),1==c)s=i.map(((e,t)=>{if('"'===e[0])return l(e.slice(1,-1));let n="";for(let l of e.matchAll(T)){let e=l[0],{intraSlice:r,intraIns:i,intraSub:s,intraTrn:g,intraDel:u}=j(e);if(i+s+g+u==0)n+=e+h[t];else{let[l,f]=r,c=e.slice(0,l),o=e.slice(f),p=e.slice(l,f);1==i&&1==c.length&&c!=p[0]&&(c+="(?!"+c+")");let d=p.length,m=[e];if(s)for(let e=0;d>e;e++)m.push(c+p.slice(0,e)+z+p.slice(e+1)+o);if(g)for(let e=0;d-1>e;e++)p[e]!=p[e+1]&&m.push(c+p.slice(0,e)+p[e+1]+p[e]+p.slice(e+2)+o);if(u)for(let e=0;d>e;e++)m.push(c+p.slice(0,e+1)+"?"+p.slice(e+1)+o);if(i){let e=a(z,1);for(let t=0;d>t;t++)m.push(c+p.slice(0,t)+e+p.slice(t)+o)}n+="(?:"+m.join("|")+")"+h[t]}}return n}));else{let e=a(z,p);2==n&&p>0&&(e=")("+e+")("),s=i.map(((t,n)=>'"'===t[0]?l(t.slice(1,-1)):t.split("").map(((e,t,l)=>(1==p&&0==t&&l.length>1&&e!=l[t+1]&&(e+="(?!"+e+")"),e))).join(e)+h[n]))}let o=2==u?g:"",d=2==f?g:"",m=d+a(e.interChars,e.interIns)+o;return n>0?r?s=o+"("+s.join(")"+d+"|"+o+"(")+")"+d:(s="("+s.join(")("+m+")(")+")",s="(.??"+o+")"+s+"("+d+".*)"):(s=s.join(m),s=o+s+d),[RegExp(s,"i"+I),i,h]},O=(e,t,l)=>{let[n]=F(t);if(null==n)return null;let r=[];if(null!=l)for(let t=0;l.length>t;t++){let i=l[t];n.test(e[i])&&r.push(i)}else for(let t=0;e.length>t;t++)n.test(e[t])&&r.push(t);return r};let v=!!A,U=RegExp(S,I),N=RegExp(A,I);const P=(t,l,n)=>{let[r,i,s]=F(n,1),[a]=F(n,2),g=i.length,h=t.length,c=Array(h).fill(0),o={idx:Array(h),start:c.slice(),chars:c.slice(),terms:c.slice(),interIns:c.slice(),intraIns:c.slice(),interLft2:c.slice(),interRgt2:c.slice(),interLft1:c.slice(),interRgt1:c.slice(),ranges:Array(h)},p=1==u||1==f,d=0;for(let n=0;t.length>n;n++){let h=l[t[n]],c=h.match(r),m=c.index+c[1].length,x=m,b=!1,R=0,L=0,A=0,S=0,z=0,E=0,C=0,y=0,k=[];for(let t=0,l=2;g>t;t++,l+=2){let n=c[l].toLocaleLowerCase(),r=i[t],a='"'==r[0]?r.slice(1,-1):r+s[t],o=a.length,d=n.length,j=n==a;if(!j&&c[l+1].length>=o){let e=c[l+1].toLocaleLowerCase().indexOf(a);e>-1&&(k.push(x,d,e,o),x+=_(c,l,e,o),n=a,d=o,j=!0,0==t&&(m=x))}if(p||j){let e=x-1,r=x+d,i=!1,s=!1;if(-1==e||U.test(h[e]))j&&R++,i=!0;else{if(2==u){b=!0;break}if(v&&N.test(h[e]+h[e+1]))j&&L++,i=!0;else if(1==u){let e=c[l+1],r=x+d;if(e.length>=o){let s,g=0,u=!1,f=RegExp(a,"ig"+I);for(;s=f.exec(e);){g=s.index;let e=r+g,t=e-1;if(-1==t||U.test(h[t])){R++,u=!0;break}if(N.test(h[t]+h[e])){L++,u=!0;break}}u&&(i=!0,k.push(x,d,g,o),x+=_(c,l,g,o),n=a,d=o,j=!0,0==t&&(m=x))}if(!i){b=!0;break}}}if(r==h.length||U.test(h[r]))j&&A++,s=!0;else{if(2==f){b=!0;break}if(v&&N.test(h[r-1]+h[r]))j&&S++,s=!0;else if(1==f){b=!0;break}}j&&(z+=o,i&&s&&E++)}if(d>o&&(y+=d-o),t>0&&(C+=c[l-1].length),!e.intraFilt(a,n,x)){b=!0;break}g-1>t&&(x+=d+c[l+1].length)}if(!b){o.idx[d]=t[n],o.interLft2[d]=R,o.interLft1[d]=L,o.interRgt2[d]=A,o.interRgt1[d]=S,o.chars[d]=z,o.terms[d]=E,o.interIns[d]=C,o.intraIns[d]=y,o.start[d]=m;let e=h.match(a),l=e.index+e[1].length,r=k.length,i=r>0?0:1/0,s=r-4;for(let t=2;e.length>t;)if(i>s||k[i]!=l)l+=e[t].length,t++;else{let n=k[i+1],r=k[i+2],s=k[i+3],a=t,g="";for(let t=0;n>t;a++)g+=e[a],t+=e[a].length;e.splice(t,a-t,g),l+=_(e,t,r,s),i+=4}l=e.index+e[1].length;let g=o.ranges[d]=[],u=l,f=l;for(let t=2;e.length>t;t++){let n=e[t].length;l+=n,t%2==0?f=l:n>0&&(g.push(u,f),u=f=l)}f>u&&g.push(u,f),d++}}if(t.length>d)for(let e in o)o[e]=o[e].slice(0,d);return o},_=(e,t,l,n)=>{let r=e[t]+e[t+1].slice(0,l);return e[t-1]+=r,e[t]=e[t+1].slice(l,l+n),e[t+1]=e[t+1].slice(l+n),r.length};return{search:(...t)=>((t,n,i,s=1e3,a)=>{i=i?!0===i?5:i:0;let g=null,u=null,f=[];n=n.replace(k,(e=>{let t=e.trim().slice(1);return t='"'===t[0]?l(t.slice(1,-1)):t.replace(r,""),""!=t&&f.push(t),""}));let c,o=D(n);if(f.length>0){if(c=RegExp(f.join("|"),"i"+I),0==o.length){let e=[];for(let l=0;t.length>l;l++)c.test(t[l])||e.push(l);return[e,null,null]}}else if(0==o.length)return[null,null,null];if(i>0){let e=D(n);if(e.length>1){let l=e.slice().sort(((e,t)=>t.length-e.length));for(let e=0;l.length>e;e++){if(0==a?.length)return[[],null,null];a=O(t,l[e],a)}if(e.length>i)return[a,null,null];g=h(e).map((e=>e.join(" "))),u=[];let n=new Set;for(let e=0;g.length>e;e++)if(a.length>n.size){let l=a.filter((e=>!n.has(e))),r=O(t,g[e],l);for(let e=0;r.length>e;e++)n.add(r[e]);u.push(r)}else u.push([])}}null==g&&(g=[n],u=[a?.length>0?a:O(t,n)]);let p=null,d=null;if(f.length>0&&(u=u.map((e=>e.filter((e=>!c.test(t[e])))))),s>=u.reduce(((e,t)=>e+t.length),0)){p={},d=[];for(let l=0;u.length>l;l++){let n=u[l];if(null==n||0==n.length)continue;let r=g[l],i=P(n,t,r),s=e.sort(i,t,r);if(l>0)for(let e=0;s.length>e;e++)s[e]+=d.length;for(let e in i)p[e]=(p[e]??[]).concat(i[e]);d=d.concat(s)}}return[[].concat(...u),p,d]})(...t),split:D,filter:O,prepQuery:F,info:P,sort:e.sort}}const f=(()=>{let e={A:"ÁÀÃÂÄĄ",a:"áàãâäą",E:"ÉÈÊËĖ",e:"éèêëę",I:"ÍÌÎÏĮ",i:"íìîïį",O:"ÓÒÔÕÖ",o:"óòôõö",U:"ÚÙÛÜŪŲ",u:"úùûüūų",C:"ÇČĆ",c:"çčć",L:"Ł",l:"ł",N:"ÑŃ",n:"ñń",S:"ŠŚ",s:"šś",Z:"ŻŹ",z:"żź"},t=new Map,l="";for(let n in e)e[n].split("").forEach((e=>{l+=e,t.set(e,n)}));let n=RegExp(`[${l}]`,"g"),r=e=>t.get(e);return e=>{if("string"==typeof e)return e.replace(n,r);let t=Array(e.length);for(let l=0;e.length>l;l++)t[l]=e[l].replace(n,r);return t}})();function h(e){let t,l,n=(e=e.slice()).length,r=[e.slice()],i=Array(n).fill(0),s=1;for(;n>s;)s>i[s]?(t=s%2&&i[s],l=e[s],e[s]=e[t],e[t]=l,++i[s],s=1,r.push(e.slice())):(i[s]=0,++s);return r}const c=(e,t)=>t?`<mark>${e}</mark>`:e,o=(e,t)=>e+t;return u.latinize=f,u.permute=e=>h([...Array(e.length).keys()]).sort(((e,t)=>{for(let l=0;e.length>l;l++)if(e[l]!=t[l])return e[l]-t[l];return 0})).map((t=>t.map((t=>e[t])))),u.highlight=function(e,t,l=c,n="",r=o){n=r(n,l(e.substring(0,t[0]),!1))??n;for(let i=0;t.length>i;i+=2)n=r(n,l(e.substring(t[i],t[i+1]),!0))??n,t.length-3>i&&(n=r(n,l(e.substring(t[i+1],t[i+2]),!1))??n);return r(n,l(e.substring(t[t.length-1]),!1))??n},u}();

    // Set up uFuzzy for TAC

    // Type-ahead sorting (from uFuzzy demo)
    static #cmp = new Intl.Collator('en').compare;
    static #typeAheadSort = (info, haystack, needle) => {
        let {
            idx,
            chars,
            terms,
            interLft2,
            interLft1,
        //  interRgt2,
        //  interRgt1,
            start,
            intraIns,
            interIns,
        } = info;

        return idx.map((v, i) => i).sort((ia, ib) => (
            // most contig chars matched
            chars[ib] - chars[ia] ||
            // least char intra-fuzz (most contiguous)
            intraIns[ia] - intraIns[ib] ||
            // earliest start of match
            start[ia] - start[ib] ||
            // shortest match first
            haystack[idx[ia]].length - haystack[idx[ib]].length ||
            // most prefix bounds, boosted by full term matches
            (
                (terms[ib] + interLft2[ib] + 0.5 * interLft1[ib]) -
                (terms[ia] + interLft2[ia] + 0.5 * interLft1[ia])
            ) ||
            // highest density of match (least span)
        //  span[ia] - span[ib] ||
            // highest density of match (least term inter-fuzz)
            interIns[ia] - interIns[ib] ||
            // alphabetic
            this.#cmp(haystack[idx[ia]], haystack[idx[ib]])
        ))
    };
    // Options
    static #oooPermute = true;
    static #infoThresh = Infinity; // Make sure we are always getting info, performance isn't that bad for the default tag sets
    static #usePrefixCache = false;
    static #tacFuzzyOpts = {
        intraIns: 10,
        interIns: Infinity,
        intraChars: "[\\w\\-']", // Alphanumeric, hyphen, underscore & apostrophe
        interChars: "[^\\s,|\\[\\]:]", // Everything except tag separators
        interLft: 1, // loose
        sort: (info, haystack, needle) => { return info["idx"].map((v, i) => i); }
    }
    static #tacFuzzyOptsUnicode = {
        intraIns: 10,
        interIns: Infinity,
        unicode: true,
        interSplit: "[^\\p{L}\\d']+",
        intraSplit: "\\p{Ll}\\p{Lu}",
        intraBound: "\\p{L}\\d|\\d\\p{L}|\\p{Ll}\\p{Lu}",
        intraChars: "[\\p{L}\\d']",
        interChars: "[^\\s,|\\[\\]:]", // Everything except tag separators
        intraContr: "'\\p{L}{1,2}\\b",
        interLft: 1, // loose
        sort: (info, haystack, needle) => { return info["idx"].map((v, i) => i); }
    }
    static #u = new this.#uFuzzy(this.#tacFuzzyOpts);
    static #uUnicode = new this.#uFuzzy(this.#tacFuzzyOptsUnicode);
    // Prefilter function to reduce search scope (from uFuzzy demo)
    static #prefixCache = [];
    static #prefilter = (haystack, needle) => {
        // find longest matching prefix <= needle.length
        let li = null;
        this.#prefixCache.forEach((c, i) => {
            if (c.needle.length <= needle.length && needle.indexOf(c.needle) == 0) {
                if (li == null || c.needle.length > this.#prefixCache[li].needle.length) {
                    li = i;
                }
            }
        });

        // when not outOfOrder, reset prefix cache if what's in cache has no prefix of current needle
        if (this.#prefixCache.length > 0 && li == null)
            this.#prefixCache.length = 0;

        let idxs = (
            li == null ? this.#u.filter(haystack, needle) :
            this.#prefixCache[li].needle.length == needle.length ? this.#prefixCache[li].idxs :
            this.#u.filter(haystack, needle, this.#prefixCache[li].idxs)
        );

        if (idxs.length <= 1e4 && (li == null || needle != this.#prefixCache[li].needle)) {
            this.#prefixCache.push({
                needle,
                idxs,
            });

            let cacheLen = this.#prefixCache.length;

            // trim cache to 10 prefixes
            if (cacheLen > 10)
                this.#prefixCache = this.#prefixCache.slice(1);
        }

        return idxs;
    }

    /**
     * uFuzzy search function adjusted for TACs requirements
     * @param {String[]} haystack - The list of strings to search
     * @param {String} needle - The search term (tagword)
     * @returns A list of uFuzzy search results
     */
    static search = (haystack, needle, unicode = false) => {
        let preFiltered = this.#usePrefixCache ? this.#prefilter(haystack, needle) : null;

        let [idxs, info, order] = unicode
            ? this.#uUnicode.search(haystack, needle, this.#oooPermute, this.#infoThresh, preFiltered)
            : this.#u.search(haystack, needle, this.#oooPermute, this.#infoThresh, preFiltered);

        if (idxs != null) {
            if (info != null) {
                this.toStr = oi => {
                    let hi = info.idx[oi];
                    let mark = (part, matched) => matched ? '<b class="acMatchHighlight">' + part + '</b>' : part;
                    return this.#uFuzzy.highlight(haystack[hi], info.ranges[oi], mark);
                };
                return order.map(oi => [info.idx[oi], oi])
            }
            else if (idxs.length > 0) {
                this.toStr = idx => haystack[idx];
                return idxs;
            }
        }

        return [];
    }
    static check = (text, needle, unicode = false) => {
        let [query] = unicode
            ? this.#uUnicode.prepQuery(needle)
            : this.#u.prepQuery(needle);
        return query?.test(text) || false;
    }
    /** Gets the string representation function for the uFuzzy results.
     * Is overwritten by the search function to apply higlighting on matches above the info threshold
     */
    static toStr = m => toStr(m)
    /** Clears the prefix cache */
    static clear = () => {
        this.#prefixCache.length = 0;
    }
    static manualHighlight = (full, partial) => {
        if (!partial || full === partial) return null;
        
        // Prepare strings
        const originalFull = full;
        full = full.toLowerCase();
        partial = partial.toLowerCase();
        
        let lastIndex = 0;
        // Loop through all matches
        let indexes = [...partial].map(char => {
            let index = full.indexOf(char, lastIndex);
            if (index > -1)
                lastIndex = index + 1;
            return index;
        }).filter(index => index > -1);
        // Create ranges of indexes next to each other
        let ranges = [];
        let start = indexes[0];
        let end = indexes[0];

        for (let i = 1; i < indexes.length; i++) {
            if (indexes[i] === end + 1) {
                // Extend the current range
                end = indexes[i];
            } else {
                // Push the current range to the list and start a new range
                ranges.push([start, end]);
                start = indexes[i];
                end = indexes[i];
            }
        }

        // Push the last range to the list
        ranges.push([start, end]);
        let highlightedString = "";
        let currentIndex = 0;
        for (let [rangeStart, rangeEnd] of ranges) {
            // Append unhighlighted part
            highlightedString += originalFull.substring(currentIndex, rangeStart);
            // Append highlighted part wrapped in <b> tags
            highlightedString += "<b class=\"acMatchHighlight\">" + originalFull.substring(rangeStart, rangeEnd + 1) + "</b>";
            currentIndex = rangeEnd + 1;
        }
        // Append the remaining unhighlighted part
        highlightedString += originalFull.substring(currentIndex);

        return highlightedString;
    }

    // Utility to construct results for a given haystack
    /**
     * 
     * @param {int[][]} pairs - Size two array of [index, orderIndex] for the fuzzy results
     * @param {"base"|"alias"} sourceName - Whether the match matches the base text or an alias
     * @param {"tag"|"extra"} targetName - The type of the target (i.e. which haystack to use for the result data)
     * @param {Set<Number>} indexSet - Set of indices to avoid duplicates for cases where tag and alias would both match
     * @param {AutocompleteResult[]} output - The list to append the results to
     */
    static assignResults = (pairs, sourceName, targetName, indexSet, output) => {
        pairs.forEach(pair => {
            const idx = pair[0];
            const orderIdx = pair[1];
            if (!indexSet.has(idx)) {
                let target, resultType;
                switch (targetName) {
                    case "tag":
                        target = allTags[idx];
                        resultType = ResultType.tag;
                        break;
                    case "extra":
                        target = extras[idx];
                        resultType = ResultType.extra;
                        break;
                    default:
                        target = allTags[idx];
                        resultType = ResultType.tag;
                }
                const result = new AutocompleteResult(target[0], resultType);
                result.highlightedText = TacFuzzy.toStr(orderIdx);
                result.matchSource = sourceName;

                result.category = target[1];

                if (targetName === "tag")
                    result.count = target[2];
                else if (targetName === "extra")
                    result.meta = target[2] || "Custom tag";
                
                result.aliases = target[3];
                output.push(result);
                indexSet.add(idx);
            }
        });
    }
}