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

import { CEFRoot } 			from "../../core/CEFRoot";
import { CEFSceneSequence } from "../../core/CEFSceneSequence";

import { CTutorState }      from "../../util/CTutorState";
import { CONST }            from "../../util/CONST";
import { CUtil } 			from "../../util/CUtil";

import MovieClip = createjs.MovieClip;
import TextField = createjs.Text;



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
		
		CTutorState.gTutor.showReplay(false);			
		CTutorState.gTutor.showPPlay(false);			
					
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

		CTutorState.gTutor.showReplay(false);
		CTutorState.gTutor.showPPlay(true);
		
		return("OK");
	}

//****** Navigation Behaviors
	
//****** Overridable Behaviors

	
}
