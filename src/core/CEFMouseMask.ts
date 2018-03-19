﻿//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2008 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CEFMouseMask.as
//                                                                        
//  Purpose:   CEFMouseMask Base class implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
// History: File Creation 10/18/2008 3:45 PM
//                                                                        
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************

//** Imports

import { CEFObject } from "./CEFObject";
import { CEFMouseEvent } from "../events/CEFMouseEvent";
import { CUtil } from "../util/CUtil";



/**
* ...
*/
export class CEFMouseMask extends CEFObject
{
	
	/**
	* Creates a new CEFMouseMask instance. 
	*/
	constructor() 
	{
		super();

		this.traceMode = false;
		
		this.addEventListener(CEFMouseEvent.WOZCLICKED, this.discardEvent);
		this.addEventListener(CEFMouseEvent.WOZMOVE   , this.discardEvent);
		this.addEventListener(CEFMouseEvent.WOZOVER   , this.discardEvent);
		this.addEventListener(CEFMouseEvent.WOZOUT    , this.discardEvent);
		this.addEventListener(CEFMouseEvent.WOZDOWN   , this.discardEvent);
		this.addEventListener(CEFMouseEvent.WOZUP     , this.discardEvent);
	}
	
	// Don't allow anyone else to ge this message
	//
	public discardEvent(evt:CEFMouseEvent)
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
			if(dialogObj != "instance" && dlgPanel[dialogObj].instance instanceof CEFObject)
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
			
			if(dialogObj != "instance" && dlgPanel[dialogObj].instance instanceof CEFObject)
			{
				if(this.traceMode) CUtil.trace("\tCEF***");
				
				dlgPanel[dialogObj].instance.dumpSubObjs(dlgPanel[dialogObj], "\t");										
			}					
		}		
	}

//***************** Debug *******************************				
	
//****** Overridable Behaviors
	
}
