
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
        getHTML: function(url,json){
            if(json.constructor!=Object) return 'Not an object!<br/>'+url+'<br/>'+json;
            if(this.isA('contact', json)) return this.getContactHTML(url,json);
            return this.getObjectHTML(url,json);
        },
        getAnyHTML: function(a){
            if(a.constructor===String) return this.getStringHTML(a);
            if(a.constructor===Array)  return this.getListHTML(a);
            if(a.constructor===Object) return this.getHTML(a);
            return a!=null? ''+a: '-';
        },
        getObjectHTML: function(url,json){
            var that = this;
            var rows = [];
            $.each(json, function(key,val){
                rows.push('<tr><td>'+key+'</td><td>'+that.getAnyHTML(val)+ '</td></tr>');
            });
            return '<table>\n<tr><td colspan="2"><a class="object" href="'+url+'">view source</a></td></tr>\n'+rows.join('\n')+'\n</table>';
        },
        getListHTML: function(l){
            var that = this;
            var rows = [];
            $.each(l, function(key,val){ rows.push(that.getAnyHTML(val)); });
            if(rows.length >2) return '<div>'+rows.join(',</div>\n<div>')+'</div>\n';
            return rows.join(', ');
        },
        getStringHTML: function(s){
           if(s.startsWith('http://')){
               if(s.endsWith('json')) return '<a href="'+getBaseURL()+s.htmlEscape()+'"> &gt;&gt; </a>';
               return '<a href="'+s.htmlEscape()+'"> &gt;&gt; </a>';
           } else return s.htmlEscape();
        },
        getContactHTML: function(url,json){
           var rows=[];
           rows.push('<div>Contact</div>');
           rows.push('<a class="object" href="'+url+'">view source</a>\n');
           rows.push('<div class="vcard">');
           if(json.fullName !== undefined) rows.push('<h1 class="fn">'+json.fullName+'</h1>');
           if(json.address  !== undefined) rows.push(this.getContactAddressHTML(json.address));
           if(json.phone    !== undefined) rows.push('<p>Tel: <span class="tel">'+this.getListHTML(json.phone.work)+'</span></p>');
           if(json.email    !== undefined) rows.push('<p>Email: <span class="email">'+json.email+'</span></p>');
           if(json.webURL   !== undefined) rows.push('<p>Website: <a class="url" href="'+json.webURL+'">'+json.webURL+'</a></p>');
           rows.push('</div>');
           return rows.join('\n')+'\n';
        },
        getContactAddressHTML: function(address){
           var rows=[];
           rows.push('<div class="adr">');
           if(address.street     !== undefined) rows.push('<p class="street-address">'+this.getListHTML(address.street)+'</p>');
           if(address.locality   !== undefined) rows.push('<p class="locality">'+address.locality+'</p>');
           if(address.region     !== undefined) rows.push('<p class="region">'+address.region+'</p>');
           if(address.postalCode !== undefined) rows.push('<p class="postal-code">'+address.postalCode+'</p>');
           if(address.country    !== undefined) rows.push('<p class="country-name">'+address.country+'</p>');
           rows.push('</div>');
           return rows.join('\n')+'\n';
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
            $('#content').html(json2html.getHTML(url, obj));
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

function getBaseURL(){
    return window.location.protocol + '//' + window.location.host + window.location.pathname + '?o=';
}

// }--------------------------------------------------------{

