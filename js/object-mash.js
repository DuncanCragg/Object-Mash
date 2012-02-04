
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
            if(!json || json.constructor!==Object) return 'Not an object!<br/>'+url+'<br/>'+json;
            if(this.isA('contact', json)) return this.getContactHTML(url,json);
            if(this.isA('event',   json)) return this.getEventHTML(url,json);
            return this.getObjectHTML(url,json);
        },
        getAnyHTML: function(a){
            if(a.constructor===String) return this.getStringHTML(a);
            if(a.constructor===Array)  return this.getListHTML(a);
            if(a.constructor===Object) return this.getHTML("//",a);
            return a!=null? ''+a: '-';
        },
        getObjectHTML: function(url,json){
            var that = this;
            var rows = [];
            $.each(json, function(key,val){ rows.push('<tr><td>'+deCamelise(key)+'</td><td>'+that.getAnyHTML(val)+ '</td></tr>'); });
            return '<table>\n<tr><td colspan="2"><a class="object" href="'+url+'">{..}</a></td></tr>\n'+rows.join('\n')+'\n</table>';
        },
        getListHTML: function(l){
            var that = this;
            var rows = [];
            $.each(l, function(key,val){ rows.push(that.getAnyHTML(val)); });
            if(rows.length >5) return '<p>'+rows.join(',</p>\n<p>')+'</p>\n';
            return rows.join(', ');
        },
        getStringHTML: function(s){
            if(s.startethWith('http://')){
                if(s.endethWith('json')) return '<a href="'+getMashURL()+s.htmlEscape()+'"> [ + ] </a>';
                return '<a href="'+s.htmlEscape()+'"> '+s.htmlEscape()+' </a>';
            } else return s.htmlEscape();
        },
        // ------------------------------------------------
        getContactHTML: function(url,json){
            var rows=[];
            rows.push(this.getObjectHeadHTML('Contact', url, false));
            rows.push('<div class="vcard">');
            if(json.fullName !== undefined) rows.push('<h2 class="fn">'+this.getAnyHTML(json.fullName)+'</h2>');
            if(json.address  !== undefined) rows.push(this.getContactAddressHTML(json.address));
            if(json.phone    !== undefined) rows.push(this.getContactPhoneHTML(json.phone));
            if(json.email    !== undefined) rows.push('<div class="info-item">Email: <span class="email">'+this.getAnyHTML(json.email)+'</span></div>');
            if(json.webURL   !== undefined) rows.push('<div class="info-item">Website: '+this.getAnyHTML(json.webURL)+'</div>');
            if(json.published!== undefined) rows.push('<div class="info-item">Published: '+this.getAnyHTML(json.published)+'</div>');
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
        getEventHTML: function(url,json){
            var rows=[];
            rows.push(this.getObjectHeadHTML('Event', url, false));
            rows.push('<div class="vevent">');
            if(json.title    !== undefined) rows.push('<h2 class="summary">'+this.getAnyHTML(json.title)+'</h2>');
            if(json.content  !== undefined) rows.push('<p class="description">'+this.getAnyHTML(json.content)+'</p>');
            if(json.start    !== undefined) rows.push('<div class="info-item">From: ' +this.getDateSpan("dtstart", json.start)+'</div>');
            if(json.end      !== undefined) rows.push('<div class="info-item">Until: '+this.getDateSpan("dtend",   json.end)  +'</div>');
            if(json.location !== undefined) rows.push(this.getEventLocationHTML(json.location));
            if(json.attendees!== undefined) rows.push(this.getEventAttendeesHTML(json.attendees));
            rows.push('</div>');
            return rows.join('\n')+'\n';
        },
        getEventLocationHTML: function(locurl){
            var rows=[];
            rows.push('<h3>Location:</h3>');
            rows.push('<div class="location">');
            rows.push(this.getObjectHeadHTML('Contact', locurl, true));
            rows.push('</div>');
            return rows.join('\n')+'\n';
        },
        getEventAttendeesHTML: function(attendees){
            var rows=[];
            rows.push('<h3>Attendees:</h3>');
            rows.push('<ul>');
            var that = this;
            $.each(attendees, function(key,atturl){
            rows.push('<li class="attendee">');
            rows.push(that.getObjectHeadHTML('Contact', atturl, true));
            rows.push('</li>');
            });
            rows.push('</ul>');
            return rows.join('\n')+'\n';
        },
        // ------------------------------------------------
        getDateSpan: function(clss, date){
            return '<span class="'+clss+'" title="'+makeISODate(date)+'">'+makeNiceDate(date)+'</span>';
        },
        getObjectHeadHTML: function(title, url, place){
            return '<div class="object-head open">'+title+
                                                    this.getStringHTML(url)+
                                                  ' <a href="#" class="open-close">^</a>'+
                                                  ' <a href="'+url+'" class="object'+(place? '-place': '')+'">{..}</a>'+
                   '</div>';
        },
        isA: function(type, json){
            if(!json.is) return false;
            if(json.is.constructor===String && json.is == type) return true;
            if(json.is.constructor!==Array) return false;
            return type in json.is;
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
            $('a.object-place').each(function(n,ae){ var a=$(ae)
                if(a.attr('href')!=url) return;
                a.parent().replaceWith(json2html.getHTML(url, obj));
                me.setUpHTMLEvents();
            });
        },
        objectFail: function(url,x,s,e){
            console.log(url+" "+s);
        },
        setUpHTMLEvents: function(){
            $('.open-close').unbind().click(function(e){
                var objhead = $(this).parent();
                var panel=objhead.next();
                if(panel.css('display')=='none'){ panel.show(); objhead.addClass('open'); }
                else                            { panel.hide(); objhead.removeClass('open'); }
                e.preventDefault();
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

