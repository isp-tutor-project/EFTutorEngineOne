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



namespace TutorEngineOne {

//** Imports

import TextField = createjs.Text;



/**
 * ...
 * 
 * ## Mod Apr 15 2014 - rebased from CEFScene - was CEFObject 
 */
export class CEFTitleBar extends CEFScene
{
	//************ Stage Symbols
	
	public Stitle:TextField;
	public Spage:TextField;
	
	public Spause:CEFButton;		
	public Splay:CEFButton;
	public Sreplay:CEFButton;

	public Sskill:CEFSkilloMeter;
	public Sprediction:CEFSkilloMeter;
	
	//** Static Assets
	
	public SdemoButton:CEFObject;

	//************ Stage Symbols
	
	//*************** Navigator 

	public static prntTutor:Object;			// The parent CEFTutorRoot of these transitions
			
	private _demoInhibit:boolean = false;
	private _demoClicked:boolean = false;
	
	
	public CEFTitleBar():void
	{
		if (this.traceMode) CUtil.trace("CEFTitleBar:Constructor");	
		
		try
		{
			this.Splay.addEventListener(CEFMouseEvent.WOZCLICK, this.onTutorPlay);
			this.Spause.addEventListener(CEFMouseEvent.WOZCLICK, this.onTutorPause);
			this.Sreplay.addEventListener(CEFMouseEvent.WOZCLICK, this.onTutorReplay);
			
			// Hide the play button to start with
			
			this.Splay.visible = false;			
						
			//Sprediction.title = "prediction";			
			this.Sskill.visible = CEFRoot.fSkillometer;
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

	
	public configDemoButton(_Tutor:CEFTutorRoot):void
	{
		
		if(CEFRoot.fDemo)
		{
			if(this.traceMode) CUtil.trace("Title in Demo Mode");
			
			this.SdemoButton.addEventListener(CEFMouseEvent.WOZCLICKED, this.doDemoClick);
			_Tutor.addEventListener("deferedDemoCheck", this.doDeferedDemoClick);
		}
		else
		{
			this.SdemoButton.visible = false;
			
			this.addEventListener(CEFMouseEvent.WOZCLICKED, this.doTitleClick);
		}
		
	}
	
//*****************State Capture *************************		
	
	public doTitleClick(evt:CEFMouseEvent)
	{
		if(this.traceMode) CUtil.trace("TitleClick");
		
		//System.setClipboard(gSceneConfig.state.toXMLString());
	}
	
//*****************State Capture *************************		
	
	
//***************** Demo Stuff *************************		
	
	private doDemoClick(evt:CEFMouseEvent)
	{
		// If currently in a scene transition CEFRoot.fDeferDemoClick is true
		// when new scene OnEnter is complete - doDeferedDemoClick completes the demo click
		
		if(CEFRoot.fDeferDemoClick)
			this._demoClicked = true;
		else
			CEFRoot.gTutor.goToScene(new CEFNavEvent(CEFNavEvent.WOZNAVTO, "SdemoScene"));
	}

	private doDeferedDemoClick(evt:Event)
	{		
		CEFRoot.fDeferDemoClick = false;
		
		if(this._demoClicked)
		{
			this._demoClicked = false;
		
			CEFRoot.gTutor.goToScene(new CEFNavEvent(CEFNavEvent.WOZNAVTO, "SdemoScene"));
		}
	}
	
//***************** Demo Stuff *************************		

	
//***************** Pause Play Support *******************************		

	public onTutorPlay(evt:CEFMouseEvent) : void
	{
		if(this.traceMode) CUtil.trace("onTutorPlay: " );
		
		CEFRoot.gTutor.wozPlay();
		
		this.Splay.visible  = false;
		this.Spause.visible = true;
	}	

	public onTutorPause(evt:CEFMouseEvent) : void
	{
		if (this.traceMode) CUtil.trace("onTutorPause: " );
		
		CEFRoot.gTutor.wozPause();
		
		this.Spause.visible = false;
		this.Splay.visible  = true;
	}	
	
	public onTutorReplay(evt:CEFMouseEvent) : void
	{
		if (this.traceMode) CUtil.trace("onTutorReplay: " );
		
		CEFRoot.gTutor.wozReplay();
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
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject)
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
			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject)
			{
				if(this.traceMode) CUtil.trace("\tCEF***");
				
				TutScene[sceneObj].instance.dumpSubObjs(TutScene[sceneObj], "\t");										
			}					
		}		
	}

//***************** Debug *******************************		

}
}

