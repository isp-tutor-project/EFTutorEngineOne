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
//  File:      CEFSceneN.as
//                                                                        
//  Purpose:   CEFSceneN object implementation
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

import { CEFRoot } 			from "../core/CEFRoot";
import { CEFButton } 		from "../core/CEFButton";
import { CEFSceneSequence } from "../core/CEFSceneSequence";
import { CEFEvent } 		from "../events/CEFEvent";
import { CEFMouseEvent } 	from "../events/CEFMouseEvent";
import { CUtil } 			from "../util/CUtil";


import MovieClip     	  = createjs.MovieClip;
import Point     		  = createjs.Point;
import Tween     		  = createjs.Tween;


export class CEFSceneN extends CEFSceneSequence
{
	//************ Stage Symbols
	
	public SreplaySession:CEFButton;
	
	// non-interactive elements
	
	public SbackGround:MovieClip;		

	//************ Stage Symbols
	
	public CEFSceneN():void
	{
		CUtil.trace("CEFSceneN:Constructor");
		
		this.SreplaySession.addEventListener(CEFMouseEvent.WOZCLICK, this.doReplay);
	}

	public doReplay(evt:CEFEvent) : void
	{			
		// relay the entire tutor interaction
		//
		CEFRoot.gTutor.replayLiveStream();			
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
				
}
