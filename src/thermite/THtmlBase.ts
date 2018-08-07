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
import { CONST }                from "../util/CONST";

import MovieClip     	      = createjs.MovieClip;
import Tween    		  	  = createjs.Tween;
import Event    		  	  = createjs.Event;
import Text     	          = createjs.Text;
import Ease			  	      = createjs.Ease;
import { CEFTimeLine } from "../core/CEFTimeLine";




export class THtmlBase extends TObject {


	//************ Stage Symbols
	
	    // Generated controls    

        protected outerContainer:HTMLElement;    
        protected controlContainer:HTMLElement;

	//************ Stage Symbols				
    
    protected dimContainer:TObject;
    protected scaleCompensation:number;

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

    protected _objDataArray:Array<any>;
    protected _currObjNdx:number;



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

    // Invert the initial scaling on the object itself - 
    // i.e. distortion due to the resize of the controlcontainer in AnimateCC layout
    //  TODO: Adobe's approach to scaling is not entirely sound - 
    // 
    invertScale() {

        let mat = this.getMatrix();

        let tx1 = mat.decompose(); 
        let sx = tx1.scaleX; 
        let sy = tx1.scaleY;

        let w   = this.dimContainer.nominalBounds.width  * sx; 
        let h   = this.dimContainer.nominalBounds.height * sy;

        // let mat = this.dimContainer.getConcatenatedDisplayProps(this.dimContainer._props).matrix;
        // this.scaleCompensation = 1/mat.decompose().scaleY; 
        // console.log(this.scaleCompensation);
        // let style              = window.getComputedStyle(this.controlContainer);

        this.scaleCompensation = CONST.CONTROLCONTAINER_DESIGNHEIGHT/h; 
        
        console.log("Scaled Height: " + h);
        console.log("Scaled Compensation: " + this.scaleCompensation);

    }


    public onAddedToStage(evt:CEFEvent) {

        let stage;

        // We are added to the scene on each frame of an animation
        //
		this._lastFrame = (this.parent as MovieClip).currentFrame;       

        if(!this.fAdded) {

            this.effectTimeLine = new CEFTimeLine(null, null, {"useTicks":false, "loop":false, "paused":true }, this.tutorDoc);
            this.effectTweens   = new Array<Tween>();

            this.styleElement       = document.createElement('style');
            this.styleElement.type  = 'text/css';
            this.styleElement.id    = 'scene1Input1';

            // Note that the sheet property is null until the element is added to the 
            // page.
            // 
            document.head.appendChild(this.styleElement);                        

            // TODO: Make this reactive to the initial css tranparency setting
            // 
            this.effectAlpha    = 1;  //this.alpha;

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

            this.setProperty("font-size", this.fontSize * sy  * this.scaleCompensation + "px");        // TODO: investigate use of 'vw' units to auto scale

            this.setProperty('transform', tx);
            this.setProperty('width', w + "px");
            this.setProperty('height', h + "px");
            this.updateStyle(false);
        }
    }

    public hideSpan(spanID:string) {

        let span = document.getElementById(spanID);

        span.style.visibility = "hidden";
    }


    public showSpan(spanID:string) {

        let span = document.getElementById(spanID);

        span.style.visibility = "visible";
    }


    public setContentById(objId:string, effectType:string = CONST.EFFECT_FADE, effectDur:number = 500) {

        for(let i1 = 0; i1 < this._objDataArray.length ; i1++) {

            if(this._objDataArray[i1].Id === objId) {
                this.effectNewIndex = i1;
                this.performTransition(this.effectNewIndex, effectType, effectDur);
                break;
            }
        }
    }


    public setContentNext(effectType:string = CONST.EFFECT_FADE, effectDur:number = 500) {

        this.effectNewIndex = (this._currObjNdx + 1) % this._objDataArray.length;

        this.performTransition(this.effectNewIndex, effectType, effectDur);
    }


    /**
     * 
     */	
    public setContentByIndex(newIndex:number, effectType:string = CONST.EFFECT_FADE, effectDur:number = 500) : void
    {
        let zeroBase:number = newIndex - 1;

        this.performTransition(zeroBase, effectType, effectDur);
    }

    /**
     * 
     */	
    private performTransition(effectNewIndex:number, effectType:string, effectDur:number = 500) : void
    {

        if(this._currObjNdx !== effectNewIndex) {

            this.effectNewIndex = effectNewIndex;
            this.effectType     = effectType;
            this.effectTimeMS   = effectDur;

            switch(effectType) {

                case CONST.EFFECT_FADE:

                    this.effectTweens.push(new Tween(this).to({alpha:0}, effectDur/2, Ease.cubicInOut));

                    // push the tween on to the run stack
                    //
                    this.effectTimeLine.addTween(...this.effectTweens);	
                    this.effectTimeLine.startTransition(this.swapContent, this);								
                    break;

                case CONST.EFFECT_SWAP:

                    this.swapContent();
                    break;
            }
        }
    }

    private swapContent() {

        this.effectTimeLine.removeTween(...this.effectTweens);

        try {
            this._currObjNdx = this.effectNewIndex;
            this.initObjfromData(this._objDataArray[this.effectNewIndex]);
        }
        catch(err) {

        }

        switch(this.effectType) {

            case CONST.EFFECT_FADE:

            
                // Note that we restore it to its previous alpha value not necessarily 1
                // 
                this.effectTweens.push(new Tween(this).to({alpha:this.effectAlpha}, this.effectTimeMS/2, Ease.cubicInOut));

                // push the tween on to the run stack
                //
                this.effectTimeLine.addTween(...this.effectTweens);	
                this.effectTimeLine.startTransition(this.effectFinished, this);								
                break;

            case CONST.EFFECT_SWAP:
                break;
        }
    }

    /**
	 * Object specific finalization behaviors - invoked through  reference in xnFinished
	 */
	private effectFinished() : void
	{			
        this.effectTimeLine.removeTween(...this.effectTweens);

		this.dispatchEvent(new Event(CEFEvent.COMPLETE,false,false));
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

    
    private initObjfromData(objData:any) {

        this.controlContainer.innerHTML = objData.html;

        this.addCustomStyles(objData.style, this.cssSheet );
        this.addCSSRules(this.styleElement, this.cssSheet );

        this.invertScale();

    }


    /*
    * 
    */
    public deSerializeObj(objData:any) : void
    {
        console.log("deserializing: HTMLBase Custom Control");

        if(Array.isArray(objData)) {

            this._objDataArray = objData;

            for(let i1 = 0; i1 < objData.length ; i1++) {

                if(objData[i1].default) {
                    this._currObjNdx = i1;
                    this.initObjfromData(objData[i1]);
                    break;
                }
            }

        }
        else {
            this._objDataArray = null;            
            this.initObjfromData(objData);
        }

        super.deSerializeObj(objData);				
    }
}