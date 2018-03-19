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
//  File:      CEFStartScene.as
//                                                                        
//  Purpose:   CEFStartScene object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 21 2008  
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

import { CEFSceneSequence } from "../core/CEFSceneSequence";

import MovieClip = createjs.MovieClip;
import TextField = createjs.Text;
import { CUtil } from "../util/CUtil";
import { CEFRoot } from "../core/CEFRoot";



export class CEFStartScene extends CEFSceneSequence
{
	//************ Stage Symbols
	
	// non-interactive elements
	
	public Sstart:TextField;	
	public Sicon:MovieClip;
	
	//************ Stage Symbols
			
	public CEFStartScene():void
	{
		this.traceMode = false;
		
		if(this.traceMode) CUtil.trace("CEFStartScene:Constructor");
		
		// No pacing here
		this.fComplete = true;
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

//****** Overridable Behaviors

//****** Navigation Behaviors

	// Default behavior - Set the Tutor Title and return same target scene
	// Direction can be - "WOZNEXT" , "WOZBACK" , "WOZGOTO"
	// 
	// return values - label of target scene or one of "WOZNEXT" or "WOZBACK"
	//
	public preEnterScene(lTutor:Object, sceneLabel:string, sceneTitle:string, scenePage:string, Direction:string ) : string
	{
		if(this.traceMode) CUtil.trace("CEFStartScene Pre-Enter Scene Behavior: " + sceneTitle);		
		
		CEFRoot.gTutor.showReplay(false);			
		CEFRoot.gTutor.showPPlay(false);			
					
		return super.preEnterScene(lTutor, sceneLabel, sceneTitle, scenePage, Direction );
	}

	/**
	 * Disable the default behavior - no Play / Pause
	 * @param	Direction
	 */
	public onEnterScene(Direction:string) : void
	{				
		if (this.traceMode) CUtil.trace("CEFStartScene Enter Scene Behavior: CEFRampScene0");
	}		

	// Direction can be - "NEXT" , "BACK" , "GOTO"
	// 
	public preExitScene(Direction:string, sceneCurr:number ) : string
	{
		if(this.traceMode) CUtil.trace("CEFStartScene Pre-Exit Scene Behavior:");

		CEFRoot.gTutor.showReplay(false);
		CEFRoot.gTutor.showPPlay(true);
		
		return("OK");
	}

//****** Navigation Behaviors
	
//****** Overridable Behaviors

	
}
