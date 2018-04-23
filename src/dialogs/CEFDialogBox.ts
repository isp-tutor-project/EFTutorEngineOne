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

import { CEFObject } 		from "../core/CEFObject";
import { CEFDoc } 			from "../core/CEFDoc";
import { CEFMouseMask } 	from "../core/CEFMouseMask";

import { CEFDialogEvent } 	from "../events/CEFDialogEvent";

import { CTutorState }      from "../util/CTutorState";
import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import MovieClip = createjs.MovieClip;
import TextField = createjs.Text;


/**
 * 
 */
export class CEFDialogBox extends CEFObject
{						
	//************ Stage Symbols
	
	public Sframe:MovieClip;
	public Stitle:TextField;
	
	//************ Stage Symbols
		
	public sMask:CEFMouseMask;
	public fAddDlg:boolean;
	
	
	/**
	 * 
	 */
	public CEFDialogBox() : void 
	{								
	}					

	
	/**
	 * 
	 * @param	txt
	 */
	public setTitle(txt:string ) : void 
	{								
		this.Stitle.text = txt;
	}					

	
	/**
	 * 
	 * @param	X
	 * @param	Y
	 */
	public moveDialog(X:number, Y:number)
	{
		this.x = X;
		this.y = Y;
	}
	
	
	/**
	 * 
	 */
	public centerDialog()
	{
		// this.moveDialog(((CONST.designWidth - this.width) / 2), ((CONST.designHeight - this.height) / 2));   //** TODO */
	}
	
	
//****** Overridable Behaviors

	/**
	 * 
	 * @param	Alpha
	 */
	public doModal(accounts:any = null, Alpha:number = 1, fAdd:boolean = true) : void 
	{							
		// If dialog is not already on stage add it - remember so we can remove it later
		
		this.fAddDlg = fAdd;
		
		if(fAdd)
		{
			this.sMask = new CEFMouseMask();
			this.sMask.x = 0;
			this.sMask.y = 0;
			
			this.sMask.alpha = Alpha;
			
			this.sMask.visible = true;
			this.visible  = true;
		
			if(CTutorState.gApp && CTutorState.gApp.Stutor)
			{
				CTutorState.gApp.Stutor.addChild(this.sMask);
				CTutorState.gApp.Stutor.addChild(this);
			}
		}
		else
		{
			this.sMask.x = 0;
			this.sMask.y = 0;
			
			this.sMask.alpha = Alpha;
			
			this.sMask.visible = true;
			this.visible  = true;
			
			this.sMask.setTopMost();
			this.setTopMost();
		}
		
		if(CTutorState.gApp && CTutorState.gApp.Stutor && CTutorState.gApp.Stutor.cCursor)
										CTutorState.gApp.Stutor.cCursor.setTopMost();
	}					

	
	/**
	 * 
	 * @param	evt
	 */
	public endModal(result:string) : void 
	{
		
		if(this.fAddDlg)
		{	
			this.visible = false;
				
			if(CTutorState.gApp && CTutorState.gApp.Stutor)
			{
				CTutorState.gApp.Stutor.removeChild(this.sMask);
				CTutorState.gApp.Stutor.removeChild(this);				
			}
			this.sMask = null;
		}
		else
		{
			this.visible  = false;					
			this.sMask.visible = false;
		}
		
		this.dispatchEvent(new CEFDialogEvent(result, CEFDialogEvent.ENDMODAL ));
	}		

//***************** Automation *******************************		

	// Walk the WOZ Objects to initialize their automation mode
	//
	public setObjMode(dlgPanel:any, sMode:string) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Walking Dialog Objects***");

		for(let dialogObj in dlgPanel)
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
		for(let dialogObj in dlgPanel)
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