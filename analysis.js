var detective = require('detective');
var fs = require('fs');

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

var ReferNode = function(nodeName){
	this.nodeName = nodeName;
	this.requires = new Array();
}

var nodes=[];

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

function getNode(nodeName){
	for (var index = 0; index < onodes.length; index++) {
		var element = onodes[index];
		if(element.name==nodeName) return element;
	}
	return null;
}

getRequires('\\server.js',"--");

function getRequires(filename,prev){
	var node=new ReferNode(filename);
	var src = fs.readFileSync(__dirname+"\\" + filename);
	var requires = detective(src);
	for(var i=0;i<requires.length;i++){
		var fn=requires[i];
		if(!fn.endsWith(".json")){
			if(fn.startsWith(".")){
				if(!fn.endsWith(".js")) fn+=".js";
			}
			node.requires.push(fn);
		}
		if(fn.startsWith(".") && !fn.endsWith(".json")){
			getRequires(fn, prev+prev);
		}
	}
	nodes.push(node);
}

var onodes=[];
var links=[];

function pushNode(name){
	var node=getNode(name);
	if(!node){
		onodes.push({name:name,category:name.startsWith(".")?0:1,value:3});
	}
	else{
		node.value++;
	}
}
nodes.forEach(function(ele) {
	pushNode(ele.nodeName);
	ele.requires.forEach(function(req){
		pushNode(req);
		links.push({source:ele.nodeName,target:req})
	});
});

console.log(onodes);
console.log(links);

