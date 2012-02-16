
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

    var linkre=/\[([^\[]+?)\]\[([^ ]+?)\]/g;
    var boldre=/!\[(.+?)\]!/g;
    var italre=/\/\[(.+?)\]\//g;
    var prefre=/^\|\[(.+)\]\|$/g;
    var codere=/\|\[(.+?)\]\|/g;

    return {
        getHTML: function(url,json,closed){
            if(!json || json.constructor!==Object) return '<div><div>Not an object!</div><div>'+url+'</div><div>'+json+'</div></div>';
            if(this.isA('contact', json)) return this.getContactHTML(url,json,closed);
            if(this.isA('event',   json)) return this.getEventHTML(url,json,closed);
            if(this.isA('media',   json) && this.isA('list', json)) return this.getMediaListHTML(url,json,closed);
            return this.getObjectHTML(url,json,closed);
        },
        getAnyHTML: function(a){
            if(a.constructor===String) return this.getStringHTML(a);
            if(a.constructor===Array)  return this.getListHTML(a);
            if(a.constructor===Object) return this.getHTML(a["%url"]||a["%more"],a,true);
            return a!=null? ''+a: '-';
        },
        getObjectHTML: function(url,json,closed){
            var that = this;
            var rows = [];
            $.each(json, function(key,val){ rows.push('<tr><td>'+deCamelise(key)+'</td><td>'+that.getAnyHTML(val)+ '</td></tr>'); });
            return this.getObjectHeadHTML(this.getTitle(json),url,false,closed)+
                   '<table class="json"'+(closed? ' style="display: none"':'')+'>\n'+rows.join('\n')+'\n</table>';
        },
        getListHTML: function(l){
            var that = this;
            var rows = [];
            $.each(l, function(key,val){ rows.push(that.getAnyHTML(val)); });
            if(rows.length >5) return '<div class="list"><p class="list">'+rows.join('</p>\n<p class="list">')+'</p></div>\n';
            return rows.join(', ');
        },
        getStringHTML: function(s){
            if(!s) return '';
            if(!s.startethWith('http://')) return this.ONMLString2HTML(s);
            if(s.endethWith('.json')) return '<a href="'+getMashURL()+s.htmlEscape()+'"> [ + ] </a>';
            if(s.endethWith('.png' )) return '<img width="200" src="'+s.htmlEscape()+'" />';
            if(s.endethWith('.gif' )) return '<img width="200" src="'+s.htmlEscape()+'" />';
            if(s.endethWith('.jpg' )) return '<img width="200" src="'+s.htmlEscape()+'" />';
            if(s.endethWith('.jpeg')) return '<img width="200" src="'+s.htmlEscape()+'" />';
            if(s.endethWith('.ico' )) return '<img width="200" src="'+s.htmlEscape()+'" />';
            return '<a href="'+s.htmlEscape()+'"> '+s.htmlEscape()+' </a>';
        },
        // ------------------------------------------------
        getContactHTML: function(url,json,closed){
            var rows=[];
            rows.push(this.getObjectHeadHTML('Contact: '+this.getTitle(json), url, false, closed));
            rows.push('<div class="vcard"'+(closed? ' style="display: none"':'')+' >');
            if(json.fullName     !== undefined) rows.push('<h2 class="fn">'+this.getAnyHTML(json.fullName)+'</h2>');
            if(json.address      !== undefined) rows.push(this.getContactAddressHTML(json.address));
            if(json.phone        !== undefined) rows.push(this.getContactPhoneHTML(json.phone));
            if(json.email        !== undefined) rows.push('<div class="info-item">Email: <span class="email">'+this.getAnyHTML(json.email)+'</span></div>');
            if(json.webURL       !== undefined) rows.push('<div class="info-item">Website: '+this.getAnyHTML(json.webURL)+'</div>');
            if(json.published    !== undefined) rows.push('<div class="info-item">Published: '+this.getAnyHTML(json.published)+'</div>');
            if(json.bio          !== undefined) rows.push('<div class="info-item">Bio: '+this.getAnyHTML(json.bio)+'</div>');
            if(json.photo        !== undefined) rows.push('<div class="photo">'+this.getAnyHTML(json.photo)+'</div>');
            if(json.parents      !== undefined) rows.push(this.getObjectList('Parents', 'parent', json.parents));
            if(json.inspirations !== undefined) rows.push(this.getObjectList('Inspired by', 'inspirations', json.inspirations));
            if(json.following    !== undefined) rows.push(this.getObjectList('Following', 'following', json.following));
            if(json["%more"]     !== undefined) rows.push(this.getObjectList('More', 'more', json["%more"]));
            rows.push('</div>');
            return rows.join('\n')+'\n';
        },
        getContactAddressHTML: function(address){
            var rows=[];
            rows.push('<div class="adr">');
            if(address.street     !== undefined) rows.push('<p class="street-address">'+this.getAnyHTML(address.street)+'</p>');
            if(address.locality   !== undefined) rows.push('<p class="locality">'      +this.getAnyHTML(address.locality)+'</p>');
            if(address.region     !== undefined) rows.push('<p class="region">'        +this.getAnyHTML(address.region)+'</p>');
            if(address.postalCode !== undefined) rows.push('<p class="postal-code">'   +this.getAnyHTML(address.postalCode)+'</p>');
            if(address.country    !== undefined) rows.push('<p class="country-name">'  +this.getAnyHTML(address.country)+'</p>');
            rows.push('</div>');
            return rows.join('\n')+'\n';
        },
        getContactPhoneHTML: function(phone){
            var rows=[];
            if(phone.constructor!==Object) rows.push('<div class="info-item phone">Tel:    <span class="tel">'+this.getAnyHTML(phone)+'</span></div>');
            else{
            if(phone.mobile !== undefined) rows.push('<div class="info-item phone">Mobile: <span class="tel">'+this.getAnyHTML(phone.mobile)+'</span></div>');
            if(phone.home   !== undefined) rows.push('<div class="info-item phone">Home:   <span class="tel">'+this.getAnyHTML(phone.home)+'</span></div>');
            if(phone.work   !== undefined) rows.push('<div class="info-item phone">Work:   <span class="tel">'+this.getAnyHTML(phone.work)+'</span></div>');
            }
            return rows.join('\n')+'\n';
        },
        // ------------------------------------------------
        getEventHTML: function(url,json,closed){
            var rows=[];
            rows.push(this.getObjectHeadHTML('Event: '+this.getTitle(json), url, false, closed));
            rows.push('<div class="vevent"'+(closed? ' style="display: none"':'')+' >');
            if(json.title     !== undefined) rows.push('<h2 class="summary">'+this.getAnyHTML(json.title)+'</h2>');
            if(json.content   !== undefined) rows.push('<p class="description">'+this.getAnyHTML(json.content)+'</p>');
            if(json.start     !== undefined) rows.push('<div class="info-item">From: ' +this.getDateSpan("dtstart", json.start)+'</div>');
            if(json.end       !== undefined) rows.push('<div class="info-item">Until: '+this.getDateSpan("dtend",   json.end)  +'</div>');
            if(json.location  !== undefined) rows.push(this.getEventLocationHTML(json.location));
            if(json.attendees !== undefined) rows.push(this.getObjectList('Attendees:', 'attendee', json.attendees));
            if(json["%more"]  !== undefined) rows.push(this.getObjectList('More', 'more', json["%more"]));
            rows.push('</div>');
            return rows.join('\n')+'\n';
        },
        getEventLocationHTML: function(locurl){
            var rows=[];
            rows.push('<h3>Location:</h3>');
            rows.push('<div class="location">');
            rows.push(this.getObjectHeadHTML('Contact Loading..', locurl, true));
            rows.push('</div>');
            return rows.join('\n')+'\n';
        },
        // ------------------------------------------------
        getMediaListHTML: function(url,json,closed){
            var list = json.list;
            if(!list) return "";
            if(list.constructor===String) list = [ list ];
            if(list.constructor!==Array) return this.getAnyHTML(list);
            var rows=[];
            rows.push('<div class="media-list">');
            var that = this;
            $.each(list, function(key,item){ rows.push(that.getMediaHTML(item)); });
            rows.push('</div>');
            return rows.join('\n')+'\n';
        },
        getMediaHTML: function(json){
            return ' <div class="media">\n'+
                   '  <img class="media-img" src="'+json.url+'" />\n'+
                   '  <div class="media-text"><p>\n'+json.text+'</p>\n</div>\n'+
                   ' </div>\n';
        },
        // ------------------------------------------------
        ONMLString2HTML: function(text){
            if(!text) return '';
            text=text.replace(/&#39;/g,'\'');
            text=text.replace(/&quot;/g,'"');
            text=text.htmlEscape();
            text=text.replace(linkre, '<a href="$2">$1</a>');
            text=text.replace(boldre, '<b>$1</b>');
            text=text.replace(italre, '<i>$1</i>');
            if(text.startethWith('|[') && text.endethWith(']|')){
                 text='<pre>'+text.substring(2, text.length-2)+'</pre>';
            }
            text=text.replace(codere, '<code>$1</code>');
            return text;
        },
        // ---------------------------------------------------
        getObjectList: function(header,itemclass,list){
            var rows=[];
            rows.push('<h3>'+header+'</h3>');
            rows.push('<ul>');
            var that = this;
            if(list.constructor===String) list = [ list ];
            if(list.constructor!==Array) return this.getAnyHTML(list);
            $.each(list, function(key,item){
                rows.push('<li class="'+itemclass+'">');
                if(that.isObjectURL(item)) rows.push(that.getObjectHeadHTML('Loading..', item, true));
                else                       rows.push(that.getAnyHTML(item));
                rows.push('</li>');
            });
            rows.push('</ul>');
            return rows.join('\n')+'\n';
        },
        getTitle: function(json){
            if(!json) return "";
            if(json.fullName !== undefined) return this.getAnyHTML(json.fullName);
            if(json.title    !== undefined) return this.getAnyHTML(json.title);
            return "";
        },
        getDateSpan: function(clss, date){
            return '<span class="'+clss+'" title="'+makeISODate(date)+'">'+makeNiceDate(date)+'</span>';
        },
        getObjectHeadHTML: function(title, url, place, closed){
            return '<div class="object-head'+(closed? '':' open')+'">'+'<span class="object-title">'+title+'&nbsp;</span>'+
                                                    this.getStringHTML(url)+
                                                  ' <a href="#" class="open-close">+/-</a>'+
                                             (url?' <a href="'+url+'" class="object'+(place? '-place': '')+'">{..}</a>':'')+
                   '</div>';
        },
        isA: function(type, json){
            if(!json.is) return false;
            if(json.is.constructor===String && json.is == type) return true;
            if(json.is.constructor!==Array) return false;
            return $.inArray(type, json.is) >= 0;
        },
        isObjectURL: function(s){
            if(s.constructor!==String) return false;
            if(!s.startethWith("http:")) return false;
            if(!s.endethWith(".json")) return false;
            return true;
        }
    };
};

// }-------------- Viewer Application ----------------------{

function ObjectMasher() {

    var network = new Network();
    var json2html = new JSON2HTML();
    var url = null;

    var me = {

        init: function(){
            url = this.getURLofObject();
            network.getJSON(url, this.topObjectIn, this.topObjectFail);
        },
        topObjectIn: function(obj, s){
            document.title = json2html.getTitle(obj);
            $('#content').html(json2html.getHTML(url, obj));
            me.setUpHTMLEvents();
            fetch = {};
            $('a.object-place').each(function(n,a){ fetch[a.getAttribute('href')]=this; } );
            $.each(fetch, function(url,a){
                network.getJSON(url, function(obj,s){ me.objectIn(url,obj,s); }, function(x,s,e){ me.objectFail(url,x,s,e);});
                $(a).next().html('Loading..');
            });
        },
        topObjectFail: function(x,s,e){
            $('#content').html('<div><a href="'+url+'">'+url+'</a></div><div>'+s+'</div>');
        },
        objectIn: function(url,obj,s){
            if(!obj){ this.objectFail(url,null,"object empty; status="+s,null); return; }
            var html = json2html.getHTML(url, obj, true);
            $('a.object-place').each(function(n,ae){ var a=$(ae);
                if(a.attr('href')!=url) return;
                a.parent().replaceWith(html);
            });
            me.setUpHTMLEvents();
        },
        objectFail: function(url,x,s,e){
            console.log(s+" "+url);
        },
        setUpHTMLEvents: function(){
            $('.open-close').unbind().click(function(e){
                var objhead = $(this).parent();
                var panel=objhead.next();
                if(panel.css('display')=='none'){ panel.show("fast"); objhead.addClass('open'); }
                else                            { panel.hide("fast"); objhead.removeClass('open'); }
                e.preventDefault();
            });
            $('.media-img').unbind().click(function(e){
                var mediaList = $(this).parent().parent();
                var numSlides = mediaList.children().length;
                if(typeof mediaIndex==='undefined') mediaIndex=1;
                mediaList.find(':nth-child('+mediaIndex+')').hide();
                if(e.clientX-this.offsetLeft<this.width/2) mediaIndex--;
                else mediaIndex++;
                if(mediaIndex==0) mediaIndex=1;
                if(mediaIndex==numSlides+1) mediaIndex=numSlides;
                mediaList.find(':nth-child('+mediaIndex+')').show();
                mediaList.find(':nth-child('+mediaIndex+')').children().show();
                mediaList.find(':nth-child('+mediaIndex+')').children().children().show();
            });
        },
        // ------------------------------------------------
        getURLofObject: function(){
            var url = getLocationParameter('o');
            if(!url.startethWith('http://')) url = getRootURL()+url;
            if(!url.endethWith('.json'))     url = url+'.json';
            return url;
        }
    };
    return me;
};

// }-------------- Utilities -------------------------------{

String.prototype.startethWith = function(str){ return this.slice(0, str.length)==str; };
String.prototype.endethWith   = function(str){ return this.slice(  -str.length)==str; };
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
    var match = RegExp('[?&]'+key+'=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getRootURL(){
    return window.location.protocol + '//' + window.location.host + '/';
}

function getDirURL(){
    return window.location.protocol + '//' + window.location.host + window.location.pathname;
}

function getMashURL(){
    return window.location.protocol + '//' + window.location.host + window.location.pathname + '?o=';
}

var daysLookupTable   = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];
var monthsLookupTable = [ 'January','February','March','April','May', 'June','July','August','September','October','November','December'];

function makeISODate(date){
    var d = new Date(date);
    if(d.toString()=='Invalid Date') return '[not a valid date]';
    return d.toISOString();
}

function makeNiceDate(date){
    var d = new Date(date)
    if(d.toString()=='Invalid Date') return '[not a valid date]';
    var day = daysLookupTable[d.getDay()];
    var mon = monthsLookupTable[d.getMonth()];
    return day + ', ' + d.getDate() + ' ' + mon + ' ' + d.getFullYear() + ' at '+d.toLocaleTimeString();
}

function deCamelise(s){
    return s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3').replace(/^./, function(str){ return str.toUpperCase(); });
}

// }--------------------------------------------------------{

