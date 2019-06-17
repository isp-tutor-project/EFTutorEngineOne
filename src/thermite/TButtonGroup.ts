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

//** Imports

import { TRoot } 			from "./TRoot";
import { TObject } 			from "./TObject";
import { TCheckButton } 	from "./TCheckButton";
import { TButton } 			from "./TButton";

import { TButtonEvent } 	from "./events/TButtonEvent";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";
import { CEFEvent } from "../events/CEFEvent";
import { TEvent } from "./events/TEvent";


/**
* Utility class - provides support for radio buttons 
*/
export class TButtonGroup extends TObject
{
	public buttons:Array<any>;
	public buttonType:Array<string> = new Array();		//## Added Sep 29 2012 - to support individual radio style buttons. i.e. buttons that are exclusive 
	
	public _fRadioGroup:boolean  = true;				//## Added Jun 26 2012 - to support non radio style button groups. 
			
	private _inited:boolean = false;
	
	private onChangeScript:string = null;

	static readonly CHECKED:string = "ischecked";
    
    
	/**
	* Creates a new ButtonGroup instance. 
	*/
	constructor()
	{
		super();
		this.init3();
	}


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public TButtonGroupInitialize() {

		this.TObjectInitialize.call(this);
		this.init3();
	}

	public initialize() {

		this.TObjectInitialize.call(this);		
		this.init3();
	}

	private init3() {
		
		this.traceMode = true;
		if(this.traceMode) CUtil.trace("TButtonGroup:Constructor");

        this.buttons    = new Array();
        this.buttonType = new Array();		//## Added Sep 29 2012 - to support individual radio style buttons. i.e. buttons that are exclusive 
        
        this._fRadioGroup   = true;				//## Added Jun 26 2012 - to support non radio style button groups.                 
        this._inited        = false;
        this.onChangeScript = null;       

        // Note the CreateJS(AnimateCC) parts of the button have not been created
		// at this point.
	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */

    
	public onAddedToStage(evt:CEFEvent) {

		console.log("ButtonGroup On Stage");

		this.mouseChildren = false;

        this.Sborder.visible = false;
        this.Sborder.hidden  = true;
	}


	public addButton(newButton:any, bType:string="")
	{
		this.buttons.push(newButton);		
		this.buttonType.push(bType);															
        
        newButton.on(CONST.BUTTON_CLICK , this.updateGroupChk, this);
	}
    
    
	public removeButton(newButton:TButton) : void
	{
        newButton.off(CONST.BUTTON_CLICK , this.updateGroupChk);
	}
    
    
	public updateGroupChk(evt:TEvent)
	{
		let i1:number;
		let _radioReset:boolean = false;					//## Added Sep 29 2012 - to support individual radio style buttons. i.e. buttons that are exclusive
                
        this.doAction(evt);
		
        //@@ Action Logging			
        let logData:any = {'action':'button_click', 'targetid':this.name};
        
		// indicate that a selection has been made in the button group
		//
		dispatchEvent(new Event(TButtonGroup.CHECKED));

        this.tutorDoc.log.logActionEvent(logData);			
        //@@ Action Logging						

		
		// If we have clicked a radio reactive button then set flag to reset all other buttons.
		//## Added Sep 29 2012 - to support individual radio style buttons. i.e. buttons that are exclusive
		
		for(i1 = 0 ; i1 < this.buttons.length ; i1++)
		{
			if(this.buttons[i1] == evt.target)
			{
				if(this.buttonType[i1] == "radio")
								_radioReset = true;
			}
		}				
		
		// reset all other buttons in the group if this is a single selection group
		//
		if(this._fRadioGroup || _radioReset)
		{
			for(i1 = 0 ; i1 < this.buttons.length ; i1++)
			{
				if(this.buttons[i1] != evt.target)
				{
					this.buttons[i1].setCheck(false);
				}
			}
		}
		
		// When clicking a non-radio style button we need to make sure all the radio style buttons are reset  
		//## Added Sep 29 2012 - to support individual radio style buttons. i.e. buttons that are exclusive
		else
		{
			for(i1 = 0 ; i1 < this.buttons.length ; i1++)
			{
				if((this.buttons[i1] != evt.target) && (this.buttonType[i1] == "radio")) 
				{
					this.buttons[i1].setCheck(false);
				}
			}
		}
	}

    
	public updateGroupUnChk(evt:Event)
	{
		// indicate that a selection has been made in the button group
		//
		this.dispatchEvent(new Event(TButtonEvent.WOZCHECKED));
	}

    
	/**
	 *## Added Jun 26 2012 - to support non radio style button groups.
		* 
		*/
	public set radioType( fRadioGroup:boolean)
	{
		this._fRadioGroup = fRadioGroup;
	}
	
	
	public get isComplete() : string
	{
		let sResult:string = "false";
		
		// We assume we have a no selection
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			// We assume no selection and look for contradictions
			
			if(this.buttons[i1].getChecked())
			{
				sResult = "true";
				break;
			}
		}
		
		return sResult;
	}
	
	
	/**
	 * 
	 */
	public querySelectedValid() : string
	{
		let sResult:string = "true";
		
		// We assume we have a some selection
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			// We assume valid selection and look cor contradictions
							
			if(this.buttons[i1].getChecked())
			{
				// if checked but not valid then this is an invalid group
				
				if(this.buttons[i1].isValid == "false")
				{
					sResult = "false";
					break;
				}
			}
			else
			{
				// if not checked but valid then this is an invalid group
				
				if(this.buttons[i1].isValid == "true")
				{
					sResult = "false";
					break;
				}					
			}
		}
		
		return sResult;
	}			
	
	
	public resetAll() : void
	{
		// Reset all buttons
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			this.buttons[i1].resetState();
		}			
	}
	
	
	public highLightRightOnly() : void
	{
		// Put GREEN Check on all valid 
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{				
			if(this.buttons[i1].isValid == "true")
				this.buttons[i1].setCheck2(true);
			else
				this.buttons[i1].resetState();
		}
	}

	
	public highLightRightLabel(hColor:number) : void
	{
		// Put GREEN Check on all valid 
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{				
			if(this.buttons[i1].isValid == "true")
					this.buttons[i1].highLight(hColor);
		}
	}
	
	
	public highLightWrong() : void
	{
		// Put RED X on all checked that are invalid - leave correct unchanged
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{				
			if(this.buttons[i1].getChecked())
			{
				if(this.buttons[i1].isValid != "true")
				{
					this.buttons[i1].setCheck3(true);
				}
			}
		}
	}
	

	public get isValid() : string
	{
		let sResult:string = "true";
		
		// We assume we have something selected
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			// We assume valid selection and look for contradictions
			
			if(this.buttons[i1].getChecked() == true)
			{
				// if checked but not valid then this is an invalid group
				
				if(this.buttons[i1].isValid != "true")
				{
					sResult = "false";
					break;
				}
			}
			else
			{
				// if not checked but valid then this is an invalid group
				
				if(this.buttons[i1].isValid == "true")
				{
					sResult = "false";
					break;
				}					
			}
		}
		
		return sResult;
	}
	
	
	//## Added Sep 28 2012 - to support dynamic features
	
	public assertFeatures() : string
	{
		let _feature:string;
		
		// We assume we have something selected
		//
		if(this.isValid == "true")
		{
			_feature = this._validFeature;
		}
		else
		{
			_feature = this._invalidFeature;
		}
		
		if(_feature != "")
			this.tutorDoc.addFeature(_feature);
		
		// Assert button specific features 
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{				
			this.buttons[i1].assertFeatures();
		}
		
		
		return _feature;
	}
	
	
	//## Added Sep 28 2012 - to support dynamic features
	
	public retractFeatures() : void
	{
		let _feature:string;
		
		// We assume we have something selected
		//
		if(this.isValid == "true")
		{
			_feature = this._validFeature;
		}
		else
		{
			_feature = this._invalidFeature;
		}
		
		if(_feature != "")
			this.tutorDoc.delFeature(_feature);
		
		// Assert button specific features 
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{				
			this.buttons[i1].retractFeatures();
		}
	}
	
	
	public get tallyValid() : string
	{
		let iResult:number = 0;
		
		// We assume we have something selected
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			// We assume valid selection and look for contradictions
			// tally the number of correct responses selected
			
			if(this.buttons[i1].getChecked() == true)
			{
				// if checked but not valid then this is an invalid group
				// They get no credit - zero
				
				if(this.buttons[i1].isValid != "true")
				{
					iResult = 0;
					break;
				}
				else iResult++;
			}
			
			// Note: This does not penalize you for not selecting a correct response. 
			//       you just don't get credit for it.
		}
		
		return iResult.toString();
	}
	
	
	public get tallySelected() : string
	{
		let iResult:number = 0;
		
		// We assume we have something selected
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			// We assume valid selection and look for contradictions
			// tally the number of correct responses selected
			
			if(this.buttons[i1].getChecked() == true)
			{
				iResult++;
			}
			
			// Note: This does not penalize you for not selecting a correct response. 
			//       you just don't get credit for it.
		}
		
		return iResult.toString();
	}
	
	
	public get ansText() : string
	{
		let sResult:string = "";
		
		// We assume we have some selection
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			// return the validity state of the selected button
			
			if(this.buttons[i1].getChecked())
			{
				if(sResult.length > 0) sResult += ",";
					
				sResult += this.buttons[i1].getLabel();
			}			
		}
		
		return sResult;
	}
	

	public get inUse() : boolean
	{
		return this._inited;	
	}
	
//*************** Logging state management
	
//******** Experimenter LOG

	/**
	 * encode experiment state polymorphically
	 * @return An XML object representing the current object state
	 */
	public logState() : any
	{
		//@@ State Logging
		let groupState:any;
		
		// reset all other buttons in the group
		//
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			if(this.buttons[i1].getChecked())
			{
				// groupState = <groupbutton selected={this.buttons[i1].toString()}/>;
				break;
			}
		}
		
		return groupState;
		//@@ State Logging			
	}			

	
	/**
	 * encode the group state
	 * @return A string with seqential button states 
	 */
	public querylogGroup() : string
	{
		let groupState:string = "";
		
		for(let i1:number = 0 ; i1 < this.buttons.length ; i1++)
		{
			if(i1 > 0)
				groupState += ",";
			
			if(this.buttons[i1].getChecked()) groupState += "B" + i1 + "_Checked";
										 else groupState += "B" + i1 + "_Unchecked";
		}
		
		return groupState;
		//@@ State Logging			
	}			
	
	
	
	
//******** Experimenter LOG
	
//*************** Logging state management

	
//**************** Serialization
	
	/*
	* 
	*/
	public loadXML(xmlSrc:any) : void
	{						
		let tarButton:any;
		let objArray:Array<any>;
		
		super.loadXML(xmlSrc);									
		
		for (let butInst of xmlSrc.button)
		{
			CUtil.trace(butInst.name);
			
			//@@ mod Jan 22 2013 - enhanced to support nested buttons
			
			try
			{
				objArray = butInst.name.split(".");
				
				if(this.traceMode) CUtil.trace("Target Array: " + objArray[0]);
				
				if(objArray.length)
					tarButton = this.decodeTarget(this.parent, objArray);								
			}
			catch(err)
			{
				tarButton = null;
			}				
			
			if(tarButton)
			{
				if(butInst.type != undefined)									//## Added Sep 29 2012 - to support individual radio style buttons. i.e. buttons that are exclusive						
					this.addButton(tarButton, butInst.type );
				else
					this.addButton(tarButton);
			}				
		}

		if(xmlSrc.xname != undefined)										//## added Jan 23 2013 - xname uninitialized previously			
			this.xname = xmlSrc.xname;
					
		if(xmlSrc.radioType != undefined)										//## Added Jun 26 2012 - to support non radio style button groups.
			this.radioType = (Boolean(xmlSrc.radioType == "true"? true:false));
		
		if(xmlSrc.validftr != undefined)										//## Added Sep 28 2012 - to support dynamic features 
			this._validFeature = xmlSrc.validftr;
		
		if(xmlSrc.invalidftr != undefined)										//## Added Sep 28 2012 - to support dynamic features
			this._invalidFeature = xmlSrc.invalidftr;
		
		if(xmlSrc.onchange != undefined)		
		{
			// Note: it is imperitive that we precompile the script -
			//       Doing it on each invokation causes failures

			//  this.onChangeScript = D.parseProgram(xmlSrc.onchange);
			 this.onChangeScript = xmlSrc.onchange;
		}
		
		this._inited = true;
	}
	
	/*
	*/
	public saveXML() : any
	{
		let propVector:any;
		
		return propVector;
	}

//**************** OLD Serialization		



//*************** Serialization



private initGroupFromData(objData:any) {

    let btnOwner:any = this.parent;

    objData.members.forEach((btnName:string) => {
        this.addButton(btnOwner[btnName], objData.type||"radio");
    });    
}


public deSerializeObj(objData:any) : void
{
    console.log("deserializing: ButtonGroup");

    super.deSerializeObj(objData);		
    
    if(objData.grpData)
        this.initGroupFromData(objData.grpData);
    
}

//*************** Serialization



}
