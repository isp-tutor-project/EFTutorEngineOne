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

import { TButton } 			from "./TButton";
import { TObject } 			from "./TObject";
import { TRoot } 			from "./TRoot";

import { TMouseEvent } 		from "../events/CEFMouseEvent";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import MovieClip     	  = createjs.MovieClip;
import Text     		  = createjs.Text;
import { CEFEvent } from "../events/CEFEvent";
import { TEvent } from "./events/TEvent";



export class TCheckButton extends TButton
{	
	//************ Stage Symbols
	
	public Schecked:MovieClip;
	
	//************ Stage Symbols
    
    public STATE_CHECKED:string;      
    

	constructor()
	{
		super();
		this.init4();
	}

/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public TCheckButtonInitialize() {

		this.TButtonInitialize.call(this);
		this.init4();
	}

	public initialize() {

		this.TButtonInitialize.call(this);		
		this.init4();
	}

	private init4() {
		
		this.traceMode = true;
        if(this.traceMode) CUtil.trace("TCheckButton:Constructor");

        this.STATE_CHECKED = "Schecked";
	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	protected fChecked:boolean = false;

	private _ftrChecked:string   = "";
	private _ftrUnchecked:string = "";
	
	
	public Destructor() : void
	{
		super.Destructor();
	}

    
	public onAddedToStage(evt:CEFEvent) {

        super.onAddedToStage(evt);

        this.addChild(this[this.STATE_CHECKED]);
        this[this.STATE_CHECKED].visible = false;
	}

	public highLight(color:string) : void
	{
		this.Slabel.color = color;        
	}
	
	public set label(newLabel:string) 
	{
		this.Slabel.text = newLabel;			
	}				
	
	
	public get label() : string
	{
		return this.Slabel.text;				
	}				
	
	
	public set showLabel(bVisible:boolean)
	{
		this.Slabel.visible = bVisible;
	}
	
	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(TutScene:TObject ) : void 
	{
		super.captureDefState(TutScene );
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(TutScene:TObject ) : void 
	{
		this.fChecked = false;
					
		super.restoreDefState(TutScene );
	}
			
			
//*************** Deep state management

	public deepStateCopy(src:any): void
	{
		this.fChecked  = src["fChecked"];
		this.curState  = src["curState"];
		this._isvalid  = src["_isvalid"];
		
		this.label          = src["Slabel"].label.text;
		this.Slabel.visible = src["Slabel"].visible;
		
		this.gotoState(this.curState);
		
		super.deepStateCopy(src);
	}		

//*************** Deep state management

//*************** Logging state management
	
	public captureLogState(obj:any = null) : TObject
	{
		obj = super.captureLogState(obj);
		
		obj['checked'] = this.fChecked.toString();
		
		return obj;											   
	}				
	
	public captureXMLState() : any
	{		
		let xmlVal:any = super.captureXMLState();
		
		xmlVal.checked= this.fChecked.toString();
		
		return xmlVal;
	}		
	
//*************** Logging state management


	public resetState() : void 
	{			
		super.resetState();
		
		this[this.STATE_CHECKED].visible    = false;		
	}
	
	public gotoState(sState:string) : void 
	{
		if(this.traceMode) CUtil.trace("Button.gotoState: ", name + " " + sState);
		
		this.resetState();
		this.curState = sState;

		if(!this.fEnabled)
		{
			this[this.STATE_UP].visible 	  = false;
            this[this.STATE_DISABLED].visible = true;
            
			this.fPressed = false;
		}
		
		else switch(sState)
		{
			case this.STATE_DOWN:
				this[this.STATE_DOWN].visible = true;
				
				this.fPressed  		 = true;
				break;
							
			case this.STATE_UP:
				if(this.fChecked)
					this[this.STATE_CHECKED].visible = true;
				else	
					this[this.STATE_UP].visible = true;
					
				this.fPressed   = false;
				break;
			
			case this.STATE_OVER:
				if(!this.fPressed)
				{
					if(this.fChecked)
						this[this.STATE_CHECKED].visible = true;
					else
						this[this.STATE_OVER].visible = true;
				}
				else
                    this[this.STATE_DOWN].visible = true;					
                    
                this.fOver = true;					    
				break;

			case CONST.STATE_OUT:
				if(this.fChecked)
					this[this.STATE_CHECKED].visible = true;
				else	
                    this[this.STATE_UP].visible = true;
                                    
                this.fOver    = false;                					
				this.fPressed = false;
				break;
		}
	}					

	
	public doMouseClicked(evt:TMouseEvent) : void 
	{						
		this.setCheck(!this.fChecked);

        if(this.traceMode) CUtil.trace("Setting Checked State: " + this.fChecked + " on button: " + name);

        this.doClickActions(evt);
	}					

	
	public setCheck(bCheck:boolean)
	{
		this.fChecked = bCheck;
		this.gotoState(this.STATE_UP);
	}
	
	
	public getChecked() : boolean
	{
		return this.fChecked;
	}

	
	public assertFeatures() : string			//## Added Mar 29 2013 - to support dynamic features
	{		
		
		if(this.fChecked)
		{
			this._activeFeature = this._ftrChecked;
		}
		else
		{
			this._activeFeature = this._ftrUnchecked;
		}				
		
		if(this._activeFeature != "")
		{
			this.tutorDoc.addFeature(this._activeFeature);
		}
		return this.activeFeature;
	}

	
	public retractFeatures() : void			//## Added Mar 29 2013 - to support dynamic features
	{		
		
		if(this._ftrChecked != "")
		{
			this.tutorDoc.delFeature(this._ftrChecked);
		}
		if(this._ftrUnchecked != "")
		{
			this.tutorDoc.delFeature(this._ftrUnchecked);
		}							
	}
	
	
//*************** Serialization
	
	/*
	* 
	*/
	public loadXML(xmlSrc:any) : void
	{			
		super.loadXML(xmlSrc);
		
		if(xmlSrc.valid != undefined)
			this._isvalid = xmlSrc.valid;

		if(xmlSrc.ftrChecked != undefined)
		this._ftrChecked = xmlSrc.ftrChecked;
		
		if(xmlSrc.ftrUnchecked != undefined)
		this._ftrUnchecked = xmlSrc.ftrUnchecked;
		
		if(xmlSrc.checked != undefined)
		this.setCheck(Boolean(xmlSrc.checked == "true"? true:false));
		
		if(xmlSrc.label != undefined)
		this.setLabel(xmlSrc.label);
		
		if(xmlSrc.showlabel != undefined)
		this.showLabel = (Boolean(xmlSrc.showlabel == "true"? true:false));			
	}
	
	/*
	*/
	public saveXML() : any
	{
		let propVector:any;
		
		return propVector;
	}	
	
//*************** Serialization		
    
//*************** Serialization
	

    public deSerializeObj(objData:any) : void
    {
        console.log("deserializing: CheckButton Control");

        super.deSerializeObj(objData);				
    }

//*************** Serialization


}
