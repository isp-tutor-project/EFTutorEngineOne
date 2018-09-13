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
//  File:      CEFEndCloak.as
//                                                                        
//  Purpose:   CEFEndCloak object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation May 05 2008  
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

import { TRoot } 				from "../TRoot";
import { TScene } 	from "../TScene";

import { CONST }                from "../../util/CONST";
import { CUtil } 				from "../../util/CUtil";

import MovieClip     		  = createjs.MovieClip;


export class CEFEndCloak extends TScene
{
	//************ Stage Symbols
	
	// non-interactive elements
	
	public SbackGround:MovieClip;		

	//************ Stage Symbols
	
	constructor()
	{
		super();

		if(this.traceMode) CUtil.trace("CEFEndCloak:Constructor");
	}

	
	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(TutScene:Object ) : void 
	{
		super.captureDefState(TutScene );
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(TutScene:Object ) : void 
	{
		super.restoreDefState(TutScene );
	}

	
//****** Overridden Behaviors


	// Update the Navigation Features on entry
	//
	public preEnterScene(lTutor:Object, sceneLabel:string, sceneTitle:string, scenePage:string, Direction:string ) : string
	{
		if(this.traceMode) CUtil.trace("CEFEndCloak Pre-Enter Scene Behavior: " + sceneTitle);		
				
		// No buttons on these panels
		this.tutorDoc.tutorContainer.showPPlay(false);			
		this.tutorDoc.tutorContainer.showReplay(false);			

		// Update the Navigation
		//
		this.tutorDoc.tutorContainer.SnavPanel.SnextButton.enable(false);		
		this.tutorDoc.tutorContainer.SnavPanel.SbackButton.enable(false);																		
														
		return super.preEnterScene(lTutor, sceneLabel, sceneTitle, scenePage, Direction );
	}
	
	
//****** Overridable Behaviors
			
}
