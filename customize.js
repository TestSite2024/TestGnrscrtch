/**
 * This file controls the page logic
 *
 * depends on jQuery>=1.7
 */
/*import {startParticles, stopParticles, startConfetti, stopConfetti} from './particles.js';*/
/*import {confetti} from 'https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.0.3/umd/confetti.js';*/
import {Pane} from './tweakpane-4.0.5.min.js';
import * as TextareaPlugin from './tweakpane-textarea-plugin.min.js';
var wholelink='';
var params;
var checkinprogress=false;
var mtfs=0;
var canvas;
var scratchers = [];
var foregrnd;
var iwidth,iheight;
let isFirstLoad=true;

(function() {
    /**
     * Returns true if this browser supports canvas
     *
     * From http://diveintohtml5.info/
     */
   
    var soundHandle = new Audio();
    var triggered=false;
    var soundeffect, confettieffect, tabel, ctitle, ctext, cmes;
    var pct1=0;
    var currenttab=1;
    var initialFontSize;
    var scratchLimit=30;

    function supportsCanvas() {
        return !!document.createElement('canvas').getContext;
    };
    
    
    /**
     * Handle scratch event on a scratcher
     */
    function checkpct() {
            if (pct1 > 20 && pct1 < scratchLimit) {
                if (CrispyToast.toasts.length===0) {
                    CrispyToast.success('Scratch MORE!', { position: 'top-center', timeout: 2000});
                }
            }
            if (pct1 > scratchLimit) {
                if(CrispyToast.toasts.length!=0){
                    CrispyToast.clearall();
                }
                scratchers[0].clear();
                var duration = 5 * 1000;
                if (confettieffect.element.querySelector('input').checked) {
                    confetti_effect(duration);
                }
                if (soundeffect.element.querySelector('input').checked) {
                    soundHandle.volume=0.5;
                    soundHandle.play();
                }
                triggered=true;
                setTimeout(function(){
                    $("#resetbutton").show();
                }, duration);
            }
    };
    function scratcher1Changed(ev) {
        if (!triggered){
            pct1 = (this.fullAmount(40) * 100)|0;
            checkpct();
        }
    };
   
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    };
    function randomInRangeint(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };
    function confetti_effect(duration) {
        
        
        if(triggered==true) {
            return;
        }
        
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 10, spread: 360, ticks: 70, zIndex: 0 };
        
        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();
          
            if (timeLeft <= 0) {
              return clearInterval(interval);
            }
          
            var particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }});
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
          }, 250);
              
     };
    
    /**
     * Reset all scratchers
     */
    function onResetClicked() {
        var i;
        pct1 = 0;
        CrispyToast.toasts=[];
        $("#resetbutton").hide();
        scratchers[0].setImages('images/empty.jpg','images/fore/' + foregrnd.value +'.jpg');
        scratchers[0].reset();
       
        triggered = false;
        soundHandle.pause();
        soundHandle.currentTime = 0;    
        return false;
    };
   
    function fitCanvastoDiv() {
        var ttd = $(canvas).parent();
        // var ttd = document.getElementById('scratcher-box');
        canvas.width = ttd.width();
        canvas.height = canvas.width;
        if(scratchers[0]){
            if (triggered) {
                scratchers[0].resetnoclear(true);
            } else {
                scratchers[0].resetnoclear(false);
            }
        }
    }
    
    jQuery.expr.filters.offscreen = function(el) {
        var rect = el.getBoundingClientRect();
        var overlapwithscratcher=false;
        if (window.matchMedia('(orientation:portrait)').matches) {
            var rect2 =document.getElementById('scratcher-box').getBoundingClientRect();     
            if (rect.bottom >rect2.top ||rect.bottom >rect2.bottom ) {
                overlapwithscratcher = true;
            }
        }
        if (el.id == "surprise" && el.scrollWidth + rect.x >iwidth-2) {
            overlapwithscratcher = true;
        }               
        var a = (rect.x > iwidth || rect.y > iheight-10
         || rect.bottom > iheight -10|| rect.top > iheight-10 || overlapwithscratcher )
        
         return a;
      };

    
      function resizePanel() {
        const root = document.documentElement;
        var iw = Math.min(iwidth,screen.availWidth)/2;
            if (iw<300) {
                iw=300;
            }
        root.style.setProperty('--pane-width',iw.toString() + "px" );
        iw = 2*(iw/3);
            if (iw<200) {
                iw=200;
            }
        root.style.setProperty('--tp-blade-value-width',iw.toString() + "px" );
        iw = Math.min(iheight,screen.availHeight)/30;
        if (iw<20) {
            iw=20;
        }
        root.style.setProperty('--tp-container-unit-size',iw.toString() + "px" );
        iw=iw/5;
        root.style.setProperty('--tp-container-unit-spacing',iw.toString() + "px" );
        iw = Math.min(iheight,screen.availHeight)/50;
        if (iw<16) {
            iw=16;
        }
        root.style.setProperty('--f-size',iw.toString() + "px" );
        iw=iw-3;
        root.style.setProperty('--fl-size',iw.toString() + "px" );
  }

    function manageResizeOrientation(etype) {
        if (checkinprogress) {
            return;
        }
        checkinprogress=true;
       
        setTimeout(function () {
            if (!isFirstLoad && iwidth==window.innerWidth && window.innerHeight<=iheight){
                scratchers[0].setResized();
                checkinprogress=false;
                return;
            }
            isFirstLoad=false;
            //console.log(iheight + " "+beforeheight);
            iwidth = window.innerWidth;
            iheight = window.innerHeight;
            fitCanvastoDiv();
            modifyFontSize();
            resizePanel();
            checkinprogress=false;

        },1000);
    }

    function modifyFontSize() {
        var fontSize=$('#surprise').css('font-size').toUpperCase().split("PX");
        var v = parseFloat(fontSize[0]);
        //alert(iheight+" during" + window.innerHeight + " " + iwidth);
        //$('#surprise').css('line-height',(v +"PX")); 
        var big = false;
        if ($('#surprise').is(':offscreen')) {
            big = true;
        }
        if ($('#H3').is(':offscreen')) {
            
            var counter =0;
            while ($('#H3').is(':offscreen')) {
                v = v-1;
                if (v<50) {
                    v=50;
                }
                $('#surprise').css('font-size',(v+"PX")); 
                counter++;
                if (counter >50) {
                    big = true;
                };
            }
            if (counter>0 && counter<=50)
                {
                    display_dialog("The font size has been reduced automatically because the text boxes were going out of the screen or overlapping");
                }           
        }
        if (big) {
            display_dialog("The text for the 'title' is too big to fit to the screen. So please either choose different font or smaller font size. Make sure you pick words shorter than 17 characters.");
            preventprogress();
            return;
        }
    }

    function checkforEmptytext() {
        var a = ctitle.element.querySelector('textarea').value;
        var b = ctext.element.querySelector('textarea').value;
        var c = cmes.element.querySelector('textarea').value;
        if (a=="" || b=="" || c=="") {
            display_dialog("You have to enter all the text before you can continue.");
            preventprogress();
        }
    }

    function preventprogress(){
        $(tabel[0]).focus();
        currenttab=1;
        $(tabel[0]).click();
    }

    function initPage() {
        var i, i1;    
        var scratcherLoadedCount = 0;          
        //$( "#dialog-message" ).hide();
        document.getElementsByTagName("body")[0].style.backgroundImage = 'url(images/back/Blue-Floral.jpg)';
        canvas = document.getElementById("scratcher1");
        initialFontSize = $('#surprise').css('font-size').toUpperCase().split("PX");
        //tlh = $('#surprise').css('line-height');
        iwidth = window.innerWidth;
        iheight = window.innerHeight;
        
        /* if (window.innerHeight>300 && window.innerWidth<703) {
            alert("yes");
        } */
       /*  window.addEventListener('resize', function () {
            manageResizeOrientation('resize');
        }); */
        soundHandle = document.getElementById('soundHandle');  
        soundHandle.autoplay = true;
        soundHandle.muted=false;
        soundHandle.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        soundHandle.src = 'audio/celebrate.mp3';
        soundHandle.play();
        soundHandle.pause();

        localStorage.clear()
        
        // Save form data before the tab is discarded
        window.addEventListener("beforeunload", () => {
            document.querySelectorAll("input, textarea, select").forEach(input => {
            localStorage.setItem(input.id, input.value);
            });
        });
        
        // Restore data when the page loads
        window.addEventListener("load", () => {
            document.querySelectorAll("input, textarea, select").forEach(input => {
            if (localStorage.getItem(input.id)) {
                input.value = localStorage.getItem(input.id);
            }
            });
        });
        $( window ).on({
            orientationchange: function(e) {
                manageResizeOrientation('orientation');
            },resize: function(e) {
                manageResizeOrientation('resize');
            }
        });
        
        resizePanel();
        $('.nosoundbtn').on("click", function (e) {
            //wholelink='./index.html' + "?" + params.toString(); // Test page

            window.open(
                wholelink,'_blank' 
              );             
        });
        $('.withsoundbtn').on("click", function (e) {
            var s = stext.element.querySelector('textarea').value;
            if (navigator.share) {
                navigator.share({
                  title: 'Something Special',
                  text : s + "-This is a DEMO version- ",
                  url: wholelink
                }).then(() => {

                })
                .catch(console.error);
              } else {
                display_dialog("Unfortunately sharing is not supported by your browser/platform. Please go to the link and use your browser's address bar to copy the link instead");
            }
        });
        document.addEventListener(
            "visibilitychange",
             function(evt) {
              if (document.visibilityState != "visible") {
                soundHandle.pause();
                soundHandle.currentTime=0;              }
            },
            false,
          );
   
  // called each time a scratcher loads
  function onScratcherLoaded(ev) {

    scratcherLoadedCount++;
    if (scratcherLoadedCount == scratchers.length) {
        // all scratchers loaded!

        // bind the reset button to reset all scratchers
        $('#resetbutton').on('click', function () {
            onResetClicked();
        });
        manageResizeOrientation();
        // hide loading text, show instructions text
        //$('#loading-text').hide();
        //$('#inst-text').show();
    }
};       
        scratchers = new Array(1);

        const cmessage = {
            message: ''
          };
        const title = {
            prop: ''
        };
        const text = {
            prop: ''
        };
        for (i = 0; i < scratchers.length; i++) {
            i1 = i + 1;
            scratchers[i] = new Scratcher('scratcher' + i1);
    
            // set up this listener before calling setImages():
            scratchers[i].addEventListener('imagesloaded', onScratcherLoaded);
    
            scratchers[i].setImages('images/empty.jpg','images/fore/Goldeng.jpg');
            scratchers[i].setText(cmessage.message);
            scratchers[i].setShape('heart');

        }
       
        // get notifications of this scratcher changing
        // (These aren't "real" event listeners; they're implemented on top
        // of Scratcher.)
        //scratchers[3].addEventListener('reset', scratchersChanged);
        scratchers[0].addEventListener('scratchesended', scratcher1Changed);
        scratchers[0].addEventListener('resized', fitCanvastoDiv);
        
         $(function() {
            $('body').add('#scracther1').on('click touchend', function(e) {
                if (!(e.target.id == "panel" || $(e.target).parents("#panel").length) && !(e.target.id == "dialog-message"|| $(e.target).parents(".ui-dialog").length || $(e.target).hasClass('ui-widget-overlay')||$(e.target).hasClass('ui-dialog')) ) {
                    if(pane.expanded){
                        pane.expanded=false;
                        //modifyFontSize();   
                    }
                }
            });
          })

        const pane = new Pane({
            title: 'Customization Parameters',
            expanded: true,
        });
        pane.element.setAttribute("id", "panel");
        const btn2 = pane.addButton({
            title: 'Help',
            disabled: true,
        });
        
        const btn1 = pane.addButton({
            title: 'Hide the Panel',
        });
                   
        btn1.on('click', () => {
            pane.expanded= false;
            //modifyFontSize();
        });
        pane.registerPlugin(TextareaPlugin);
        var tab = pane.addTab({
            pages: [
              {title: 'Step 1'},
              {title: 'Step 2'},
              {title: 'Finish'},
            ],
          });
          tabel = tab.element.querySelectorAll('button');
          $(tabel[0]).focus();
         
          tabel[1].addEventListener("click", function() {
            modifyFontSize();
            checkforEmptytext();
          });
          tabel[2].addEventListener("click", function() {
             modifyFontSize();
             checkforEmptytext();
          });
        const backgrnd = tab.pages[0].addBlade({
            view: 'list',
            label: 'Background',
            options: [
              {text: 'Blue-Floral', value: 'Blue-Floral'},
              {text: 'Christmas1', value: 'Christmas1'},
              {text: 'Cream_waves', value: 'Cream_waves'},
              {text: 'Green1', value: 'Green1'},
              {text: 'Halloween1', value: 'Halloween1'},
              {text: 'Halloween2', value: 'Halloween2'},
              {text: 'Halloween3', value: 'Halloween3'},
              {text: 'Pink1', value: 'Pink1'},
              {text: 'Pink-Blue1', value: 'Pink-Blue1'},
              {text: 'Pink-Blue2', value: 'Pink-Blue2'},
              {text: 'Pink-Blue3', value: 'Pink-Blue3'},
              {text: 'Pink-Floral', value: 'Pink-Floral'},
              {text: 'StPatricks1', value: 'StPatricks1'},
              {text: 'StPatricks2', value: 'StPatricks2'},
              {text: 'Turquoise1', value: 'Turquoise1'},
              {text: 'Valentines1', value: 'Valentines1'},
            ],
            value: 'Blue-Floral',
            }).on('change', (ev) => {
                document.getElementsByTagName("body")[0].style.backgroundImage = 'url(images/back/' + ev.value + '.jpg)';
          });

        ctitle= tab.pages[0].addBinding(title, 'prop', {
            view: 'textarea',
            label: 'Title',
            rows:2,
            limit:25,
            placeholder: 'Enter your title here'
            }).on('change', (ev) => {
                var st = ctitle.element.querySelector('textarea').value;
                var char = 25 - st.length;
                tlimit.value=char + " characters left";
                $('#surprise').text(ev.value);
                
         });
            
        const tlimit = tab.pages[0].addBlade({
            view: 'text',
            label: '',
            parse: (v) => String(v),
            value: '25 characters left',
            disabled: true
        });
        
        var st = ctitle.element.querySelector('textarea').value;
        tlimit.value=25-st.length + " characters left";

        const tfont = tab.pages[0].addBlade({
            view: 'list',
            label: 'Title Font',
            options: [
              {text: 'Standard Font1', value: 'Instrument Serif'},
              {text: 'Fancy Font1', value: 'Fleur De Leah'},
              {text: 'Calligraphy Font1', value: 'Birthstone'},
              {text: 'Calligraphy Font2', value: 'Engagement'},
              {text: 'Handwriting Font1', value: 'Tangerine'},
              {text: 'Handwriting Font2', value: 'Corinthia'},
              {text: 'Handwriting Font3', value: 'Lovers Quarrel'},
              {text: 'Bold Font1', value: 'Teko'},
              {text: 'Bold Font2', value: 'League Gothic'},
              {text: 'Bold Font3', value: 'Mouse Memoirs'},
              {text: 'Christmas Font1', value: 'Princess Sofia'},
              {text: 'Christmas Font2', value: 'Ruge Boogie'},
              {text: 'Halloween Font', value: 'Creepster'},

            ],
            value: 'Birthstone',initialFontSize
            }).on('change', (ev) => {
                $('#surprise').css('font-family',ev.value);
          });

          const tfontsize = tab.pages[0].addBlade({
            view: 'list',
            label: 'Title Font Size',
            options: [
              {text: 'Smaller', value: '-15'},
              {text: 'Normal', value: '0'},
              {text: 'Bigger', value: '10'},
            ],
            value: '0',
            }).on('change', (ev) => {
                mtfs=ev.value;
                $('#surprise').css('font-size',((parseFloat(initialFontSize[0])+parseInt(ev.value)+"PX")));                 
          });
          ctext= tab.pages[0].addBinding(text, 'prop', {
            view: 'textarea',
            label: 'Text under Title',
            rows:3,
            limit:50,
            placeholder: 'Enter your text here'
            }).on('change', (ev) => {
                var st = ctext.element.querySelector('textarea').value;
                var char = 50 - st.length;
                ttext.value=char + " characters left";
                $('#H3').text(ev.value);
            });

        const ttext = tab.pages[0].addBlade({
            view: 'text',
            label: '',
            parse: (v) => String(v),
            value: '50 characters left',
            disabled: true
        });
        
        var st = ctext.element.querySelector('textarea').value;
        ttext.value=50-st.length + " characters left";

        cmes= tab.pages[0].addBinding(cmessage, 'message', {
            view: 'textarea',
            label: 'Message Under Scratch Area',
            rows:6,
            limit:110,
            placeholder: 'Enter your message here'
            }).on('change', (ev) => {
                scratchers[0].setText(ev.value);
                var st = cmes.element.querySelector('textarea').value;
                var char = 110 - st.length;
                climit.value=char + " characters left";
                if (!triggered) {
                    scratchers[0].reset();
                } else {
                    scratchers[0].clear();

                }
            });
        
          
        const climit = tab.pages[0].addBlade({
            view: 'text',
            label: '',
            parse: (v) => String(v),
            value: '110 Characters remaining',
            disabled: true
        });
        var st = cmes.element.querySelector('textarea').value;
        climit.value=110-st.length + " characters left";
        
        const inputs = document.querySelectorAll('textarea');
        inputs.forEach(input => {
        input.setAttribute('autocomplete', 'off')
	    input.setAttribute('autocorrect', 'off')
	    input.setAttribute('spellcheck', false)
        }); 

        cmes.element.querySelector('textarea').setAttribute('maxlength', 110)
        ctitle.element.querySelector('textarea').setAttribute('maxlength', 25)
        ctext.element.querySelector('textarea').setAttribute('maxlength', 50)

        tab.pages[0].addBlade({
            view: 'separator',
          });

            const shape = tab.pages[0].addBlade({
                view: 'list',
                label: 'Shape',
                options: [
                  {text: 'Heart', value: 'heart'},
                  {text: 'Circle', value: 'circle'},  
                  {text: 'Square', value: 'square'},        
      
                ],
                value: 'heart',
                }).on('change', (ev) => {
                    scratchers[0].setShape(ev.value);
                    if (!triggered) {
                        scratchers[0].reset();
                    } else {
                        scratchers[0].clear();

                    }
                });

        foregrnd = tab.pages[0].addBlade({
            view: 'list',
            label: 'Foreground',
            options: [
                {text: 'Christmas1', value: 'Chrstms1'},
                {text: 'Colorful1', value: 'Colorful1'},
              {text: 'Gift Package1', value: 'Gift1'},
              {text: 'Gift Package2', value: 'Gift2'},
              {text: 'Gift Package3', value: 'Gift3'},
              {text: 'Golden Glitter', value: 'Goldeng'},
              {text: 'Gold Metallic1', value: 'Goldenm1'},
              {text: 'Gold Metallic2', value: 'Goldenm2'},
              {text: 'Green Glitter', value: 'Greeng'},
              {text: 'Green Metallic', value: 'Greenm'},
              {text: 'Halloween1', value: 'Halloween1'},
              {text: 'Pink Glitter', value: 'Pinkg'},
              {text: 'Pink Metallic', value: 'Pinkm'},
              {text: 'Red Glitter', value: 'Redg'},
              {text: 'Silver Glitter', value: 'Silverg'},             
              {text: 'Silver Metallic1', value: 'Silverm1'},
              {text: 'Silver Metallic2', value: 'Silverm2'},

            ],
            value: 'Goldeng',
            }).on('change', (ev) => {
                scratchers[0].setImages('images/empty.jpg','images/fore/' + ev.value +'.jpg');
            });
            
            
            var PARAMS = {
                Shorten: true,
            };
            var eff = tab.pages[1].addButton({
                title: 'Effects',
                disabled: false,
            });
            var added = 'background: #B1ACAC00; color: #ffffff !important;font-weight:lighter !important;';
            eff.element.querySelector('button').setAttribute('style', added);

            confettieffect = tab.pages[1].addBinding(PARAMS,"Shorten",{
                label: 'Confetti', 
            });
            soundeffect = tab.pages[1].addBinding(PARAMS,"Shorten",{
                label: 'Sound Effect', 
            });

            PARAMS = {
                Shorten: true,
            };
            eff = tab.pages[2].addButton({
                title: 'Finish and Create the Link',
                disabled: false,
            });
            var added = 'background: #B1ACAC00; color: #ffffff !important;font-weight:lighter !important;';
            eff.element.querySelector('button').setAttribute('style', added);

            const shortURL = tab.pages[2].addBinding(PARAMS,"Shorten",{
                label: 'Shorten URL', 
            });
            var short = shortURL.element.querySelector('input');
            short.addEventListener("click", function() {
                if (!shortURL.element.querySelector('input').checked){
                    document.getElementById('link').innerHTML= "";

                }
            });
            const stitle = {
                prop: 'Here is something for you'
            };
            const stext= tab.pages[2].addBinding(stitle, 'prop', {
                view: 'textarea',
                label: 'Text while Sharing',
                rows:2,
                limit:25,
                }).on('change', (ev) => {
                    var st = stext.element.querySelector('textarea').value;
                    var char = 25 - st.length;
                    slimit.value=char + " characters left";                    
             });
                
            const slimit = tab.pages[2].addBlade({
                view: 'text',
                label: '',
                parse: (v) => String(v),
                value: '25 characters left',
                disabled: true
            });
            
            var st = stext.element.querySelector('textarea').value;
            slimit.value=25-st.length + " characters left";

            stext.element.querySelector('textarea').setAttribute('maxlength', 25)

            const btn = tab.pages[2].addButton({
                title: 'Create the Link',
            });
            
            btn.on('click', async () => {
                if (scratchers[0].getLW()) {
                    display_dialog("Your message under scratch area contains words that are too long to fit in. \nPlease use shorter words or make sure you put space after punctuations. Please correct the error to continue.");   
                    return;
                }
                wholelink = "https://spoo.me/CuCxsQ";
                document.getElementById('link').innerHTML= wholelink;
                document.getElementById('id01').style.display='block';
            });
            var prev = btn.element.querySelector('button').getAttribute("style");
        
            /* var added = '  background: #3b88d8;  background: -moz-linear-gradient(0% 100% 90deg, #377ad0, #52a8e8);  background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#52a8e8), to(#377ad0)); background: linear-gradient(top, #52a8e8 0%, #377ad0 100%);  border-top: 1px solid #4081af;   border-right: 1px solid #2e69a3; border-bottom: 1px solid #20559a;  border-left: 1px solid #2e69a3;  -moz-box-shadow: inset 0 1px 0 0 #72b9eb, 0 1px 2px 0 rgba(0, 0, 0, .3);  -webkit-box-shadow: inset 0 1px 0 0 #72b9eb, 0 1px 2px 0 rgba(0, 0, 0, .3);  text-shadow: 0 -1px 1px #3275bc;  -webkit-background-clip: padding-box;' */
            var added = '  background: #82D83BFF;  background: -moz-linear-gradient(0% 100% 90deg, #81D037FF, #81E852FF);  background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#81E852FF), to(#81D037FF)); background: linear-gradient(top, #81E852FF 0%, #81D037FF 100%);  border-top: 1px solid #84AF40FF;   border-right: 1px solid #76A32EFF; border-bottom: 1px solid #759A20FF;  border-left: 1px solid #70A32EFF;  -moz-box-shadow: inset 0 1px 0 0 #A9EB72FF, 0 1px 2px 0 rgba(0, 0, 0, .3);  -webkit-box-shadow: inset 0 1px 0 0 #8AEB72FF, 0 1px 2px 0 rgba(0, 0, 0, .3);  text-shadow: 0 -1px 1px #52BC32FF;  -webkit-background-clip: padding-box;'
            btn.element.querySelector('button').setAttribute('style', prev+added);

    };
    function display_dialog(text) {
        $( "#error" ).text(text);
                    $( function() {
                        $( "#dialog-message" ).dialog({
                            modal: true,
                            width: 'auto',
                            height: 'auto',
                            buttons: {
                                Ok: function() {
                                $( this ).dialog( "close" );
                                }
                            },
                            show: {
                                effect: "highlight",
                                duration: 1000
                              },
                        });
                    });
                    $(".ui-widget-overlay").css({
                        background:"rgb(0, 0, 0)",
                        opacity: ".10 !important",
                        filter: "Alpha(Opacity=10)",
                    });
    }
  
    
    /**
     * Handle page load
     */
    $(function() {
        if (supportsCanvas()) {
            initPage();
        } else {
            $('#scratcher-box').hide();
            $('#lamebrowser').show();
        }
    });
    
    })();
   