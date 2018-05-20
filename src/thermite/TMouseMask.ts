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

import { TObject } 		from "./TObject";

import { TMouseEvent } 	from "../events/CEFMouseEvent";

import { CUtil } 		from "../util/CUtil";



/**
* ...
*/
export class TMouseMask extends TObject
{
	
	/**
	* Creates a new CEFMouseMask instance. 
	*/
	constructor() 
	{
		super();

		this.traceMode = true;
		
		this.addEventListener(TMouseEvent.WOZCLICKED, this.discardEvent);
		this.addEventListener(TMouseEvent.WOZMOVE   , this.discardEvent);
		this.addEventListener(TMouseEvent.WOZOVER   , this.discardEvent);
		this.addEventListener(TMouseEvent.WOZOUT    , this.discardEvent);
		this.addEventListener(TMouseEvent.WOZDOWN   , this.discardEvent);
		this.addEventListener(TMouseEvent.WOZUP     , this.discardEvent);
	}
	
	// Don't allow anyone else to ge this message
	//
	public discardEvent(evt:TMouseEvent)
	{
		if(this.traceMode) CUtil.trace("Attempting to stop Propogation", evt.target , evt.type);
		
		evt.stopPropagation();
	}
	
//****** Overridable Behaviors
	
//***************** Automation *******************************		

	// Walk the WOZ Objects to initialize their automation mode
	//
	public setObjMode(dlgPanel:any, sMode:String) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Walking Dialog Objects***");

		for(var dialogObj in dlgPanel)
		{			
			if(dialogObj != "_instance" && dlgPanel[dialogObj].instance instanceof TObject)
			{
				dlgPanel[dialogObj].instance.setAutomationMode(dlgPanel[dialogObj], sMode );										
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End - Walking Dialog Objects***");
	}
	
//***************** Automation *******************************		
	
	
//***************** Debug *******************************		
		
	public dumpSceneObjs(dlgPanel:any) : void
	{							
		for(var dialogObj in dlgPanel)
		{
			if(this.traceMode) CUtil.trace("\tNavPanelObj : " + dialogObj);
			
			if(dialogObj != "_instance" && dlgPanel[dialogObj].instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("\tCEF***");
				
				dlgPanel[dialogObj].instance.dumpSubObjs(dlgPanel[dialogObj], "\t");										
			}					
		}		
	}

//***************** Debug *******************************				
	
//****** Overridable Behaviors
	
}
