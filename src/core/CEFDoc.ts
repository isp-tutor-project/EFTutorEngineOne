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



export class CEFDoc extends CEFRoot
{				
	//************ Stage Symbols
	
	public Stutor:CEFTutorRoot;			// every WOZObject must be associated with a specific tutor
	
	//************ Stage Symbols
	
	public static tutorAutoObj:any;		// The tutor object hierarchy
	public static gApp:CEFDoc;
	
	public static designWidth:number = 1024;
	public static designHeight:number = 768;
	
	// These are used for log playback
	//
	// The frameID is the actual frame in which a log entry occured
	// The stateID is the Tutor state when a log entry occured
	//
	// During capture:
	//	the frameID runs at the selected frame rate for the tutor
	// 	the stateID records changes in the tutor state as it progresses.
	//
	// During playback:
	//  the tutor runs frame by frame playing back events as they originally occured from the event stream
	//  Note: It is possible for the stateID and frameID to lose sync with the recorded stream should events 
	//        process faster or slower than on the original machine.
	//	Therefore at each frame:
	//		Check the next event in the log
	// 				if the Tutor stateID matches the playback stateID then
	//					if the Tutor frameID matches the playback frameID fire the event 
	//					if the Tutor frameID < playback frameID - wait for the playback tutor to reach the event
	//					if the Tutor frameID > playback frameID - sequentially fire events (playback is running slow)
	//
	// 				if the Tutor stateID > playback stateID then
	//					flush all queued events until sync achieved
	//
	// 				if the Tutor stateID < playback stateID then (may freeze if state transitions do not occur)
	//					wait for the tutor to fire non-event state transitions				
	//					
	
	public logFrameID = 0;
	public logStateID = 0;
	
	constructor()
	{
		super();

		CUtil.trace("CEFDoc:Constructor");

		// First get the Root Tutor movie object - this encapsulates all the scenes and navigation features
		//
		CEFDoc.gApp = this;			
	}

	
	public initOnStage(evt:Event):void
	{
		CUtil.trace("CEFDoc:Object OnStage");
		
		// Frame counter - for logging
		// NOTE: this must be the first ENTER_FRAME event listener 
		
		this.connectFrameCounter(true);		
		
		// CEFRoot.STAGEWIDTH  = this.stage.canvas["width"];		//** TODO */
		// CEFRoot.STAGEHEIGHT = this.stage.canvas["height"];
	}
	

	public launchTutors(): void
	{			
		// reset the frame and state IDs
		
		this.resetStateFrameID();
		
		// force the tutor to start - use null target object ID
		if(CEFRoot.sessionAccount["session"].profile.progress == CMongo._INPROGRESS)
		{
			CEFDoc.tutorAutoObj["SnavPanel"].instance.recoverState();
		}
		else
		{
			CEFDoc.tutorAutoObj["SnavPanel"].instance.gotoNextScene();
		}
	}
	
			
//***************** Automation *******************************		

	/**
	 * reset the log counters
	 */
	public resetStateFrameID() : void 
	{
		this.frameID = 0;
		this.stateID = 0;
	}	

	public get frameID() : number 
	{
		return this.logFrameID;
	}
	
	public set frameID(newVal:number) 
	{
		this.logFrameID = newVal;
	}
	
	public incFrameID() : void 
	{
		this.logFrameID++;
	}
	
	public get stateID() : number 
	{
		return this.logStateID;
	}
	
	public set stateID(newVal:number) 
	{
		this.logStateID = newVal;
	}
	
	/**
	 * Increment the interface stateID and reset the frameID - frameID's are relative to state changes
	 * this is to make any events occur proportionally in time relative to associated state changes.
	 */
	public incStateID() : void 
	{
		if(this.traceMode) CUtil.trace("@@@@@@@@@ logStateID Update : " + this.logStateID);
		
		this.logStateID++;
		this.frameID = 0;
	}
	
	/**
	 * connect or disconnect the log frame counter.
	 * @param	fCon
	 */
	public connectFrameCounter(fCon:boolean)
	{
		if (fCon)
			addEventListener(CEFEvent.ENTER_FRAME, this.doEnterFrame);											
		else
			removeEventListener(CEFEvent.ENTER_FRAME, this.doEnterFrame);								
	}


	/**
	 * maintain the tutor frame counter used for logging
	 * 
	 * @param	evt
	 */
	private doEnterFrame(evt:Event)
	{
		this.incFrameID();
	}
	
	
//***************** Automation *******************************		
	
	
//***************** Debug *******************************		
		
	protected dumpTutors() : void
	{
		if(this.traceMode) CUtil.trace("\n*** Start root dump ALL tutors ***");
		
		for(let tutor of CEFDoc.tutorAutoObj)
		{
			if(this.traceMode) CUtil.trace("TUTOR : " + tutor);
		
			if(CEFDoc.tutorAutoObj[tutor].instance instanceof CEFTutorRoot) 
			{
				if(this.traceMode) CUtil.trace("CEF***");
				
				CEFDoc.tutorAutoObj[tutor].instance.dumpScenes(CEFDoc.tutorAutoObj[tutor]);
			}				
		}			
		
		if(this.traceMode) CUtil.trace("*** End root dump tutor structure ***");			
	}

//***************** Debug *******************************		

}
}

