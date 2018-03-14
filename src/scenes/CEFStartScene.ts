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
//  File:      CWOZStartScene.as
//                                                                        
//  Purpose:   CWOZStartScene object implementation
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


package cmu.woz.scenes
{
	import cmu.woz.*;
	
	import flash.display.*;
	import flash.events.*;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.text.*;

	public class CWOZStartScene extends CWOZSceneSequence
	{
		//************ Stage Symbols
		
		// non-interactive elements
		
		public var Sstart:TextField;	
		public var Sicon:MovieClip;
		
		//************ Stage Symbols
				
		public function CWOZStartScene():void
		{
			traceMode = false;
			
			if(traceMode) trace("CWOZStartScene:Constructor");
			
			// No pacing here
			fComplete = true;
		}

		// Walk the WOZ Objects to capture their default state
		//
		override public function captureDefState(TutScene:Object ) : void 
		{
			super.captureDefState(TutScene );
		}
		
		
		// Walk the WOZ Objects to restore their default state
		//
		override public function restoreDefState(TutScene:Object ) : void 
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
		override public function preEnterScene(lTutor:Object, sceneLabel:string, sceneTitle:string, scenePage:string, Direction:string ) : string
		{
			if(traceMode) trace("CWOZStartScene Pre-Enter Scene Behavior: " + sceneTitle);		
			
			gTutor.showReplay(false);			
			gTutor.showPPlay(false);			
						
			return super.preEnterScene(lTutor, sceneLabel, sceneTitle, scenePage, Direction );
		}

		/**
		 * Disable the default behavior - no Play / Pause
		 * @param	Direction
		 */
		override public function onEnterScene(Direction:string) : void
		{				
			if (traceMode) trace("CWOZStartScene Enter Scene Behavior: CWOZRampScene0");
		}		

		// Direction can be - "NEXT" , "BACK" , "GOTO"
		// 
		override public function preExitScene(Direction:string, sceneCurr:int ) : string
		{
			if(traceMode) trace("CWOZStartScene Pre-Exit Scene Behavior:");

			gTutor.showReplay(false);
			gTutor.showPPlay(true);
			
			return("OK");
		}

//****** Navigation Behaviors
		
//****** Overridable Behaviors

		
	}

}