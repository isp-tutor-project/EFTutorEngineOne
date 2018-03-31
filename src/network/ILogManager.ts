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

/**
 * Use CLogManager to manage a TED server connection and associated 
 * log queue. It will automatically reattach when a connection is lost 
 * 
 * @author Kevin Willows
 * 
 */
export interface ILogManager 
{
	useLocalHost() : void;
	
	queryTheQueue() : void;		
	
	addEventListener(type:string, listener:Function, useCapture:boolean, priority:number, useWeakReference:boolean):void;
	
	removeEventListener(type:string, listener:Function, useCapture:boolean):void;
		
//###############################################################		
///**** Interface
	
	fLogging :number;		
	
	account(_account:object): void;
		
	fTutorPart() :string;		
	
	fTutorPart(newval:string) : void;		
	
	setQueueStreamState(startQueue:boolean) : void;
	
	getQueueStreamState() :string;
	
	getQueueState() :string;
	
	connectProtocol(func:Function) : void;
		
	disConnectProtocol(func:Function) : void;
		
	connectForInterface() : void;
	
	connectToAuthenticate() : void;
	
	connectToReattach() : void;
	
	/**
	 * Determine if a session is active
	 * 
	 */
	isSessionActive() :boolean;
	
	
	recycleConnection(fRestart:boolean) : void;
		
	/**
	 * Determine if a session is active
	 * 
	 */
	sessionStatus() :string;
			
	/**
	 * Determine if a connection is active or pending
	 * 
	 */
	connectionActive() :boolean;
	
	getConnectionState() :string;
		
	/**
	 * Determine if a connection is active or pending
	 * 
	 */
	connectionActiveOrPending() :boolean;
			
	sessionID() :string;			
	
	sessionHost() :string;
	sessionHost(newHost:string) : void;		
	
	sessionPort() : number;
	sessionPort(newPort:number) : void;		
	
	/**
	 * Prior to starting a session, decide whether we are using queued data
	 *   
	 */
	useQueue(useQ:boolean) : void;
	
	
	/**
	 * Manual method to abandon a session while the socket is disconnected
	 * 
	 * Note: Only after a session reyou can reselect whether to use queued data
	 * 
	 */
	abandonSession(abandonData:boolean, newStatus:string) : void;		
	//abandonSession(abandonData:boolean = false ) : void;
	
	/**
	 * Force a manual disconnection of the active socket. 
	 * Used in the termination phase to close the socket in response to ACKTERM which
	 * the server sends once all data has been processed and the session context marked complete.
	 * 
	 */
	abandonSocket(abandonData:boolean) : void;
	
	
	submitAuthentication(xMsg:any) : void;

	submitJSONQuery(jMsg:any) : void;
	
	activateSession(sessionID:string) : void;
	
	failSession() : void;
	
	sendPacket(packet:any) :boolean;
	
	
//*** Session Management
//###############################################################
	
	
//###############################################################
//*** Data Management

	
	/**
	 * This enqueues an "End Packet" that initiates the sequence of events that 
	 * terminates the session. 
	 * 
	 */
	logTerminateEvent() : void;
	
	
	// push the event onto the stack
	//
	logSessionIDEvent() : void;
	
	
	// push the event onto the stack
	//
	logLiveEvent(logData:object) : void;
	
	
	// push the event onto the stack
	//
	logActionEvent(logData:object) : void;
	
	
	// push the event onto the stack
	//
	logStateEvent(logData:object) : void;
	
	
	// push the event onto the stack
	//
	logNavEvent(logData:object) : void;
	
	
	// push the event onto the stack
	//
	flushGlobalStateLocally(name:string) : void;
	
	
	// push the event onto the stack
	//
	logProgressEvent(logData:any) : void;
	
	
	// push the event onto the stack
	//
	logDurationEvent(logData:any) : void;
	
	
	// push the event onto the stack
	//
	logErrorEvent(logData:object) : void;
	
	
//*** Data Management		
//###############################################################

	
//###############################################################		
///**** State Management
	
	
	isDataStreaming() :boolean; 
	
	
	isQueueStreaming() :boolean; 
	
	
	queueLength() : number; 

	queuePosition() : number; 
	
	isSending() :boolean; 
	
	
	isConnected() :boolean; 
	

///**** State Management
//###############################################################		
	
	
//###############################################################		
//*****************  START - DEBUG API

	/**
	 * This is the public debug send API - it can be used for either immediate or queued data transfers
	 * 
	 * This is for the Send Button Protocol - simple send/ack 
	 * 
	 */
	sendDebugPacket(logData:object) : void;
	
	
//********* DEBUG stream API
	
	/**
	 * 
	 */
	startDebugDataStream() : void;
	
	
	/**
	 * Force the data stream to close down - used to force stream into a known state
	 * following a socket close.
	 */
	stopDebugDataStream() : void;
	
	
	/**
	 * Note the DataEvent.DATA coming from the logSocket are handled by the   
	 * protocolHandlerLGR just as live packets would be
	 * 
	 */
	//startQueuedStream() : void;
	
	
	/**
	 * Note the DataEvent.DATA coming from the logSocket are handled by the   
	 * protocolHandlerLGR just as live packets would be
	 * 
	 */
	//stopQueuedStream() : void;

	
//********* DEBUG stream API		
	
	
	/**
	 * Start a timer to add noop events to the queue
	 */
	startQueueing() : void;
	
	/**
	 * Stop the timer that adds noop events to the queue
	 */
	stopQueueing() : void;
	
	
//** Development Queue simulation - timed loop to add to _logQueue 
//###############################################################		

//*****************  END - DEBUG API
//###############################################################				
	
	
//###############################################################		
//************************** PLAYBACK		
	
	// where the playback data comes from
	//
	setPlayBackSource(logSource:Array<String> ) : void;
	
	
	/**
	 *  Remove the <clientmessage> wrapper from the log
	 * 
	 */
	unWrapLog() :Array<String>;

		
	/**
	 *  Preprocess the source recording to normalize the times 
	 *  Note: Legacy playback normalization
	 *
	 */
	normalizePlayBackTime() : void;
	
	
	/**
	 *  Preprocess the source recording to normalize the times 
	 *
	 */
	normalizePlayBack() : void;
	
	
	/**
	 *  return the state associated with the next event to be fired
	 *
	 */
	getNextEventState() : number;
	
	
	/**
	 *  return the next event between lastEvent and the new Frame Time. 
	 *
	 */
	getNextEvent(stateID:number, frameID:number) :string;
	
	
	/**
	 *  Query if playback is finished
	 *
	 */
	playBackDone() :boolean;
	
	
//@@@@@@@@@@@@@@@@@@@ Legacy Playback
	
	/**
	 *  return the next action event between lastAction and the new Frame Time. 
	 *
	 */
	getActionEvent(frameTime:Number) :string;

		
	/**
	 * Support for aborting playback
	 */
	setPlayBackDone(val:boolean) : void;
	
	
	/**
	 *  Find the first Playback move event at or beyond the current frame time
	 *
	 *  This is used to interpolate the Playback position at Frame Time
	 */
	getMoveEvent(frameTime:Number) :string;
	
	
//@@@@@@@@@@@@@@@@@@@ Legacy Playback


//************************** PLAYBACK
//###############################################################		
	
}

