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
//  File:      CLogQueue.as
//                                                                        
//  Purpose:   CLogQueue object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Jun 23 2008
//			 Nov 07 2011 - Modularized Queue logic from Socket logic - Through LogManager	
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


//** imports

import { CLogEvent } 		from "../events/CLogEvent";
import { CLogManagerType } 	from "../managers/CLogManagerType";

import { CUtil } 			from "../util/CUtil";

import EventDispatcher = createjs.EventDispatcher;


export class CLogQueue extends EventDispatcher
{
	protected traceMode:boolean = true;
	protected logTrace:boolean  = false;

	private logEvtIndex:number = -1;					// Whats available to be logged
	private logAckIndex:number = -1;					// Whats been acknowledged by logger
			
	private logEvents:any;	   									// XML Event stream
	private jsonEvents:Array<Object> = new Array<Object>();		// JSON Event stream
	
	// Playback counters
	
	private LogSource:string;						// Playback can come from either Recorded Events (cached playback) or and XML object (Logged playback) 
	private xmlEvents:any;						// XML Object holding a recording to be played back
	
	private lastAction:number;							//@@Legacy playback
	private lastMove:number;							//@@Legacy playback
	
	private fPlayBackDone:boolean;					// set when playBackNdx reaches playBackSiz
	private playBackNdx:number;						// replay progress counter
	private playBackSiz:number;						// size of the current playback object
	
	// logging flag and bitmapped constants
	
	private _queueOpen:boolean = false;				// Whether queue acepts data
	private _queueStreaming:boolean = false;		// Whether data is streaming over the wire
	
	private _queueMode:string = CLogManagerType.MODE_JSON;
	
	public static readonly RECLOGNONE:number    = 0;			// Disable all recording
	public static readonly RECORDEVENTS:number  = 1;			// Record Events
	public static readonly LOGEVENTS:number     = 2;			// Log Events to Server
	public static readonly REClogEvents:number  = 3;			// Record and Log all events

	
	
	public CLogQueue():void
	{
		this.traceMode = false;
		
		if(this.traceMode) CUtil.trace("CLogQueue:Constructor");
		
		this.resetQueue();
	}

	
//**********************************************************		
//*** Queue state Management
	

	public get queueMode() : string
	{
		return this._queueMode;
	}
	
	public get isStreaming() : boolean
	{
		return this._queueStreaming;
	}
	
	public get length() :number
	{
		return this.logEvtIndex;
	}
	
	public get Position() :number 
	{
		return this.logAckIndex;			
	}			
	
	/**
	 *  Open the Queue to accept new data
	 */
	public openQueue() : void
	{
		this._queueOpen = true;
		
		if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_OPENED));
	}		
	
	
	/**
	 * Close the queue to new entries - existing data will be flushed when streaming 
	 * 
	 */
	public closeQueue() : void
	{
		this._queueOpen = false;
		
		if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_CLOSED));
	}
			
	
	public startQueueStream() : void
	{
		this._queueStreaming = true;

		// Send this to kick start the stream if there is any data
		
		if(this.hasEventListener(CLogEvent.QUEUE_CHANGED))
			this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_CHANGED));
		
		// General informational message
		
		if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.STREAM_OPENED));
	}		
	
	
	/**
	 * Close the queue to new entries - existing data will be flushed 
	 * 
	 */
	public stopQueueStream() : void
	{
		this._queueStreaming = false;
		
		// General informational message
		
		if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.STREAM_CLOSED));
	}
	

	public resetQueue() : void
	{
		// Reset Queue

		this.logEvtIndex = -1;	
		this.logAckIndex = -1;			
					
		this.playBackSiz = 0;								// size of the current playback object			

		this.logEvents   = "<eventlog/>";				   	// Loggable events
		this.jsonEvents  = new Array<Object>();				//
		
		// Reset Playback 
		
		this.LogSource = "";								// Playback can come from either Recorded Events (cached playback) or and XML object (Logged playback) 
		this.xmlEvents = null;								// XML Object holding a recording to be played back
		
		this.lastAction    = -1;							//@@Legacy playback
		this.lastMove      = -1;							//@@Legacy playback
		
		this.fPlayBackDone = false;							// set when this.playBackNdx reaches this.playBackSiz
		this.playBackNdx   = -1;							// replay progress counter
		this.playBackSiz   = -1;							// size of the current playback object
		
		if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_RESET));
	}		
	
	
	public restartQueue() : void
	{
		// Resend everything
		//
		this.logAckIndex = -1;
		
		if(this.hasEventListener(CLogEvent.QUEUE_CHANGED))
			this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_CHANGED));
	}
	
			
	public isQueueEmpty() : boolean 
	{			
		let fEmpty:boolean;
		
		// Flush the log as required
		//
		if(this.logAckIndex != this.logEvtIndex)
			fEmpty = false;			  
		else
			fEmpty = true;
		
		return fEmpty;
	}
	
	
	/**
	 * Return the next packet to be sent
	 *  
	 * @return 
	 * 
	 */
	public nextPacket() : any
	{
		if(this._queueMode == CLogManagerType.MODE_JSON)
			return this.jsonEvents[this.logAckIndex+1];
		else
			return this.logEvents.children()[this.logAckIndex+1];			
	}
	
	
	/**
	 * Return the Index of the next packet to be sent
	 *  
	 * @return 
	 * 
	 */
	public get nextNdx() :number
	{
		return this.logEvtIndex+1;			
	}
	
	
//*** Queue state Management
//**********************************************************		

//**********************************************************		
//*** Queue data Management
	
	/**
	 * Add the event to the XML recording and send to server if requested.
	 * 
	 * Note that all protocol packets get lumped into the recording buffer.
	 * So if you want to resend a specific protocol you would have to create a 
	 * filter to only send those packets.
	 * 
	 */
	public logEvent(dataEvt:any ) : void
	{			
		// After the log is closed it will not accept anymore events
		
		if(this._queueOpen)
		{
			// increment the log index in either case
			
			this.logEvtIndex++;			
			
			// If Queueing - Enqueue the event
			
			if(this._queueMode == CLogManagerType.MODE_JSON)
				this.jsonEvents.push(dataEvt);
			else
				this.logEvents.appendChild(dataEvt);

			// Emit progress message when we add as well as when we remove from the queue
			// This allows progress updates when the stream is stalled due to connection 
			// problems.
			
			this.emitProgress();		
			
			// If Logging - emit change event so LogManager can restart stream if required
			
			if(this._queueStreaming)
			{
				if(this.hasEventListener(CLogEvent.QUEUE_CHANGED))
					this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_CHANGED));
			}
		}
	}			

	
	/**
	 * Check if ack'd packet is for the sent packet
	 * If so move to the next packet  
	 * 
	 * @param seqID
	 * @return boolean - packet acknowledged in sequence 
	 * 
	 */
	public ackPacket(seqID:number, reSend:boolean = false ) : boolean
	{
		let fResult:boolean = false;
		
		// If the last packet was correct then we send the next one
		//
		if(seqID == this.logAckIndex+1)
		{
			if(this.traceMode) CUtil.trace("@@@@@@@  PACKET ACK: " + (this.logAckIndex+1));	
							
			// this.logAckIndex reflects the last packet successfully sent
			
			if(!reSend)
			{
				this.logAckIndex++;
				
				this.emitProgress();					
			}
			fResult = true;
		}
		
		return fResult;
	}		
	
	/**
	 *  public so we can query the queue for its status
	*/
	public emitProgress() : void
	{
		if(this.hasEventListener(CLogEvent.PROG_MSG))			
			this.dispatchEvent(new CLogEvent(CLogEvent.PROG_MSG, null, this.logAckIndex, this.logEvtIndex));			
	}
	
			
//*** Queue data Management
//**********************************************************		
	
	
//************************************************************************		
//************************** PLAYBACK SUPPORT		
	
	
	// Set where the playback data comes from
	//
	public setPlayBackSource(LogSource:any ) : void
	{
		// null this.LogSource plays back from the live log
		// note: the live log is wrapped in a TutorShop clientmessage wrapper
		
		if(this.LogSource == null)
		{
			this.LogSource   = "logCache";
			this.xmlEvents   = this.logEvents.clientmessage;
			this.playBackSiz = this.logEvtIndex;
		}
		else
		{
			this.LogSource   = "xmlSource";
			this.xmlEvents   = this.LogSource;
			this.playBackSiz = this.LogSource.length;
			
			if(this.logTrace) CUtil.trace("this.playBackSiz: " + this.playBackSiz);
		}			
		
		// Init playback counters
		//
		this.fPlayBackDone		 = false;
		this.playBackNdx          = 0;
//			CWOZDoc.gApp.frameID = 0;
//			CWOZDoc.gApp.stateID = 0;

		//@@ init legacy playback counters
		
		this.lastAction = -1;
		this.lastMove   = 0;			
	}
			
	
	/**
	*  Remove the <clientmessage> wrapper from the log
	* 
	*/
	public unWrapLog() : any
	{
		let unWrapped:any = "<unwrapped/>";
		
		for(let i1:number = 0 ; i1 < this.logEvtIndex ; i1++)
		{
			unWrapped.appendChild(this.logEvents.children()[i1].logrecord[0]);
		}
		
		return unWrapped.children();
	}
	
	
	/**
	*  Preprocess the source recording to normalize the times 
	*  Note: Legacy playback normalization
	*
	*/
	public normalizePlayBackTime() : void
	{
		let nBaseTime:number;
		let nEvent:number;
		
		nBaseTime = this.xmlEvents[0].time;
		
		// If the recording has not already been normalized then process it
		//
		if(nBaseTime != 0)
		{			
			for(nEvent = 0 ; nEvent < this.playBackSiz ; nEvent++)
			{		
				this.xmlEvents[nEvent].time -= nBaseTime;
				this.xmlEvents[nEvent].time *= 1000;
			}
		}
	}

	
	/**
	*  Preprocess the source recording to normalize the times 
	*
	*/
	public normalizePlayBack() : void
	{
		let xmlEvent:any;
		let nBaseTime:number;
		let nBaseState:number;
		let nBaseFrame:number;
		let nEvent:number;
		
		// This is playing a event inside a TutorShop wrapper
		
		xmlEvent = this.xmlEvents[0];					// for live log use - this.logEvents.children().logrecord[0]
		
		nBaseTime  = xmlEvent.time;
		nBaseState = xmlEvent.stateID;
		nBaseFrame = xmlEvent.frameID;
		
		// If the recording has not already been normalized then process it

		if(nBaseTime != 0)
		{			
			for(nEvent = 0 ; nEvent < this.playBackSiz ; nEvent++)
			{		
				xmlEvent = this.xmlEvents[nEvent];		// for live log use - this.logEvents.children()[nEvent].logrecord[0]
				
				xmlEvent.time    -= nBaseTime;
				xmlEvent.stateID -= nBaseState;
				xmlEvent.frameID -= nBaseFrame;					
			}
		}
	}
	
	
	/**
	*  return the state associated with the next event to be fired
	*
	*/
	public getNextEventState() :number
	{	
		let xmlEvent:any;
		
		xmlEvent = this.xmlEvents[this.playBackNdx]; 			// this.logEvents.children()[this.playBackNdx].logrecord[0];
		
		return xmlEvent.stateID;
	}
	
	
	/**
	*  return the next event between lastEvent and the new Frame Time. 
	*
	*/
	public getNextEvent(stateID:number, frameID:number) : any
	{
		let xmlEvent:any;
		let xResult:any = null;
		
		if(this.logTrace) CUtil.trace("getEvent for State: " + stateID + " : Frame : " + frameID);
		
		for( ; this.playBackNdx < this.playBackSiz ; this.playBackNdx++)
		{			
			xmlEvent = this.xmlEvents[this.playBackNdx]; 			// this.logEvents.children()[this.playBackNdx].logrecord[0];
			
			// We only return WOZEvents
			//
			if(xmlEvent.type != "WOZevent")
										continue;

			// If the state of the interface gets ahead - fire events until we catch up
			// otherwise just fire all the events for the current frame
			//
			// note: States are unordered (i.e. not unique) therefore a specific state
			//       in the playback may not be identical to one in the live version.
			//
			if(xmlEvent.frameID == frameID)
			{
				// parse mouse events
				
				if(xmlEvent.CWOZMouseEvent != undefined)
				{
					xResult = xmlEvent;
					this.playBackNdx++;
					break;
				}
				
				// parse keyboard events
				
				else if(xmlEvent.CWOZTextEvent != undefined)
				{
					xResult = xmlEvent;
					this.playBackNdx++;
					break;
				}
			}
			
			// otherwise wait until the frame catches up
			
			else break;
		}
					
		// Set flag if we reach the end of the log

		if(this.playBackNdx >= this.playBackSiz)
						this.fPlayBackDone = true;								

		return xResult;
	}


	/**
	*  Query if playback is finished
	*
	*/
	public playBackDone() : boolean
	{
		return this.fPlayBackDone;
	}

			
//@@@@@@@@@@@@@@@@@@@ Legacy Playback
	
	/**
	*  return the next action event between this.lastAction and the new Frame Time. 
	*
	*/
	public getActionEvent(frameTime:number) : any
	{
		let xResult:any = null;
		let nAction:number;
		
		if(this.logTrace) CUtil.trace("getActionEvent: " + frameTime);
		
		for(nAction = this.lastAction + 1 ; nAction < this.playBackSiz ; nAction++)
		{			
			// We only return WOZEvents
			//
			if(this.xmlEvents[nAction].type != "WOZevent")
												continue;
		
			else if(this.xmlEvents[nAction].CWOZMouseEvent != undefined)
			{
				if(this.xmlEvents[nAction].time <= frameTime)
				{
					if(this.xmlEvents[nAction].CWOZMouseEvent.CWOZEvent.type != "WOZMOUSE_MOVE")
					{								
						xResult = this.xmlEvents[nAction];
						break;
					}
					}
					else break;
			}
			else if(this.xmlEvents[nAction].CWOZTextEvent != undefined)
			{
				if(this.xmlEvents[nAction].time <= frameTime)
				{
					xResult = this.xmlEvents[nAction];
					break;
					}
					else break;
			}
		}
		
		// if either the move or actions are finished then we are done.
		//
		if(nAction >= this.playBackSiz)
						this.fPlayBackDone = true;								

		// Track last action done
		if(xResult != null)
			this.lastAction = nAction;
						
		return xResult;
	}
	
	/**
	 * Support for aborting playback
	 */
	public setPlayBackDone(val:boolean) : void
	{
		this.fPlayBackDone = val;	
	}
	
	
	/**
	*  Find the first Playback move event at or beyond the current frame time
	*
	*  This is used to interpolate the Playback position at Frame Time
	*/
	public getMoveEvent(frameTime:number) : any
	{
		let xResult:any = null;
		let nMove:number;
		
		for(nMove = this.lastMove ; nMove < this.playBackSiz ; nMove++)
		{			
			// We only return WOZEvents
			//
			if(this.xmlEvents[nMove].type != "WOZevent")
												continue;
		
			if(this.xmlEvents[nMove].time >= frameTime)
			{
				if(this.xmlEvents[nMove].CWOZMouseEvent.CWOZEvent.type == "WOZMOUSE_MOVE")
				{								
					xResult = this.xmlEvents[nMove];
					break;
				}
			}
		}
		
		// if either the move or actions are finished then we are done.
		//
		if(nMove >= this.playBackSiz)
						this.fPlayBackDone = true;								
		
		// Track last move done
		this.lastMove = nMove;
		
		return xResult;
	}
	
//@@@@@@@@@@@@@@@@@@@ Legacy Playback		
	
//************************** PLAYBACK				
//************************************************************************		

	
//***************** Logging API *******************************		

}
