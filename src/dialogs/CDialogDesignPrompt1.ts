//*********************************************************************************
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
//  File:      CDialogDesignPrompt1.as
//                                                                        
//  Purpose:   CDialogDesignPrompt1 object implementation
//                                                                        
//  Author(s): Kevin Willows                                                          
//  
//  History: File Creation 9/23/2008 4:36 PM 
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

import { CEFMouseEvent } from "../events/CEFMouseEvent";
import { CEFDialogBox } from "./CEFDialogBox";

import TextField = createjs.Text;
import { CEFLabelButton } from "../controls/CEFLabelButton";



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
	
	public static readonly DLGSTAY:string	= "DLGStay";
	public static readonly DLGNEXT:string	= "DLGNext";
	
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
		this.Scancel.removeEventListener(CEFMouseEvent.WOZCLICK, this.doCancel);
		
		super.Destructor();
	}
	
	/**
	 * 
	 * @param	evt
	 */
	public doCancel(evt:CEFMouseEvent) 
	{
		this.endModal(CDialogDesignPrompt1.DLGSTAY);
	}
	
//****** Overridable Behaviors

	/**
	 * 
	 */
	public doModal(accounts:any = null, Alpha:number = 1, fAdd:boolean = true) : void 
	{		
		super.doModal(accounts, Alpha, fAdd);
		
		this.Scancel.addEventListener(CEFMouseEvent.WOZCLICK, this.doCancel);
	}					
	
	/**
	 * 
	 * @param	evt
	 */
	public endModal(Result:string) : void 
	{			
		super.endModal(Result);		
		
		this.Scancel.removeEventListener(CEFMouseEvent.WOZCLICK, this.doCancel);
	}		
	
//****** Overridable Behaviors		
	
	
}
