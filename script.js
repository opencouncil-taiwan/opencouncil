{
    sample: function() {
      return {
        value: [{name: "Value", data: [1,2,3,4,5]}]
      };
    },
    dimension: {
    },
    config: {
      stepShow: {name: "Step by Step", type: [plotdb.Boolean], default: false, rebindOnChange: true}
    },
    init: function() {
      var that = this,ol,uls,i,j,resultNode,node;
      this.id = "id" + Math.round(Math.random() * 10000000);
      this.m2h = new showdown.Converter();
      var result = this.m2h.makeHtml(this.root.innerHTML);
      this.root.innerHTML = result;
      this.scores = d3.select(this.root).selectAll("strong").filter(function() {
        return (this.innerText == "?");
      });
      var updateScore = function() {
        var score = 0;
        d3.select(that.root).selectAll("ul li.active").each(function(d,i) {
          score += this.score;
        });
        that.scores.each(function() {
          this.innerText = score;
        });
        console.log(that.results);
        that.results.forEach(function(node) {
          var dir,active = false,v1,v2,ret = /(\d+)~(\d+)/.exec(node.pattern);
          if(ret) {
            v1 = +ret[1];
            v2 = +ret[2];
            if(score >= v1 && score < v2) active = true;
          } else {
            ret = /([><])(\d+)/.exec(node.pattern);
            if(ret) {
              dir = ret[1];
              v1 = +ret[2];
              if((dir==">" && score >= v1) || (dir=="<" && score < v1)) active = true;
            }
          }
          if(active) node.className = "result active"; else node.className = "result";
        });
      };
      d3.select(this.root).selectAll("img").each(function(d,i) {
        var node = d3.select(this);
        var src = node.attr("src");
        var des = that.assets[src];
        if(des) node.attr("src",des.url);
      });
      d3.select(this.root).selectAll("ul").attr({
        class: "choices"
      });
      d3.select(this.root).selectAll("ul li").each(function(d,i) {
        var id = /\((-?\d+)\)\s*$/.exec(this.innerText);
        if(!id) id = 0;
        else id = id[1];
        this.score = parseInt(id);
        this.innerHTML = this.innerHTML.replace(/\(-?\d+\)/,"");
        (function(node,id) {
          node.addEventListener("click", function() {
            var p = node.parentNode;
            var pp = p.parentNode;
            for(var i=0;i<pp.childNodes.length;i++) {
              if(pp.childNodes[i].style) pp.childNodes[i].style.display = "flex";
            }
            if(p.parentNode.idx < uls.length - 1) {
              uls[p.parentNode.idx + 1].style.display = "list-item";
            } else resultNode.style.display = "block";
            if(/active/.exec(node.className)) {
              node.className = "";
              return;
            }
            for(var i=0;i<p.childNodes.length;i++) {
              p.childNodes[i].className = (p.childNodes[i].className || "").replace("active","");
            }
            node.className = "active";
            updateScore();
            console.log('#' + that.id + '-' + (p.parentNode.idx + 1) + "-anchor");
            smoothScroll.animateScroll(document.querySelector('#' + that.id + '-' + (p.parentNode.idx) + "-anchor"));
          });
        })(this, id);
      });
      this.results = [];
      d3.select(this.root).selectAll("h3").each(function() {
        var node = null;
        for(var i=0;i<this.childNodes.length;i++) {
          if(this.childNodes[i].nodeType==3) {
            node = this.childNodes[i];
          }  
        }
        if(!node) { node = this; }
        var ret = /\(([0-9><~]+)\)\s*$/.exec(node.textContent);
        if(!ret) return;
        pat = ret[1];
        this.pattern = pat;
        node.textContent = node.textContent.replace(/\(([0-9><~])+\)\s*$/, "");
        this.className = "result"
        that.results.push(this);
      });
      ol = this.root.querySelector("div > ol");
      uls = this.uls = ol.querySelectorAll("ol > li");
      for(i=0;i<uls.length;i++) {
        uls[i].idx = i;
        uls[i].setAttribute("id", this.id + "-" + i);
        if(this.config.stepShow && i) uls[i].style.display = "none";
        anchorNode = document.createElement("a");
        anchorNode.setAttribute("id", this.id + "-" + i + "-anchor"); 
        uls[i].insertBefore(anchorNode, uls[i].querySelector("ul").nextSibling);
      }
      for(i=this.root.childNodes.length - 1;i>=0;i--) {
        if(this.root.childNodes[i].nodeName.toLowerCase() == "hr") {
          resultNode = this.resultNode = document.createElement("div");
          for(j=i;j<this.root.childNodes.length;j++)  {
            node = this.root.childNodes[j];
            this.root.removeChild(node);
            resultNode.appendChild(node);
          }
          this.root.appendChild(resultNode);
          if(this.config.stepShow) resultNode.style.display = "none";
          resultNode.setAttribute("id", this.id + "-" + uls.length);
          resultNode.setAttribute("class", "anchor");
          break;
        }
      }