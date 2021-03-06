﻿//*********************************************************************************
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

import { CEFDialogBox } 	from "./CEFDialogBox";

import { CEFLabelButton } 	from "../controls/CEFLabelButton";

import { TMouseEvent } 	from "../events/CEFMouseEvent";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import TextField = createjs.Text;



/**
* ...
*/
export class CDialogDesignPrompt1 extends CEFDialogBox
{
	//************ Stage Symbols
	
	public Sbody:TextField;
	public Scancel:CEFLabelButton;
	public Smoveon:CEFLabelButton;
	
	//************ Stage Symbols
	
	
	/**
	 * 
	 */
	public CDialogDesignPrompt1() 
	{
		this.setTitle("Notice");
		
		this.Scancel.setLabel("Cancel");
	}
	
	public Destructor() : void
	{
		this.Scancel.removeEventListener(TMouseEvent.WOZCLICK, this.doCancel);
		
		super.Destructor();
	}
	
	/**
	 * 
	 * @param	evt
	 */
	public doCancel(evt:TMouseEvent) 
	{
		this.endModal(CONST.DLGSTAY);
	}
	
//****** Overridable Behaviors

	/**
	 * 
	 */
	public doModal(accounts:any = null, Alpha:number = 1, fAdd:boolean = true) : void 
	{		
		super.doModal(accounts, Alpha, fAdd);
		
		this.Scancel.addEventListener(TMouseEvent.WOZCLICK, this.doCancel);
	}					
	
	/**
	 * 
	 * @param	evt
	 */
	public endModal(Result:string) : void 
	{			
		super.endModal(Result);		
		
		this.Scancel.removeEventListener(TMouseEvent.WOZCLICK, this.doCancel);
	}		
	
//****** Overridable Behaviors		
	
	
}
