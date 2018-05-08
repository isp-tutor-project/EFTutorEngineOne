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

import { ILogManager } 		from "./ILogManager";
import { CLogManagerType } 	from "./CLogManagerType";

import { CEFTimer } 		from "../core/CEFTimer";

import { CMongo } 			from "../mongo/CMongo";
import { CObject } 			from "../mongo/CObject";

import { CSocket } 			from "../network/CSocket";
import { CLogSocket } 		from "../network/CLogSocket";
import { CLogQueue } 		from "../network/CLogQueue";
import { CDDnsLoader } 		from "../network/CDDnsLoader";

import { CLogEvent } 		from "../events/CLogEvent";
import { CTimerEvent } 		from "../events/CTimerEvent";
import { CDataEvent } 		from "../events/CDataEvent";
import { CDnsEvent } 		from "../events/CDnsEvent";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import EventDispatcher = createjs.EventDispatcher;



/**
 * Use CLogManager to manage a TED server connection and associated 
 * log queue. It will automatically reattach when a connection is lost 
 * and then resends all the data in the queue. 
 * 
 * @author Kevin Willows
 * 
 */
export class CLogManager extends EventDispatcher implements ILogManager
{
	private traceMode:boolean  = true;
	private fdebugMode:boolean = false;
	
	private dnsLoader:CDDnsLoader;
	private logSocket:CLogSocket;

	private JSONEvents:any;
	
	private _logHostAddress:string;					// Result of DNS lookup
	private _logHostPort:number;					// *
	private _forcedAddress:string = "";
	
	private _DataStreaming:boolean  = false;
	private _QueStreaming:boolean  	= false;
														// Log Waiting indicates that there is not a data network transfer in progress
	private _logWaiting:boolean     = true;			// Need this to be true for when we start initially
	
	private _sending:boolean   		= false;		// Debug flag
	private _authenticating:boolean = false;

	private _fReconnect:boolean 	= false; 		// indicates when a socket retry is underway
	
	private _isConnecting:boolean 	= false;
	private _isConnected:boolean 	= false; 		// indicates when a socket is connected

	private _sessionActive:boolean  = false;		// indicates the session is over and the logQueue should closed and flushed to the server
	private _sessionID:string		= "";			// server session id - used for reconnect to log files
	private _sessionTime:number;

	private _sessionStatus:string 	= CONST.SESSION_START;
	private _sessionAccount:any;
			
	private logEventTimer:CEFTimer = new CEFTimer(60);			// queue packets on every tick
	private logTimeout:CEFTimer    = new CEFTimer(10000, 1);	// use a 40sec time out on responses from TED service
	
	private  _useQueue:boolean 	= true;

	// Session management 
	
	public  _fTutorPart:string = "test";				// Goes in to the  header to indicate the portion of the tutor the file represents
					
	// development trace
	
	public 	tracer:object;

	// Logging parameters
	
	private _fLogging:number;

	// Playback counters
	
	private LogSource:string;							// Playback can come from either Recorded Events (cached playback) or and object (Logged playback) 
	
	private lastAction:number;							//@@Legacy playback
	private lastMove:number;							//@@Legacy playback
	
	private fPlayBackDone:boolean;						// set when playBackNdx reaches playBackSiz
	private playBackNdx:number;							// replay progress counter
	private playBackSiz:number;							// size of the current playback object

	// Singleton implementation
	
	private static _instance:CLogManager;	
	private static _logQueue:CLogQueue;
	

	
	
	/**
	 * constructor has an optional tracearea object that is used for
	 * development purposed only
	 *  
	 * @param _StextArea
	 * 
	 */
	constructor(enforcer:SingletonObj) 
	{
		super();
		
		if(enforcer && enforcer instanceof SingletonObj) {
		
			// generate the queue associated with this manager
		
			CLogManager._logQueue = new CLogQueue();			
		
			// Listen to the Queue and pass on events
			CLogManager._logQueue.addEventListener(CLogEvent.PROG_MSG, this.progressListener);
		}
		else {
			throw(new Error("Invalid CLogManager Creation Request"));
		}
	}

	
	public static getInstance() : ILogManager
	{
	let result:CLogManager;
	
	if(CLogManager._instance == null)
		CLogManager._instance = new CLogManager(new SingletonObj());				
	
	return CLogManager._instance;
	}
	
	
	public useLocalHost() : void
	{
		this.fdebugMode = true;
	}
	
	
	private progressListener(e:CLogEvent) : void
	{
		if(this.hasEventListener(CLogEvent.PROG_MSG))			
									this.dispatchEvent(e);
	}
	
	public queryTheQueue() : void
	{
		CLogManager._logQueue.emitProgress();
	}
	
	
	public get fLogging() :number
	{
		return this._fLogging;
	}
	
	
	public set fLogging(newVal:number)
	{			
		this._fLogging = newVal;
		
		// record them locally
		
		//Alert.show("_flogging = " + this._fLogging.tostring(), "Notice");
		
		if(this._fLogging & CONST.RECORDEVENTS) CLogManager._logQueue.openQueue();
											else CLogManager._logQueue.closeQueue();
	}
			
	
	public set account(_account:object)
	{
		this._sessionAccount = _account;
	}
	
	public get fTutorPart() : string
	{
		return this._fTutorPart;
	}
	
	
	public set fTutorPart(newVal:string)
	{			
		this._fTutorPart = newVal;			
	}
	
	
	public setQueueStreamState(startQueue:boolean)
	{						
		// Send queued data to remote log 
		
		if(startQueue && (this._fLogging & CONST.LOGEVENTS))
		{
			this.startQueuedStream();
			
			CUtil.trace('Stream now Open');
		}
		else
		{
			this.stopQueuedStream();		
			
			CUtil.trace('Stream now Closed');
		}
	}

	public getQueueStreamState() : string
	{						
		let result:string;
		
		if(CLogManager._logQueue.isStreaming)
			result = CLogEvent.CONNECTION_OPEN;
		else 
			result = CLogEvent.CONNECTION_CLOSED;
		
		return result;
	}
	
	
	public getQueueState() : string
	{
		let result:string;
		
		// If the stream is open then send the next packet.
		
		if(this._QueStreaming)
		{
			// If there is anything buffered send it
			// Queue stream is kept flowing here -
			
			if(!CLogManager._logQueue.isQueueEmpty())
				result = CLogEvent.QUEUE_OPENED;
			else
				result = CLogEvent.QUEUE_WAITING;				
		}
		else
			result = CLogEvent.QUEUE_CLOSED;
		
		return result;
	}
	
//************************************************************************************		
///**** Interface
	
	/**
	 * 
	 */
	public connectProtocol(func:Function) : void
	{
		// Connect listeners from the socket
		
		// if(this.logSocket)
		// 	this.logSocket.addEventListener(CDataEvent.DATA,func);
	}
	
	
	/**
	 * 
	 */
	public disConnectProtocol(func:Function) : void
	{
		// Connect listeners from the socket			
		
		// if(this.logSocket)
		// 	this.logSocket.removeEventListener(CDataEvent.DATA,func);
	}
	
			
	/**
	 * Attach a tracer text control to the logmanager - for debug and tracing 
	 * 
	*/
	public attachTracer(_StextArea:object ) : void
	{
		this.tracer = _StextArea;					
	}
	
	
	public connectForInterface() : void
	{
		this.indirectConnectSocket();
	}
	
	
	public connectToAuthenticate() : void
	{
		if(!this._authenticating)
		{
			this._authenticating = true;	
			
			this.indirectConnectSocket();
		}			
	}

	
	// When the socket connects CAuthenticationManager:sessionManagementProtocol will manage the
	// reattachment to the running session
	
	public connectToReattach() : void
	{
		if(!this._authenticating)
		{
			this._authenticating = true;	
			
			this.directConnectSocket();
		}			
	}
	
	
	/**
	 * Connect the socket - This initiates a two step process
	 * 
	 * Step 1 - Does a DDNS lookup to find the current logger location
	 * Step 2 - Connect to the logger 
	 * 
	 */
	private indirectConnectSocket() : void
	{			
		// Don't allow overlapped calls to connect 
		
		if(!(this._isConnecting || this._isConnected))
		{
			// indicate connection in progress -
			// Used to indicate failure during the initial socket connection
			
			this._isConnecting = true;
			
			if(this.hasEventListener(CLogEvent.CONNECT_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.DDNS_IN_PROGRESS));
			
			
			// If we get a good loader then do the DDNS lookup
			
			if(!this.dnsLoader)
				this.dnsLoader = new CDDnsLoader(null, this.tracer);
			
			if(this.dnsLoader)
			{
				this.dnsLoader.addEventListener(CDnsEvent.COMPLETE, this.DNSresolved );
				this.dnsLoader.addEventListener(CDnsEvent.FAILED, this.DNSfailed );
				
				this.dnsLoader.resolveArbiter();
			}				
			else
				this._isConnecting = false;
		}
	}
	
	
	/**
	 *  If we have already done a DDNS lookup then we can just connect
	 *  
	 * @param evt
	 * 
	 */
	private directConnectSocket() : void
	{
		// Create the new socket
		//	Wires this.logSocket - CLogEvent.CONNECT_STATUS to socketConnectionHdlr
		//	Wires this.logSocket - CDataEvent.DATA,protocolHandlerLGR			
				
		this.createSocket();
		
		// if(this.tracer) this.tracer.TRACE("Connecting: ", '#000088');			
		
		// when the socket connects that will initiate the authentication protocol
		
		try
		{
			//#### DEBUG - force socket address
			
			if(this.fdebugMode)
			{
				this._logHostAddress = "127.0.0.1";
				this._logHostPort    = CONST.PORT_LOGGER;
			}
							
			this.logSocket.openSocket(this._logHostAddress, this._logHostPort);
			
		}
		catch(error)
		{
			CUtil.trace("catch all" + error);
		}
	}		
	
	
	/**
	 * Determine if a connection is active or pending
	 * 
	 */
	public get connectionActive() : boolean
	{			
		return (this._isConnected);
	}
	
	
	public getConnectionState() : string
	{
		let result:string;
		
		if(this._isConnected)
			result = CLogEvent.CONNECTION_OPEN;
		else
			result = CLogEvent.CONNECTION_CLOSED;
		
		return result;
	}
	
	
	/**
	 * Determine if a connection is active or pending
	 * 
	 */
	public get connectionActiveOrPending() : boolean
	{			
		return (this._isConnecting || this._isConnected);
	}


	public get sessionID() : string
	{
		return this._sessionID;	
	}
	
	
	public get sessionHost() : string
	{
		return this._logHostAddress;
	}

	
	public set sessionHost(newHost:string)
	{
		this._logHostAddress = newHost;
	}
	
	
	public get sessionPort() : number
	{
		return this._logHostPort;
	}
	
	
	public set sessionPort(newPort:number)
	{
		this._logHostPort = newPort;
	}
	
	
	/**
	 * Prior to starting a session, decide whether we are using queued data
	 *   
	 */
	public useQueue(useQ:boolean) : void
	{
		if(this._sessionID == "")
			this._useQueue = useQ;
	}

	
//***************************************************
//*** Session Management
	
	/**
	 * Determine if a session is active
	 * 
	 */
	public get isSessionActive() : boolean
	{			
		return this._sessionActive;
	}
	
	
	/**
	 * Determine if a session is active
	 * 
	 */
	public get sessionStatus() : string
	{			
		return this._sessionStatus;
	}
	
	
	/**
	 * Manual method to abandon a session while the socket is disconnected
	 * 
	 * Note: Only after a session reset you can reselect whether to use queued data
	 *
	 * Used by CAuthenticator to force abandon a connection and reset the LogManager
	 * 				 - _logManager.abandonSession(true, CLogManager.SESSION_START);
	 * 
	 * Used internally to Abandon the session after Termination Packet is acknowledged
	 *  
	 * #### DEBUG Support - Used in the CConnectionPanel to manually disconnect the this.logSocket
	 */
	public abandonSession(abandonData:boolean = false, newStatus:string = CONST.SESSION_START ) : void
	{
		this._sessionActive = false;
		this._sessionStatus = newStatus;
		
		this._sessionID   = "";
		this._sessionTime = 0;		
		
		this.fLogging = CONST.RECLOGNONE; 
		
		// reset any connections and abandon queued data
		
		this.abandonSocket(abandonData);
	}
	
	
	/**
	 * Force a manual disconnection of the active socket. 
	 * Used in the termination phase to close the socket in response to ACKTERM which
	 * the server sends once all data has been processed and the session context marked complete.
	 * 
	 * Should be Private other than #### DEBUG Support - Used in the CConnectionPanel to manually crash the this.logSocket
	 * 
	 */
	public abandonSocket(abandonData:boolean = false ) : void
	{			
		// if(this.tracer) this.tracer.TRACE("Socket Disconnect Requested: ", '#008800');
		if(this.traceMode) CUtil.trace("@@@@@@@@@@@@@@@@@@@@@@ ABANDON SOCKET @@@@@@@@@@@@@@@@@@@@@@@@@@@@@");	
		
		if(this.logSocket)
		{
			if(this.logSocket.connected)
			{
				// if(this.tracer) this.tracer.TRACE("Socket closing: ", '#000088');
			}
			else
			{
				// if(this.tracer) this.tracer.TRACE("Socket Not Connected: ", '#880000');
				
				// If it is not connected then it won't send anything to socketConnectionHdlr
				// so we need to reset these here
				
				this._isConnected    = false;	
				this._isConnecting   = false;									
			}
			
			// stop watching the connection status
			// Disconnects the listeners prior to close - so UI will not be informed of operation
			
			this.cleanupSocket();
			
			// Force the stream state back to default - only if currently streaming
			// Note: this is part of the DEBUG test rig
			
			this.stopDebugDataStream();
			
			// Abandon data in the queue only if requested - 
			
			if(abandonData)
				CLogManager._logQueue.resetQueue();										
			
			// Let everyone know what has happened.
			
			if(this.hasEventListener(CLogEvent.CONNECT_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.CONNECTION_TERMINATED));										
		}
		else
		{
			// if(this.tracer) this.tracer.TRACE("Socket is NULL: ", '#880000');
			
			if(this.hasEventListener(CLogEvent.CONNECT_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.CONNECTION_TERMINATED));
		}				
	}		
	
	
	private timeStampSession() : void 
	{
		// Init the start time of the session
					
		this._sessionTime = CUtil.getTimer();
	}
	
	
	private get sessionTime() : string
	{
		let curTime:number;
		
		curTime = (CUtil.getTimer() - this._sessionTime) / 1000.0;
		
		return curTime.toString();
	}
	

	public submitAuthentication(logData:any) : void
	{
		// if(this.tracer) this.tracer.TRACE("Sending Authentication Request...", "#000088" );				
		
		// returned data is handled in protocolHandlerLGR
		
		this.sendJSONPacket(logData);
			
		// publish stream status change 
		
		if(this.hasEventListener(CLogEvent.SEND_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.SEND_STATUS));
	}

			
	public submitJSONQuery(logData:any) : void
	{
		// if(this.tracer) this.tracer.TRACE("Sending Interface Request...", "#000088" );				
		
		// returned data is handled in protocolHandlerLGR
		
		this.sendJSONPacket(logData);
		
		// publish stream status change 
		
		if(this.hasEventListener(CLogEvent.SEND_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.SEND_STATUS));
	}
	
	
//*** Session Management
//***************************************************
	
	
//***************************************************
//*** Data Management

	// push the event onto the stack
	//
	public flushGlobalStateLocally(name:string) : void
	{
		// let file:FileReference = new FileReference();
		//			file.save(_lastStatePacket, name + this._fTutorPart + ".json");
	}
	
	
	private generateEvent(logData:any, type:string) : Object
	{
		try {
			logData['type']    = type;
			logData['version'] = '1.0'; 
			logData['time']    = this.sessionTime; 
			logData['seqid']   = CLogManager._logQueue.nextNdx;

			// TODO: Implement
			// logData['userid']  = this._sessionAccount.userData._id;

			// Generate an mongo insert packet for the log event
			
			logData = CMongo.insertPacket('logmanager', 
											CONST.LOG_PACKET, 
											'unused',
											logData);
						
			// The seqid is used for receive acknowlegement 
			logData = logData.replace("{", '{"seqid":'+CLogManager._logQueue.nextNdx +',');
		}
		catch(error) {
			console.log("Log Event Generation Failed: " + error);
		}
		return logData;
	}
	
	
	// push the event onto the stack
	//
	public logSessionIDEvent() : void
	{
		//if (logTrace) CUtil.trace("seqid=" + (logEvtIndex + 1) + "   frameID=" + CEFDoc.frameID + "   stateID=" + CEFDoc.stateID);
		
		// Set the base time for the session - records are logged relative to this.
		
		this.timeStampSession();
		
		let logData:object = {'event':'sessionID', 'name':this._sessionID, 'part':this._fTutorPart};

		logData = this.generateEvent(logData, 'SessionEvent');			
		
		CLogManager._logQueue.logEvent(logData);
	}
	
	
	// push the event onto the stack
	//
	public logLiveEvent(logData:object) : void
	{			
		//if(logTrace) CUtil.trace("seqid=" + (CLogManager._logQueue.nextNdx) + "   frameID=" + CEFDoc.frameID + "   stateID=" + CEFDoc.stateID);
		
		// Generate the log record
		//
		logData = this.generateEvent(logData, 'WOZevent');			
		
		CLogManager._logQueue.logEvent(logData );
	}
	
	
	// push the event onto the stack
	//
	public logActionEvent(logData:object) : void
	{
		//if(logTrace) CUtil.trace("seqid=" + (CLogManager._logQueue.nextNdx) + "   frameID=" + CEFDoc.frameID + "   stateID=" + CEFDoc.stateID);
		
		// Generate the log record
		//
		logData = this.generateEvent(logData, 'ActionEvent');			
		
		CLogManager._logQueue.logEvent(logData );
	}
	
	
	// push the event onto the stack
	//
	public logStateEvent(logData:object) : void
	{
		//if(logTrace) CUtil.trace("seqid=" + (CLogManager._logQueue.nextNdx) + "   frameID=" + CEFDoc.frameID + "   stateID=" + CEFDoc.stateID);
		
		// Generate the log record
		//
		logData = this.generateEvent(logData, 'StateEvent');			
	
		CLogManager._logQueue.logEvent(logData );
	}
	
	
	// push the event onto the stack
	//
	public logNavEvent(logData:object) : void
	{
		//if(logTrace) CUtil.trace("seqid=" + (CLogManager._logQueue.nextNdx) + "   frameID=" + CEFDoc.frameID + "   stateID=" + CEFDoc.stateID);
		
		// Generate the log record
		//
		logData = this.generateEvent(logData, 'NavEvent');			
		
		CLogManager._logQueue.logEvent(logData );
	}				
	
	
	// push the event onto the stack
	//
	public logDurationEvent(logData:any) : void
	{		
		// Generate the log record
		//
		logData = this.generateEvent(logData, 'DurationEvent');			
		
		CLogManager._logQueue.logEvent(logData );
	}
	
	
	// push the event onto the stack
	//
	public logProgressEvent(logData:any) : void
	{						
		// Generate the log record
		//						
		logData = CMongo.updatePacket('logManager',
										CONST.LOG_PROGRESS,
										'unused',
										{"_id":this._sessionAccount.userData._id},
										logData['reify']);			
					
		// The seqid is used for receive acknowlegement
		logData = logData.replace("{", '{"seqid":'+CLogManager._logQueue.nextNdx +',');
		
		CLogManager._logQueue.logEvent(logData );
	}
								
								
	/**
	 * This enqueues an "End Packet" that initiates the sequence of events that 
	 * terminates the session. 
	 * 
	 */
	public logTerminateEvent() : void
	{	
		// Emit the "Terminate" log record - then close the queue to new data
		// Existing data will be flushed and connection failures will result
		// in reconnects until we are successful in flushing the queue.
		//
		
		// Generate the log record
		//
		let termMsg:any = {};
		
		// should be either CObjects, MObjects or AS3 primitive data types string, Number,int,boolean,Null,void
		let profileNdx:string = this._sessionAccount.session.profile_Index;
		
		termMsg['phases']             = new CObject;												
		termMsg['phases'][profileNdx] = new CObject; 
		
		termMsg['phases'][profileNdx]['progress'] = CONST._COMPLETE;								
		
		termMsg = CMongo.updatePacket('logManager',
										CONST.LOG_TERMINATE,
										'unused',
										{"_id":this._sessionAccount.userData._id},
										termMsg);			

		CLogManager._logQueue.logEvent(termMsg );
		
		CLogManager._logQueue.closeQueue();
		
		/**
		 * #Mod Jun 3 2014 - handle non logging modes
		 * 
		 * This is a special case to handle tutor termination when the logging is deactivated - i.e. demo modes
		 * This event is handled by the session manager FSM to update the user UI 
		 * 
		 */
		if(this._fLogging & CONST.LOGEVENTS)			
		{
			// Let anyone interested know we are flushing the queue
			
			if(this.hasEventListener(CLogEvent.SESSION_STATUS))			
				this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.SESSION_TERMINATED ));			
		}
		else
		{
			// Let everyone know what has happened.
			
			if(this.hasEventListener(CLogEvent.SESSION_STATUS))			
				this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.SESSION_FLUSHED ));
		}
		
	}		
	
	
	// push the event onto the stack
	//
	public logDebugEvent(logData:any) : void
	{		
		// Generate the log record
		//
		this.generateEvent(logData, 'DebugEvent');			
		
		CLogManager._logQueue.logEvent(logData );
	}
	
	
	// push the event onto the stack
	//
	public logErrorEvent(logData:object) : void
	{
		// Generate the log record
		//
		this.generateEvent(logData, 'ErrorEvent');			
		
		CLogManager._logQueue.logEvent(logData );
	}
	
	
	/**
	 * 
	 * @param	evtXML
	 */
	public sendPacket(packet:any) : boolean
	{										
		return this.sendXMLPacket(packet);
	}
	
	
	/**
	 * 
	 * @param	evtXML
	 */
	private sendXMLPacket(packet:any) : boolean
	{										
		if(this.traceMode) CUtil.trace("@@@@@@@  QUEUEING XML PACKET: \n", packet);	
		
		let packetStr:string;
		let fResult:boolean = false;
		
		// Don't attempt send on dead socket
		//
		if(this._isConnected)
		{
			// Do asynchronous send of packet - protocol must manage exceptions
			// Note: We expect JSON packets
			
			packetStr = packet;
		
			if(!this.logSocket.sendData(packetStr))
			{
				//** Send Exception indicates that the socket is not connected
				
				// if(this.tracer) this.tracer.TRACE("LSocket: send: Connection Error...", "#880000", this.logSocket._lastError.tostring());
				if(this.traceMode) CUtil.trace("@@@@@@@@@@@@@@@@@@@@@@ SOCKET OFFLINE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@");	
			}
			else 
			{
				fResult = true;
				
				if(this.tracer)
				{
					if(packet.children[0].name == "terminatesession")
					{
						// this.tracer.TRACE("#END#");
					}
				}					
			}				
		}
		
		return fResult;
	}		
	

	/**
	 * 
	 */
	private sendJSONPacket(packet:any) : boolean
	{										
		if(this.traceMode) CUtil.trace("@@@@@@@  SENDING JSON LOG PACKET: \n", packet);	
		
		let packetStr:string;
		let fResult:boolean = false;
		
		// Don't attempt send on dead socket
		//
		if(this._isConnected)
		{
			// Do asynchronous send of packet - protocol must manage exceptions
			// Note: We expect either XML or JSON packets
			
			if(typeof packet === 'string')
				packetStr = packet;
			else						
				packetStr = JSON.stringify(packet);
			
			if(!this.logSocket.sendData(packetStr))
			{
				//** Send Exception indicates that the socket is not connected
				// Note that we expect the socket exception handler to manage the socket cleanup and announcing the  
				// failure to listeners  - See: socketConnectionHdlr
				
				// if(this.tracer) this.tracer.TRACE("this.logSocket: send: Connection Error...", "#880000", this.logSocket._lastError.tostring());
				if(this.traceMode) CUtil.trace("@@@@@@@@@@@@@@@@@@@@@@ SOCKET OFFLINE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@");	
			}
			else 
			{
				// watch for timeouts receiving responses from service.
				this.logTimeout.reset();
				this.logTimeout.addEventListener(CTimerEvent.TIMER_COMPLETE, this.socketTimeout);
				this.logTimeout.start();
				
				CUtil.trace("created Timer : " + this.logTimeout);

				fResult = true;
			}				
		}
		
		return fResult;
	}		

	
	private resetSendTimer() : void
	{
		if(this.traceMode) CUtil.trace("SOCKET TIMER - Cleaned up ");
		
		this.logTimeout.reset();			
		this.logTimeout.removeEventListener(CTimerEvent.TIMER_COMPLETE, this.socketTimeout);
	}
	
	
	/**
	 *  Manage ackhowledgement timeouts
	 * 
	 * 	We need to recycle the socket in this case
	 */
	private socketTimeout(e:CTimerEvent) : void
	{
		if(this.traceMode) CUtil.trace("@@@@@@@@@@@@@@@@@@@@@@ SOCKET TIMEOUT @@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
		
		this.resetSendTimer();
		
		// force close the socket as if it had failed and the the system recycle the connection. 
		
		this.recycleConnection(false);
	}
	
//*** Data Management		
//***************************************************


	
	
//**********************************************************		
//*****************  START - DEBUG API
			
//***************************************************
//*** Debug Data Management		
	
	/**
	 * This is the public debug send API - it can be used for either immediate or queued data transfers
	 * 
	 * This is for the Send Button Protocol - simple send/ack 
	 * 
	 */
	public sendDebugPacket(logData:object) : void
	{
		// if(this.tracer) this.tracer.TRACE("Queueing Debug Packet...", "#000088" );				
					
		if(!this._sending)
		{
			if(this._useQueue)
			{
				this.logDebugEvent(logData);						
			}			
			else if(this.sendXMLPacket(logData))
			{
				this.logSocket.addEventListener(CDataEvent.DATA, this.ackPacket);
				
				this._sending = true;	
			}
			
			// publish stream status change 
			
			if(this.hasEventListener(CLogEvent.SEND_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.SEND_STATUS));
		}
	}
	
	
	private ackPacket(evt:CDataEvent) : void
	{
		let data:string = evt.data;
		
		// if(this.tracer) this.tracer.TRACE("LSocket: dataHandler...", "#000088", "Ack type: " + data.ack.type);
		
		this.logSocket.removeEventListener(CDataEvent.DATA, this.ackPacket);
		
		this._sending = false;
		
		// publish stream status change 
		
		if(this.hasEventListener(CLogEvent.SEND_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.SEND_STATUS));			
	}
	
	
//*******************************************		
//********* DEBUG stream API
	
	/**
	 *  DEBUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * 
	 */
	public startDebugDataStream() : void
	{
		if(!this._DataStreaming)
		{
			this._DataStreaming = true;
			
			this.logSocket.addEventListener(CDataEvent.DATA, this.ackStream);
			
			if(this.sendJSONPacket({'event':'noop'}))
			{
				// if(this.tracer) this.tracer.TRACE("Data Streaming...", "#000088", "*" );					
			}
			else
			{
				this._DataStreaming = false;
				
				this.logSocket.removeEventListener(CDataEvent.DATA, this.ackStream);
			}
			
			// publish stream status change 
			
			if(this.hasEventListener(CLogEvent.DATASTREAM_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.DATASTREAM_STATUS, CLogEvent.STREAM_OPENED));							
		}
	}
	
	
	/**
	 *  DEBUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * 
	 * Force the data stream to close down - used to force stream into a known state
	 * following a socket close.
	 */
	public stopDebugDataStream() : void
	{
		if(this._DataStreaming)
		{
			this._DataStreaming = false;
			
			// if(this.tracer) this.tracer.TRACE("Data Stream Closed...", "#000088" );
			
			// Stop listening to the queue for data - this keeps the 
			// queueChanged from restarting the stream
			
			this.logSocket.addEventListener(CDataEvent.DATA, this.ackStream);
			
			// publish stream status change 
			
			if(this.hasEventListener(CLogEvent.DATASTREAM_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.DATASTREAM_STATUS, CLogEvent.STREAM_CLOSED));
		}
		
	}
	
	
	/**
	 *  DEBUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 * 
	 */
	private ackStream(evt:CDataEvent) : void
	{
		let data:string = evt.data;
		
		// if(data.ack.type == "NOOP")
		// 			this.tracer.TRACE("*");					
		
		if(this._DataStreaming)
			this.sendXMLPacket({'event':'noop'});
		else 
			this.logSocket.removeEventListener(CDataEvent.DATA, this.ackStream);			
	}
	

	//********* DEBUG stream API
	//*******************************************		
	/*
		* Note the CDataEvent.DATA coming from the this.logSocket are handled by the   
		* protocolHandlerLGR just as live packets would be
		* 
		*/
	private startQueuedStream() : void
	{
		if(!this._QueStreaming)
		{
			this._QueStreaming = true;
			
			// if(this.tracer) this.tracer.TRACE("Queued Stream Running...", "#000088", "*" );		
			
			// Start listening to the queue for data added - CLogEvent.QUEUE_CHANGED events
			
			CLogManager._logQueue.addEventListener(CLogEvent.QUEUE_CHANGED, this.queueChanged); 
							
			// Start the queue stream
			// Kick start the stream if the queue is not empty
			
			CLogManager._logQueue.startQueueStream();				
			
			// publish stream status change 
			
			if(this.hasEventListener(CLogEvent.STREAM_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.STREAM_STATUS, CLogEvent.STREAM_OPENED));							
		}
	}
	
	
	/**
	 * Note the CDataEvent.DATA coming from the this.logSocket are handled by the   
	 * protocolHandlerLGR just as live packets would be
	 * 
	 */
	private stopQueuedStream() : void
	{
		if(this._QueStreaming)
		{
			this._QueStreaming = false;
			
			// if(this.tracer) this.tracer.TRACE("Queued Stream Stopped...", "#000088" );
			
			// Stop listening to the queue for data - this keeps the 
			// queueChanged from restarting the stream
			
			CLogManager._logQueue.removeEventListener(CLogEvent.QUEUE_CHANGED, this.queueChanged); 
		
			// Start the queue stream
			// Kick start the stream if the queue is not empty
			
			CLogManager._logQueue.stopQueueStream();
			
			// publish stream status change 
			
			if(this.hasEventListener(CLogEvent.STREAM_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.STREAM_STATUS, CLogEvent.STREAM_CLOSED));
		}
	}
		
	
	/**
	 * Receives notifications when the Log Queue changes -
	 * The queue readonlyantly sends the next packet when one is available or 
	 * goes into a waiting state if not - When empty the next packet added 
	 * to the queue is sent here to restart the stream
	 *  
	 * @param evt
	 * 
	 */
	private queueChanged(evt:Event) : void
	{
		// if something is added to the queue and stream is quiescent 
		// restart the stream 
		
		// Note: must not do anything if log is not waiting for data since it will then be waiting 
		//       for an acknowledgement - if we call nextpacket we'll get a duplicate of the one that 
		//       is waiting for acklog.
		
		if(this._logWaiting && !CLogManager._logQueue.isQueueEmpty())
		{				
			if(this.sendJSONPacket(CLogManager._logQueue.nextPacket()))
			{
				// if(this.tracer) this.tracer.TRACE("#");
									
				this._logWaiting = false;
				
				if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
					this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_SENDING));								
			}
		}									
	}

	
//********************************************************************
//** Development Queue simulation - timed loop to add to CLogManager._logQueue 
	
	
	/**
	 * Start a timer to add noop events to the queue
	 */
	public startQueueing() : void
	{
		CUtil.trace("start queueing");
		this.logEventTimer.addEventListener(CTimerEvent.TIMER, this.queueCallBack);
		this.logEventTimer.start();
	}
	
	
	/**
	 * Stop the timer that adds noop events to the queue
	 */
	public stopQueueing() : void
	{			
		CUtil.trace("stop queueing");
		this.logEventTimer.stop();
		this.logEventTimer.removeEventListener(CTimerEvent.TIMER, this.queueCallBack);
	}
		
	
	private queueCallBack(evt:CTimerEvent) : void
	{
		// Generate the log record
		//
		let logData:object = {'event':'noop'};
		
		this.logDebugEvent(logData);
		
		if(this.traceMode) CUtil.trace(".");
	}
	
	
//** Development Queue simulation - timed loop to add to CLogManager._logQueue 
//********************************************************************		
	
//*****************  END - DEBUG API
//**********************************************************				
	
///**** Interface
//************************************************************************************		

	
	
//********************************************************************		
///**** State Management
					
	
	public get isDataStreaming() : boolean 
	{
		return this._DataStreaming;
	}

	
	public get isQueueStreaming() : boolean 
	{
		return this._QueStreaming;
	}

	
	public get queueLength() :number 
	{
		return CLogManager._logQueue.length;
	}
	
	
	public get queuePosition() :number 
	{
		return CLogManager._logQueue.Position;
	}
	
	
	public get isSending() : boolean 
	{
		return this._sending;
	}

	
	public get isConnected() : boolean 
	{
		return (this.logSocket)? this.logSocket.connected:false;
	}


///**** State Management
//********************************************************************		

	
	
//************************************************************************************		
///**** Socket Management


	/**
	 * 	Error modes:
	 * 		
	 * 		1:  Connection attempt on non-responsive or non-existant server
	 * 			CSocket: openSocket			- attempt to open socket
	 * 			CSocket: ioErrorHandler		- connection failure ( ~1  sec delay)
	 * 			CSocket: securityErrorHandler- connection failure ( ~20 sec delay)
	 * 
	 * 		2:  Transmission attempt on now non-responsive or non-existant server
	 * 			
	 * 			
	 * 			
	 * 
	 */
	private socketConnectionHdlr(evt:CLogEvent ) : void
	{						
		let authMsg:string;
		
		if(evt.subType == CLogEvent.SOCKET_OPENED)
		{
			this._isConnecting = false;
			this._isConnected  = true;

			if(this.traceMode) CUtil.trace("############ this.logSocket Connected");
			
			// send STATUS event and allow listeners to handle authentication
			
			if(this.hasEventListener(CLogEvent.CONNECT_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.CONNECTION_OPEN));
			
			// Note we don't start the stream here - we have to get acknowledgements on authentication
			// and session configuration before the queue stream can run
		}			
			
		//*** otherwise it will be SOCKET_CLOSED or SOCKET_IOERR or SOCKET_SECERR
		// Note that these messages can come from a new socket connection attempt or 
		// a socket that has failed in service - i.e. server shutdown, transimission timeout etc. 
			
		else 
		{															
			//!!!! NOTE: This is where we first end up if the network connection fails. 
			//           The socket closes, then there is a write timeout and that dispatches 
			//           a socket_closed event.

			// Move to the interrupted state if the session was currently running
			// We stay in the interrupted state until we successfully reconnect 
			
			if(this._sessionStatus == CONST.SESSION_RUNNING)
					this._sessionStatus = CONST.SESSION_INTERRUPTED;
			
			// When the socket reports it is closed we make the socket GC'able

			if(!this.logSocket.connected)				
			{					
				this.logSocket.removeEventListener(CLogEvent.CONNECT_STATUS, this.socketConnectionHdlr);
				this.logSocket.removeEventListener(CDataEvent.DATA,this.protocolHandlerLGR);
				
				if(this.traceMode) CUtil.trace("############ this.logSocket Disconnected - allow GC");
				this.logSocket = null;		
				
				// Always reset these
				
				this._isConnected    = false;	
				this._authenticating = false;
				
				// Set log waiting to kick start the queue when reconnected
				
				this._logWaiting = true;					
				
				if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
					this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_WAITING));			
				
				// Let listening UI components know the Connection is closed 
				// Consumers of this message make the decision on restarts etc.
				
				// must be last as it may illicit a reconnect with a newly created this.logSocket
				
				if(this.hasEventListener(CLogEvent.CONNECT_STATUS))
					this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.CONNECTION_CLOSED));								
			}
			
			// Either it succeeded or it failed either way whe're not in the process of connecting any more
			
			this._isConnecting   = false;				
		}	
		
		
		//*************************************************************************
		//** This test is for development mode only -
		
		if(this._sending)
		{
			this._sending = false;
			
			if(this.hasEventListener(CLogEvent.SEND_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.SEND_STATUS));
		}
		
		//** These two flags are for development mode only - 
		//*************************************************************************			
	}		
	
	
	/**
	 * Create and wireup the socket
	 * 
	 */
	private createSocket() : void
	{
		if(this.traceMode) CUtil.trace("@@@@@@@@@@@@@@@@@@@@@@ SOCKET CREATION @@@@@@@@@@@@@@@@@@@@@@@@@@@@@");	

		// generate the socket
		
		this.logSocket = new CLogSocket(null, 0, this.tracer);

		// Connect listeners from the socket			
		
		this.logSocket.addEventListener(CLogEvent.CONNECT_STATUS, this.socketConnectionHdlr);
		this.logSocket.addEventListener(CDataEvent.DATA,this.protocolHandlerLGR);
	}

	
	/**
	 * Close and destroy the socket
	 * 
	 */
	private cleanupSocket() : void
	{
		if(this.traceMode) CUtil.trace("@@@@@@@@@@@@@@@@@@@@@@ SOCKET CLEANUP @@@@@@@@@@@@@@@@@@@@@@@@@@@@@");	
		
		// ensure the Send timer is reset
		
		this.resetSendTimer()
		
		// Disconnect listeners from the socket
		if(this.logSocket)
		{				
			// Ensure socket is closed and collectable - closeSocket manages sockets that are either
			// closed - connected or pending connection - it will maintain listeners until the socket is 
			// good and dead to handle exceptions
			
			if(this.logSocket.connected)
			{
				this.logSocket.closeSocket();					
			}
			else
			{
				// Note: If the socket is still connecting it will be managed by the abandon logic in CSocket 
				
				this.logSocket.removeEventListener(CLogEvent.CONNECT_STATUS, this.socketConnectionHdlr);
				this.logSocket.removeEventListener(CDataEvent.DATA,this.protocolHandlerLGR);
			}
		}
								
		// Set log waiting to kick start the queue when reconnected
		
		this._logWaiting = true;
		
		if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_WAITING));			
	}

	
	/**
	 *   This allows you to break down an existing connection and retry it all from scratch
	 *  
	 * 	 It is expected that closing the socket will cause the SessionManager to reattempt the connection
	 */
	public recycleConnection(fRestart:boolean) : void
	{
		if(this.traceMode) CUtil.trace("@@@@@@@@@@@@@@@@@@@@@@ CONNECTION RECYCLING @@@@@@@@@@@@@@@@@@@@@@@@@@@@@");	
		
		// if(this.tracer) this.tracer.TRACE("Recycling Connection...", "#880000" );
		
		// Destroy the existing socket
		// Disconnects the listeners prior to close - so UI will not be informed of operation
		
		this.cleanupSocket();
		
		// Resend everything
		if(fRestart)
			CLogManager._logQueue.restartQueue();		
	}
	
	
//** Dynamic DNS management
	
	/**
	 * Throw out the loader for GC and cut its wiring 
	 * 
	 */
	private cleanupDNSLoader() : void
	{
		this.dnsLoader.removeEventListener(CDnsEvent.COMPLETE, this.DNSresolved );
		this.dnsLoader.removeEventListener(CDnsEvent.FAILED, this.DNSfailed );
		
		this.dnsLoader = null;			
	}

	
	/**
	 * There are two possible outcomes for the DDNS lookup
	 *  
	 * @param evt
	 * 
	 */
	private DNSresolved(evt:CDnsEvent ) : void
	{
		
		if(this.hasEventListener(CLogEvent.CONNECT_STATUS))
			this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.DDNS_RESOLVED));
		
		// Create the new socket
		//	Wires this.logSocket - CLogEvent.CONNECT_STATUS to socketConnectionHdlr
		//	Wires this.logSocket - CDataEvent.DATA,protocolHandlerLGR			
					
		this.createSocket();
		
		// if(this.tracer) this.tracer.TRACE("Connecting: ", '#000088');			
		
		// when the socket connects that will initiate the authentication protocol
		
		try
		{
			//#### DEBUG - force socket address
			
			if(this.fdebugMode)
			{
				this._logHostAddress = "127.0.0.1";
				this._logHostPort    = CONST.PORT_LOGGER;
			}
			
			this.logSocket.openSocket(this._logHostAddress, this._logHostPort);

		}
		catch(error)
		{
			CUtil.trace("catch all" + error);
		}
		
		// destroy the now unused loader
		
		this.cleanupDNSLoader();
	}
	
	
	/**
	 * Second of two potential outcomes of the DDNS lookup
	 *  
	 * @param evt
	 * 
	 */
	private DNSfailed(evt:CDnsEvent ) : void
	{
		// if(this.tracer) this.tracer.TRACE("DDNS failed: ", '#bb0000', evt.dnsData);		
		
		this.cleanupDNSLoader();
		
		if(this._isConnecting)
		{
			this._isConnecting = false;
			
			if(this.hasEventListener(CLogEvent.CONNECT_STATUS))
				this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.DDNS_FAILED));					
		}			
	}				

	
//** Dynamic DNS management
	
//********************************************************************		
///**** Protocol Management - decode responses from service 
			
	private protocolHandlerLGR(evt:CDataEvent) : void
	{
		let servermessage:any;
		let dataPacket:any;
		let seqID:number
		
		//--------------------------------------------------------------------------------
		// Determine if response if JSON or XML
		if(CLogManager._logQueue.queueMode == CONST.MODE_JSON)
		{			
			try
			{					
				dataPacket = JSON.parse(evt.data);
			
				// if(this.traceMode) CUtil.trace("@@@@@@@  JSON PROTOCOL RCV Event:" + dataPacket.command + dataPacket.seqid);
				
				switch(dataPacket.command)
				{
					//** Logging Protocol Management
					//
					
					case CONST.ACKLOG_PACKET:
					case CONST.ACKLOG_PROGRESS:
															
						// If the last packet was NOT correct then we have a problem 
						// The server is requesting something out of sequence 
						// Resend the whole thing
						
						if(this.traceMode) CUtil.trace("@@@@@@@  JSON LOG PACKET ACKNOWLEDGED:");	
						
						// We got the ack in time - don't allow the timer to expire
						
						this.resetSendTimer();
						
						// Check data sequencing
						
						if(!CLogManager._logQueue.ackPacket(dataPacket.seqid )) 
						{
							//@@ TODO: This should flush and truncate the log files on the server   
							
							//recycleConnection(false);								
							break;
						}							
						
						// If the stream is open then send the next packet.

						if(this._QueStreaming)
						{
							// If there is anything buffered send it
							// Queue stream is kept flowing here -
							
							if(!CLogManager._logQueue.isQueueEmpty())
							{
								this.sendJSONPacket(CLogManager._logQueue.nextPacket());
								
								if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
									this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_OPENED));			
							}	
							
							// Otherwise wait for the next packet to arrive
							// queueChanged will kick start the stream again
							
							else 
							{
								this._logWaiting = true;
								
								if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
									this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_WAITING));			
							}
						}																						
						else 
						{
							// Note that if a packet is acknowledged we always want to at least set the logwaiting flag 
							// so the stream can restart on a queue change event.
							
							this._logWaiting = true;
							
							if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
								this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_WAITING));			
						}
						break;					
				
					case CONST.ACKLOG_NAK:		// Resend packet

						// We got the ack in time - don't allow the timer to expire
						
						this.resetSendTimer();
						
						//*** Note - We don't call ackPacket here which would increment the queue pointer
						//           Therefore when we call CLogManager._logQueue.nextPacket() we get the same packet again to resend.							
						
						// If there is anything buffered send it
						// Queue stream is kept flowing here -
						
						
						let packet:any = CLogManager._logQueue.nextPacket();
						
						if(packet != null)
						{
							this.sendJSONPacket(packet);									
						}
						else
						{
							
						}
						break;						
					
					case CONST.ACKLOG_TERMINATE:
						
						// We got the ack in time - don't allow the timer to expire
						
						this.resetSendTimer();
						
						// if(this.tracer) this.tracer.TRACE("*");
						// if(this.tracer) this.tracer.TRACE("@@term@@\n");
						if(this.traceMode) CUtil.trace("@@@@@@@@@@@@@@@@@@@@@@ CONST.ACKLOG_TERMINATE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@");							
						
						// Abandon the session - 
						// This resets the queue and closes the socket 
						// also resets all session flags
						
						this.abandonSession(false, CONST.SESSION_COMPLETE);
						
						// Let everyone know what has happened.
						
						if(this.hasEventListener(CLogEvent.SESSION_STATUS))			
							this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.SESSION_FLUSHED ));
						break;							
					
					default:					
						// Handle administrative events externally						
						// We got the ack in time - don't allow the timer to expire
						
						this.resetSendTimer();
						
						this.dispatchEvent(new CLogEvent(CLogEvent.PACKET_FORWARD, CLogEvent.PACKET_DATA, 0, 0, dataPacket));
						break;
				}
				
			}
			catch(err)				
			{
				CUtil.trace("protocolHandlerLGR - Message Format Error: " + err.tostring());
				
				this._authenticating = false;
				
				if(this.hasEventListener(CLogEvent.SESSION_STATUS))			
					this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.AUTH_FAILED ));					
			}					
		}				
		
		//--------------------------------------------------------------------------------
		// process XML response			
		else 
		{			
			servermessage = evt.data;
		
			if(this.traceMode) CUtil.trace("Logger Responded: " + servermessage.name() + "\n\nFull Packet: \n" + servermessage);
			
			if(servermessage.name() == CSocket.xmlSERVER_MESSAGE)							
			{
				let msgClass:any;	// TODO: generate type data

				for (msgClass in servermessage.children())
				{
					// note: must convert to string - object can't be used in switch			
					//
					switch(msgClass.name().tostring())
					{ 						
						//** Authentication Protocol Management
						//
						
						case CSocket.xmlACKAUTH:
							if(this.traceMode) CUtil.trace("Authentication success: " + msgClass.type );
							// if(this.tracer) this.tracer.TRACE("Authentication Successful...", "#000088" );
							
							// Authentication succeeded - return userID in @type => db index 
							
							this._authenticating = false;
							
							// Set session flag - we are now in an active session.
							// Set the Session ID - used for reconnection if required							
							
							this._sessionActive = true;
							this._sessionStatus = CONST.SESSION_RUNNING;
							this._sessionID     = msgClass.type;
							
							if(this.hasEventListener(CLogEvent.SESSION_STATUS))										
								this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.AUTH_SUCCESS, 0, 0, msgClass.type));														
							break;
						
						case CSocket.xmlNAKAUTH:
							if(this.traceMode) CUtil.trace("Authentication failed: " + msgClass.type );
							// if(this.tracer) this.tracer.TRACE("Authentication Failed...", "#880000" );
							
							this._authenticating = false;
							
							if(this.hasEventListener(CLogEvent.SESSION_STATUS))			
								this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.AUTH_FAILED ));
							break;
						
						case CSocket.xmlSQLERROR:
							if(this.traceMode) CUtil.trace("Server failure: " + msgClass.type + " " + msgClass.message );
							// if(this.tracer) this.tracer.TRACE("Authentication - SQL Failed...", "#880000" );
							
							this._authenticating = false;
							
							if(this.hasEventListener(CLogEvent.SESSION_STATUS))			
								this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.AUTH_FAILED ));
							break;
						
						//
						//** Authentication Protocol Management

						//** Reattach Protocol Management
						//
						//  The reattach protocol reconnects the session to the DB or to the session files on the server
						//  if the session files are not present then the reattach may fail in which case it is neccesary 
						//  to create an entirely new session.
						//
						
						case CSocket.xmlACKATTACH:
							
							if(this.traceMode) CUtil.trace("@@@@@@@  SESSION REATTACH ACK: ");
							
							// Authentication succeeded - return userID in @type => db index 
							
							this._authenticating = false;
							
							// Get the session ID from the server reponse
							// transition back to the running state
							
							this._sessionID     = msgClass.type;
							this._sessionStatus = CONST.SESSION_RUNNING;
							
							// A leading # indicates there has been a file error at the server.
							// i.e. the user files are no longer extant
							// This requires creation of a new session and recommit of all data 
							
							if(this.sessionID.charAt(0) == '#') 
							{
								// if(this.tracer) this.tracer.TRACE("Reauthentication Failed...", "#000088" );
								
								if(this.hasEventListener(CLogEvent.SESSION_STATUS))			
									this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.AUTH_FAILED ));
							}
							else
							{
								// if(this.tracer) this.tracer.TRACE("Reauthentication Successful...", "#000088" );
								
								// Let anyone listening know that the connection is live again. e.g. UI components

								if(this.hasEventListener(CLogEvent.SESSION_STATUS))										
									this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.SESSION_RESTARTED, 0, 0, msgClass.type));								
							}							
							break;
						
						//
						//** Reattach Protocol Management
												
						
						//** NOOP Protocol Management
						//
						
						case CSocket.xmlACK:
							
							if(this.traceMode) CUtil.trace("@@@@@@@  SIMPLE PACKET ACK: ");	
							break;
						
						//
						//** NOOP Protocol Management
						
						
						//** Session Protocol Management
						//
						
						case CSocket.xmlACKSESSION:		
							
							if(this.traceMode) CUtil.trace("@@@@@@@  SESSION PACKET ACK: ");	
							// if(this.tracer) this.tracer.TRACE("*");
							
							// Get the session ID from the server reponse
							
							this._sessionID = msgClass.type;
							
							// A leading # indicates there has been a file or registration formatting 
							// error at the server.
							//
							// This is most likely an unrecoverable state from the client end. 
							// i.e. It will require action at the server end to resolve 
							
							if(this._sessionID.charAt(0) == '#') 
							{
								// disconnect logger
								// Disconnects the listeners prior to close - so UI will not be informed of operation
								// 
								this.cleanupSocket();															
								
								if(this.hasEventListener(CLogEvent.SERVER_FAILED))			
									this.dispatchEvent(new CLogEvent(CLogEvent.SERVER_FAILED, this._sessionID));
							}
							break;
						
						
						
						case CSocket.xmlACKTERM:
							
							// if(this.tracer) this.tracer.TRACE("*");
							// if(this.tracer) this.tracer.TRACE("@@term@@\n");

							// Abandon the session - 
							// This resets the queue and closes the socket 
							// also resets all session flags
							
							this.abandonSession(false);
							
							// Let everyone know what has happened.
							
							if(this.hasEventListener(CLogEvent.SESSION_STATUS))			
								this.dispatchEvent(new CLogEvent(CLogEvent.SESSION_STATUS, CLogEvent.SESSION_FLUSHED ));
							break;							
						
						//
						//** Session Protocol Management
						
						
						//** Logging Protocol Management
						//
						
						case CSocket.xmlACKLOG:						
							
							// if(this.tracer) this.tracer.TRACE("*");
							
							seqID = msgClass.type;
							
							// If the last packet was NOT correct then we have a problem 
							// The server is requesting something out of sequence 
							// Resend the whole thing
							
							if(!CLogManager._logQueue.ackPacket(seqID )) 
							{
								//@@ TODO: This should flush and truncate the log files on the server   
								
								//recycleConnection(false);								
								break;
							}

							// If the stream is open then send the next packet.

							if(this._QueStreaming)
							{
								// If there is anything buffered send it
								// Queue stream is kept flowing here -
								
								if(!CLogManager._logQueue.isQueueEmpty())
								{
									if(this.sendXMLPacket(CLogManager._logQueue.nextPacket()))
									{
										// if(this.tracer) this.tracer.TRACE("#");
									}
									
									if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
										this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_OPENED));													
								}	
								
								// Otherwise wait for the next packet to arrive
								// queueChanged will kick start the stream again
								
								else 
								{
									this._logWaiting = true;
									
									if(this.hasEventListener(CLogEvent.QUEUE_STATUS))
										this.dispatchEvent(new CLogEvent(CLogEvent.QUEUE_STATUS, CLogEvent.QUEUE_WAITING));			
								}
							}								
							
							break;
						
						//
						//** Logging Protocol Management
						
						
						// anything else is a protocol failure
						
						default:
							
							if(this.traceMode) CUtil.trace("Protocol Error");
							
							break;					
					}		  
				}
			}
		}
	}				

	
	/**
	 * 
	 */
	public activateSession(sessionID:string = null) : void
	{
		if(this.traceMode) CUtil.trace("Authentication success: " + sessionID );
		// if(this.tracer) this.tracer.TRACE("Authentication Successful...", "#000088" );
		
		// Authentication succeeded - return userID in @type => db index 
		
		this._authenticating = false;
		
		// Set session flag - we are now in an active session.
		// Set the Session ID - used for reconnection if required							
		
		this._sessionActive = true;
		this._sessionStatus = CONST.SESSION_RUNNING;
		
		if(sessionID != null)
			this._sessionID = sessionID;
	}
	

	/**
	 * 
	 */
	public failSession() : void
	{
		if(this.traceMode) CUtil.trace("Authentication failed: " );
		// if(this.tracer) this.tracer.TRACE("Authentication Failed...", "#880000" );
		
		this._authenticating = false;		
	}
	
	
	
//**** Protocol Management - decode responses from service 
//********************************************************************		

	
//*******************************************************************************		
//************************** PLAYBACK		
			
	// Set where the playback data comes from
	//
	public setPlayBackSource(logSource:any ) 
	{
		// null logSource plays back from the live log
		// note: the live log is wrapped in a TutorShop clientmessage wrapper
		
		if(logSource == null)
		{
			this.LogSource   = "logCache";
		//	this.JSONEvents   	= logEvents.clientmessage;
			this.playBackSiz = CLogManager._logQueue.length;
		}
		else
		{
			this.LogSource   = "xmlSource";
			this.JSONEvents   = logSource;
			this.playBackSiz = logSource.length();
			
			if(this.traceMode) CUtil.trace("playBackSiz: " + this.playBackSiz);
		}			
		
		// Init playback counters
		//
		this.fPlayBackDone		 = false;
		this.playBackNdx          = 0;
//			CEFDoc.frameID = 0;
//			CEFDoc.stateID = 0;
		
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
		
		for(let i1:number = 0 ; i1 <  CLogManager._logQueue.length ; i1++)
		{
			//unWrapped.appendChild(logEvents.children()[i1].logrecord[0]);
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
		
		nBaseTime = this.JSONEvents[0].time;
		
		// If the recording has not already been normalized then process it
		//
		if(nBaseTime != 0)
		{			
			for(nEvent = 0 ; nEvent < this.playBackSiz ; nEvent++)
			{		
				this.JSONEvents[nEvent].time -= nBaseTime;
				this.JSONEvents[nEvent].time *= 1000;
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
		
		xmlEvent = this.JSONEvents[0];					// for live log use - logEvents.children().logrecord[0]
		
		nBaseTime  = xmlEvent.time;
		nBaseState = xmlEvent.stateID;
		nBaseFrame = xmlEvent.frameID;
		
		// If the recording has not already been normalized then process it
		
		if(nBaseTime != 0)
		{			
			for(nEvent = 0 ; nEvent < this.playBackSiz ; nEvent++)
			{		
				xmlEvent = this.JSONEvents[nEvent];		// for live log use - logEvents.children()[nEvent].logrecord[0]
				
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
		
		xmlEvent = this.JSONEvents[this.playBackNdx]; 			// logEvents.children()[playBackNdx].logrecord[0];
		
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
		
		if(this.traceMode) CUtil.trace("getEvent for State: " + stateID + " : Frame : " + frameID);
		
		for( ; this.playBackNdx < this.playBackSiz ; this.playBackNdx++)
		{			
			xmlEvent = this.JSONEvents[this.playBackNdx]; 			// logEvents.children()[playBackNdx].logrecord[0];
			
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
				
				if(xmlEvent.CEFMouseEvent != undefined)
				{
					xResult = xmlEvent;
					this.playBackNdx++;
					break;
				}
					
					// parse keyboard events
					
				else if(xmlEvent.CEFTextEvent != undefined)
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
	 *  return the next action event between lastAction and the new Frame Time. 
	 *
	 */
	public getActionEvent(frameTime:Number) : any
	{
		let xResult:any = null;
		let nAction:number;
		
		if(this.traceMode) CUtil.trace("getActionEvent: " + frameTime);
		
		for(nAction = this.lastAction + 1 ; nAction < this.playBackSiz ; nAction++)
		{			
			// We only return WOZEvents
			//
			if(this.JSONEvents[nAction].type != "WOZevent")
				continue;
				
			else if(this.JSONEvents[nAction].CEFMouseEvent != undefined)
			{
				if(this.JSONEvents[nAction].time <= frameTime)
				{
					if(this.JSONEvents[nAction].CEFMouseEvent.CEFEvent.type != "WOZMOUSE_MOVE")
					{								
						xResult = this.JSONEvents[nAction];
						break;
					}
				}
				else break;
			}
			else if(this.JSONEvents[nAction].CEFTextEvent != undefined)
			{
				if(this.JSONEvents[nAction].time <= frameTime)
				{
					xResult = this.JSONEvents[nAction];
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
	public setPlayBackDone(val:boolean) 
	{
		this.fPlayBackDone = val;	
	}
	
	
	/**
	 *  Find the first Playback move event at or beyond the current frame time
	 *
	 *  This is used to interpolate the Playback position at Frame Time
	 */
	public getMoveEvent(frameTime:Number) : any
	{
		let xResult:any = null;
		let nMove:number;
		
		for(nMove = this.lastMove ; nMove < this.playBackSiz ; nMove++)
		{			
			// We only return WOZEvents
			//
			if(this.JSONEvents[nMove].type != "WOZevent")
				continue;
			
			if(this.JSONEvents[nMove].time >= frameTime)
			{
				if(this.JSONEvents[nMove].CEFMouseEvent.CEFEvent.type == "WOZMOUSE_MOVE")
				{								
					xResult = this.JSONEvents[nMove];
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
//*******************************************************************************		
	
}

// class at Module scope

class SingletonObj
{
//nothing else required here
}

	
