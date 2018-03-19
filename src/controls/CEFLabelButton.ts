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
//  File:      CEFLabelButton.as
//                                                                        
//  Purpose:   CEFLabelButton object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Aug 06 2008  
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

import { CEFButton } from "../core/CEFButton";



export class CEFLabelButton extends CEFButton
{
		
	
	
	
	public CEFLabelButton():void
	{
		//trace("CEFLabelButton:Constructor");
	}
	
	
	public setLabel(newLabel:string) : void
	{
		(this.Sup as any).Slabel.text       = newLabel;			
		(this.Sover as any).Slabel.text     = newLabel;			
		(this.Sdown as any).Slabel.text 	= newLabel;			
		(this.Sdisabled as any).Slabel.text = newLabel;			
	}		
			
}
