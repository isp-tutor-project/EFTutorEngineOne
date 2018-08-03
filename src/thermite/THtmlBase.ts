//*********************************************************************************
//
//  Copyright(c) 2008,2018 Kevin Willows. All Rights Reserved
//
//	License: Proprietary
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//
//*********************************************************************************

//**Imports

import { TObject } 			    from "./TObject";

import { CEFEvent }             from "../events/CEFEvent";
import { TMouseEvent } 		    from "../events/CEFMouseEvent";

import { CUtil } 			    from "../util/CUtil";

import MovieClip     	      = createjs.MovieClip;
import Text     	          = createjs.Text;




export class THtmlBase extends TObject {


	//************ Stage Symbols
	
	    // Generated controls    

        protected outerContainer:HTMLElement;    
        protected controlContainer:HTMLElement;

	//************ Stage Symbols				
    
    protected dimContainer:TObject;

    protected fAdded:boolean;

    protected isHTMLControl:boolean;
    protected HTMLmute:boolean;
    protected startText:string;

    protected styleElement:HTMLStyleElement;
    protected styleSheet:StyleSheet;
    protected cssSheet:any;
    protected cssDirty:any;

    protected fontSize:number;
    protected _updateVisibilityCbk:any;
    protected _updateComponentCbk:any;
    protected _lastFrame:number;



    constructor() {

        super();

    }


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

    public THtmlBaseInitialize() {

        this.TObjectInitialize.call(this);
        this.init3();
    }

    public initialize() {

        this.TObjectInitialize.call(this);		
        this.init3();
    }

    private init3() {
        
        this.traceMode = true;
        if(this.traceMode) CUtil.trace("THtmlBase:Constructor");

        this.on(CEFEvent.ADDED_TO_STAGE, this.onAddedToStage);
        
        this.fAdded   = false;

        this.isHTMLControl = true;
        this.HTMLmute      = true;
        this.cssDirty   = {};

    }

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


    public Destructor() : void
    {
        this.removeEventListener(TMouseEvent.WOZCLICKED, this.doMouseClicked);
        this.removeEventListener(TMouseEvent.WOZOVER   , this.doMouseOver);
        this.removeEventListener(TMouseEvent.WOZOUT    , this.doMouseOut);
        this.removeEventListener(TMouseEvent.WOZDOWN   , this.doMouseDown);
        this.removeEventListener(TMouseEvent.WOZUP     , this.doMouseUp);			
        
        if(this.fAdded) {
            dom_overlay_container.removeChild(this.outerContainer); 
            this.fAdded = false;
        }

        super.Destructor();
    }

    public onAddedToStage(evt:CEFEvent) {

        let stage;

        // We are added to the scene on each frame of an animation
        //
		this._lastFrame = (this.parent as MovieClip).currentFrame;       

        if(!this.fAdded) {

            this.styleElement       = document.createElement('style');
            this.styleElement.type  = 'text/css';
            this.styleElement.id    = 'scene1Input1';

            // Note that the sheet property is null until the element is added to the 
            // page.
            // 
            document.head.appendChild(this.styleElement);                        

            this.fAdded = true;

            if(stage = this.getStage()) {
                this._updateVisibilityCbk = stage.on('drawstart', this._handleDrawStart, this, false);
                this._updateComponentCbk  = stage.on('drawend'  , this._handleDrawEnd  , this, false);
            }
        }
    }


    public addCSSRules(styleElement:HTMLStyleElement, cssStyles:any) {

        let sheet:CSSStyleSheet = styleElement.sheet as CSSStyleSheet;

        for(let ruleSet in cssStyles) {
            
            let ruleStr:string = `${ruleSet} {${this.buildRuleSet(cssStyles[ruleSet])}}`;
            sheet.insertRule(ruleStr, sheet.cssRules.length);
        }
    }

    public buildRuleSet(cssRules:any) : string {

        let rules:string = "";

        for(let rule in cssRules) {
            rules += `${rule}: ${cssRules[rule]};\n`;            
        }

        return rules;
    }


    public setProperty(key:string, value:string|number, force:boolean = false) {

        if(force || this.cssSheet[key] != value) {
            this.cssDirty[key] = true;
        }
        this.cssSheet[key] = value;
    }


    public updateStyle(force:boolean) {
            
        for(let attr in this.cssSheet) {

            if(force || this.cssDirty[attr]) {
                this.cssDirty[attr] = false;
                (this.outerContainer.style as any)[attr] = this.cssSheet[attr];
            }
        }    
    }


    public muteHTMLControl(mute:boolean) {

        this.HTMLmute = mute;
    }


    public _handleDrawStart(evt:CEFEvent) {

        if(this.fAdded) {

            if((this.getStage() == null || this._lastFrame != (this.parent as MovieClip).currentFrame)) {

                dom_overlay_container.removeChild(this.outerContainer); 
                this.fAdded = false;

                this.stage.removeEventListener('drawstart', this._updateVisibilityCbk);
                this._updateVisibilityCbk = false;

                this.stage.removeEventListener('drawend', this._updateComponentCbk);
                this._updateComponentCbk = false;
            }
        }
    }


    public _handleDrawEnd(evt:CEFEvent) {

        if(this.fAdded && !this.HTMLmute) {
            let mat = this.dimContainer.getConcatenatedDisplayProps(this.dimContainer._props).matrix;

            let tx1 = mat.decompose(); 
            let sx = tx1.scaleX; 
            let sy = tx1.scaleY;

            // TODO: should this.prototype.nominalbounds be used instead?
            
            mat.tx += this.dimContainer.nominalBounds.x  * sx; 
            mat.ty += this.dimContainer.nominalBounds.y  * sy; 
            let w   = this.dimContainer.nominalBounds.width  * sx; 
            let h   = this.dimContainer.nominalBounds.height * sy;

            let dp = window.devicePixelRatio || 1; 
            mat.tx/=dp;
            mat.ty/=dp; 
            mat.a/=(dp*sx);
            mat.b/=(dp*sx);
            mat.c/=(dp*sy);
            mat.d/=(dp*sy);

            this.setProperty('transform-origin', this.regX + 'px ' + this.regY + 'px');

            let x = (mat.tx + this.regX*mat.a + this.regY*mat.c - this.regX);
            let y = (mat.ty + this.regX*mat.b + this.regY*mat.d - this.regY);

            let tx = 'matrix(' + mat.a + ',' + mat.b + ',' + mat.c + ',' + mat.d + ',' + x + ',' + y + ')';

            this.setProperty("visibility", this.visible? "visible":"hidden");
            this.setProperty("opacity", this.alpha);
            this.setProperty("font-size", this.fontSize * sx + "px");        // TODO: investigate use of 'vw' units to auto scale
            this.setProperty('transform', tx);
            this.setProperty('width', w + "px");
            this.setProperty('height', h + "px");
            this.updateStyle(false);
        }
    }
    

    private addCustomStyles(srcStyle:any, tarStyle:any) {

        for(let ruleSet in srcStyle) {
            
            let styles = srcStyle[ruleSet];

            for(let style in styles) {

                tarStyle[ruleSet] = tarStyle[ruleSet] || {};

                tarStyle[ruleSet][style] = styles[style];
            }
        }
    }


    /*
    * 
    */
    public deSerializeObj(objData:any) : void
    {
        console.log("deserializing: HTMLBase Custom Control");

        this.controlContainer.innerHTML = objData.html;

        this.addCustomStyles(objData.style, this.cssSheet );
        this.addCSSRules(this.styleElement, this.cssSheet );

        super.deSerializeObj(objData);				
    }
}