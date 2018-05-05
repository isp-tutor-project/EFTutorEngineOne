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

import { TRoot } 			from "./TRoot";
import { TObject } 			from "./TObject";
import { TSceneBase } 			from "./TSceneBase";
import { TButton } 			from "./TButton";

import { TTutorContainer } 	from "../thermite/TTutorContainer";

import { TMouseEvent } 		from "../events/CEFMouseEvent";
import { CEFNavEvent } 		from "../events/CEFNavEvent";
import { CEFSkilloMeter } 	from "../controls/CEFSkilloMeter";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import TextField = createjs.Text;




/**
 * ...
 * 
 * ## Mod Apr 15 2014 - rebased from CEFScene - was CEFObject 
 */
export class TTitleBar extends TSceneBase
{
	//************ Stage Symbols
	
	public Stitle:TextField;
	public Spage:TextField;
	
	public Spause:TButton;		
	public Splay:TButton;
	public Sreplay:TButton;

	public Sskill:CEFSkilloMeter;
	public Sprediction:CEFSkilloMeter;
	
	//** Static Assets
	
	public SdemoButton:TObject;

	//************ Stage Symbols
	
	//*************** Navigator 

	public static prntTutor:Object;			// The parent CEFTutorContainer of these transitions
			
	private _demoInhibit:boolean = false;
	private _demoClicked:boolean = false;
	
	
	public CEFTitleBar():void
	{
		if (this.traceMode) CUtil.trace("CEFTitleBar:Constructor");	
		
		try
		{
			this.Splay.addEventListener(TMouseEvent.WOZCLICK, this.onTutorPlay);
			this.Spause.addEventListener(TMouseEvent.WOZCLICK, this.onTutorPause);
			this.Sreplay.addEventListener(TMouseEvent.WOZCLICK, this.onTutorReplay);
			
			// Hide the play button to start with
			
			this.Splay.visible = false;			
						
			//Sprediction.title = "prediction";			
			this.Sskill.visible = this.tutorDoc.fSkillometer;
			this.Sskill.title   = "skills";
			
			this.Sskill.updateName(1, "rule0");
			this.Sskill.updateName(2, "rule1");
			this.Sskill.updateName(3, "rule2");
			this.Sskill.updateName(4, "rule_vvfar");
			this.Sskill.updateName(5, "rule_tov");
			this.Sskill.updateName(6, "rule_cvslog");
		}
		catch(err)
		{	
			// Not all Title bars have all controls
		}
	
	}

	
	public configDemoButton(_Tutor:TTutorContainer):void
	{
		
		if(this.tutorDoc.fDemo)
		{
			if(this.traceMode) CUtil.trace("Title in Demo Mode");
			
			this.SdemoButton.addEventListener(TMouseEvent.WOZCLICKED, this.doDemoClick);
			_Tutor.addEventListener("deferedDemoCheck", this.doDeferedDemoClick);
		}
		else
		{
			this.SdemoButton.visible = false;
			
			this.addEventListener(TMouseEvent.WOZCLICKED, this.doTitleClick);
		}
		
	}
	
//*****************State Capture *************************		
	
	public doTitleClick(evt:TMouseEvent)
	{
		if(this.traceMode) CUtil.trace("TitleClick");
		
		//System.setClipboard(gSceneConfig.state.toXMLString());
	}
	
//*****************State Capture *************************		
	
	
//***************** Demo Stuff *************************		
	
	private doDemoClick(evt:TMouseEvent)
	{
		// If currently in a scene transition this.tutorDoc.fDeferDemoClick is true
		// when new scene OnEnter is complete - doDeferedDemoClick completes the demo click
		
		if(this.tutorDoc.fDeferDemoClick)
			this._demoClicked = true;
		else
			this.tutorDoc.tutorContainer.goToScene(new CEFNavEvent(CEFNavEvent.WOZNAVTO, "SdemoScene"));
	}

	private doDeferedDemoClick(evt:Event)
	{		
		this.tutorDoc.fDeferDemoClick = false;
		
		if(this._demoClicked)
		{
			this._demoClicked = false;
		
			this.tutorDoc.tutorContainer.goToScene(new CEFNavEvent(CEFNavEvent.WOZNAVTO, "SdemoScene"));
		}
	}
	
//***************** Demo Stuff *************************		

	
//***************** Pause Play Support *******************************		

	public onTutorPlay(evt:TMouseEvent) : void
	{
		if(this.traceMode) CUtil.trace("onTutorPlay: " );
		
		this.tutorDoc.tutorContainer.wozPlay();
		
		this.Splay.visible  = false;
		this.Spause.visible = true;
	}	

	public onTutorPause(evt:TMouseEvent) : void
	{
		if (this.traceMode) CUtil.trace("onTutorPause: " );
		
		this.tutorDoc.tutorContainer.wozPause();
		
		this.Spause.visible = false;
		this.Splay.visible  = true;
	}	
	
	public onTutorReplay(evt:TMouseEvent) : void
	{
		if (this.traceMode) CUtil.trace("onTutorReplay: " );
		
		this.tutorDoc.tutorContainer.wozReplay();
	}	
	
	
//***************** Pause Play Support *******************************		

//***************** Automation *******************************		

	// Walk the WOZ Objects to initialize their automation mode
	//
	public setObjMode(TutScene:any, sMode:string) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Walking Top Level Nav Objects***");

		for(let sceneObj in TutScene)
		{			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof TObject)
			{
				TutScene[sceneObj].instance.setAutomationMode(TutScene[sceneObj], sMode );										
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End - Walking Top Level Nav Objects***");
	}
	
//***************** Automation *******************************		
	
	
//***************** Debug *******************************		
		
	public dumpSceneObjs(TutScene:any) : void
	{							
		for(let sceneObj in TutScene)
		{
			if(this.traceMode) CUtil.trace("\tNavPanelObj : " + sceneObj);
			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("\tCEF***");
				
				TutScene[sceneObj].instance.dumpSubObjs(TutScene[sceneObj], "\t");										
			}					
		}		
	}

//***************** Debug *******************************		

}

