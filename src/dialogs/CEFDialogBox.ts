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

import { TObject } 			from "../thermite/TObject";
import { TMouseMask } 		from "../thermite/TMouseMask";

import { CEFDialogEvent } 	from "../events/CEFDialogEvent";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import MovieClip = createjs.MovieClip;
import TextField = createjs.Text;


/**
 * 
 */
export class CEFDialogBox extends TObject
{						
	//************ Stage Symbols
	
	public Sframe:MovieClip;
	public Stitle:TextField;
	
	//************ Stage Symbols
		
	public sMask:TMouseMask;
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
			this.sMask = new TMouseMask();
			this.sMask.x = 0;
			this.sMask.y = 0;
			
			this.sMask.alpha = Alpha;
			
			this.sMask.visible = true;
			this.visible  = true;
		
			this.tutorDoc.tutorContainer.addChild(this.sMask);
			this.tutorDoc.tutorContainer.addChild(this);
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
		
		if(this.tutorDoc.tutorContainer.cCursor)
						this.tutorDoc.tutorContainer.cCursor.setTopMost();
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
				
			this.tutorDoc.tutorContainer.removeChild(this.sMask);
			this.tutorDoc.tutorContainer.removeChild(this);				

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
		for(let dialogObj in dlgPanel)
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