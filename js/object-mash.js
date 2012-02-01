
// }-------------- Networking ------------------------------{

function Network() {
    return {
        getJSON: function(url,ok,err){
            $.ajax({
                url: url,
                headers: {},
                dataType: 'json',
                success: ok,
                error: err
            });
        }
    };
};

// }-------------- JSON->HTML ------------------------------{

function JSON2HTML() {
    return {
        getHTML: function(json){
            if(json.constructor!=Object) return "Not an object!";
            if(this.isA("contact", json)) return this.getContactHTML(json);
            return this.getObjectHTML(json);
        },
        getObjectHTML: function(json){
            var self = this;
            var rows = [];
            $.each(json, function(key,val){
                rows.push('<tr><td>'+key+'</td><td>'+self.getAnyHTML(val)+ '</td></tr>');
            });
            return '<table>\n'+rows.join('\n')+'\n</table>';
        },
        getAnyHTML: function(val){
            if(val.constructor===String) return this.getStringHTML(val);
            if(val.constructor===Array)  return this.getListHTML(val);
            if(val.constructor===Object) return this.getHTML(val);
            return val;
        },
        getStringHTML: function(s){
           if(s.startsWith("http://")){
               return '<a href="'+s.htmlEscape()+'">'+s.htmlEscape()+'</a>';
           } else return s.htmlEscape();
        },
        getListHTML: function(l){
            var self = this;
            var rows = [];
            $.each(l, function(key,val){ rows.push(self.getAnyHTML(val)); });
            return rows.join(', ');
        },
        getContactHTML: function(json){
           return "<div>contact</div>"+this.getObjectHTML(json);
        },
        isA: function(type, json){
           if(json.is===type) return true;
           if(json.is !== undefined && json.is.constructor!==Array) return false;
           return (json.is !== undefined && json.is.contains(type));
        }
    };
};

// }-------------- Viewer Application ----------------------{

function ObjectMasher() {

    var network = new Network();
    var json2html = new JSON2HTML();
    var url = null;

    return {

        init: function(){
            url = this.getURLofObject();
            network.getJSON(url, this.objectIn, this.objectFail);
        },
        objectIn: function(obj, s){
            $('#content').html('<div><a href="'+url+'">'+url+'</a></div>'+json2html.getHTML(obj));
        }, 
        objectFail: function(x,s,e){
            $('#content').html('<div><a href="'+url+'">'+url+'</a></div><div>'+s+'</div>');
        },

        // ------------------------------------------------

        getURLofObject: function(){
            var url = getLocationParameter('o');
            if(!url.startsWith('http://')) url = getOrigin()+url;
            if(!url.endsWith('.json'))     url = url+'.json';
            return url;
        }
    };
};

// }-------------- Utilities -------------------------------{

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str){
    return this.slice(0, str.length)==str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function(str){
    return this.slice(-str.length)==str;
  };
}

String.prototype.jsonEscape = function(){
    return this.replace(/\\/g, '\\\\')
               .replace(/"/g, '\\"');
};

String.prototype.htmlEscape = function(){
    return this.replace(/&/g,'&amp;')
               .replace(/</g,'&lt;')
               .replace(/>/g,'&gt;')
               .replace(/"/g,'&quot;');
};

// --------------------

function getLocationParameter(key){
    var match = RegExp('[?&]' + key + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getOrigin(){
    return window.location.protocol + '//' + window.location.host + '/';
}

// }--------------------------------------------------------{

