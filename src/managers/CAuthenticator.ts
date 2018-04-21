//*********************************************************************************
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//  Copyright(c) 2014 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  Author(s): Kevin Willows                                                           
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
	
import { CLogManager } 		from "./CLogManager";
import { CLogManagerType } 	from "./CLogManagerType";
import { ILogManager }		from "./ILogManager";


import EventDispatcher = createjs.EventDispatcher;



/**
 *	The CAuthenticator class provides multiple ways to authenticate.
	* 
	*	If there is an active connection it is closed and recycled before continuing.  
	*	All methods attempt a server connection prior to authentication - if there is no active connection.
	*  
	* 1. Admin authentication
	* 		This method always authenticates against the Users collection 
	* 
	* 2. Teacher authentication
	* 		This method always authenticates against the Teachers collection 
	* 
	* 3. Student authentication
	* 		This method always authenticates against the collection entered by the user 
	*		
	* 		Each step in the authenticaion process is handled by a protocol.
	*      
	*      Each of the above authenication methods have a chain of protocols that is initialized through 
	*      an external call to one of the initializer functions. i.e. authAdmin - authGroup etc
	*    
	* 		Each protocol is represented by an entry in the protocolChain array - an array of 
	*      pointers to functions that implement the protocols. 
	* 	    and an associated entry in the protocolChainData array - an array that represents the protocol
	*      state for its associated protocol.
	* 
	* 		The protocol data objects take the generic form   
	* 
	* 		_data = { protocolState:<Current-Protocol FSM state>,
	* 
	* 				  userID:<user name>,
	* 				  userPW:<user password>,
	* 				  groupID:<user group>,
	* 				  protocolAuth:<authentication protocol>		
	* 			      protocolNext:<runtime server protocol>,
	* 
	* 				  svrResponse:{subType:<Sting>, ... call specific  },
	* 				  userAccount:{ ... },
	*
	* Note: Jul 09 2014 - Group Authentication is not strickly required anymore - however the auth_group is used to 
	*                     guarantee that ClassID's aka GroupID's are unique. 
	*  	
	*/
export class CAuthenticator extends EventDispatcher
{
	private traceMode:Boolean = false;
	
	private _logManager:ILogManager;

	private _currentProtocolPtr:Function;
	private _data:Object;

	private protocolChain:Array<string>;
	private protocolChainData:Array<string>;		
	
	private _grpID:string;
	private _usrID:string;
	private _usrPW:string;
	private _validationID:string;
	
	private _protocolAuth:string;
	private _protocolNext:string;
	
	private _authType:string;
	
	private _protocolRequest:string;

	private _userAccount:Object;
	private _accountActive:Boolean = false;

	private _classID:string = "";

	private _source:string;
	private _collection:string;
	private _mongoPacket:string;
	
	
	// Singleton implementation
	private static _instance:CAuthenticator;		 
	
	
	// This protects the singleton - can't be invoked from outside due to file scope of SingletonObj.
				
	constructor(enforcer:SingletonObj)
	{
		//TODO: implement function
		super();
		
		if(enforcer == null || enforcer !instanceof SingletonObj) 
			throw(new Error("Invalid CLogManager Invokation"));		
					
		// base protocol state object
		
		this._data = {};
	
		// create the log manager if not extant
		
		if(!this._logManager)
			this._logManager = CLogManager.getInstance();			
	}
	
	
	public static getInstance() : CAuthenticator
	{
		let result:CAuthenticator;
		
		if(this._instance == null)
			this._instance = new CAuthenticator(new SingletonObj());				
		
		return this._instance;
	}
	

	public set currClass(classID:string) 
	{
		this._classID = classID;	
	}
	
	public get currClass() : string
	{
		return this._classID;
	}
	
	public set protocolNext(Next:string) 
	{
		this._protocolNext = Next;
	}

	public set groupID(groupID:string) 
	{
		let pattern:RegExp = /-/g;  
		
		this._grpID = groupID.replace(pattern,"");; 
	}
	
	public set userID(userID:string)
	{
		this._usrID = userID; 
	}
	
	public get userID() :string 
	{
		return this._usrID; 
	}
	
	public set validationID(validationName:string) 
	{
		this._validationID = validationName; 
	}
	
	public get validationID() :string 
	{
		return this._validationID; 
	}

	// TODO: resolve byte conversion
	// 
	public set userPW(userPW:string) 
	{
		// let pwdBArr:ByteArray;
		// let pwd:string;
		
		// pwdBArr = new ByteArray;			
		// pwdBArr.writeUTFBytes(userPW);
		
		// _usrPW = SHA256.computeDigest(pwdBArr);						
	}
			
	public get accountActive() : Boolean
	{
		return this._accountActive;				
	}		
	
	public get userAccount() 
	{
		return this._userAccount;
	}		

	public isAdmin() : Boolean 
	{
		let result:Boolean;
		
		if(this._userAccount.userData.account.isAdmin)
			result = this._userAccount.userData.account.isAdmin;
		else 
			result = false;
		
		return result;
	}		
	
	public abandonConnection() : void
	{
		this._accountActive = false;
		
		this._logManager.abandonSession(true, CLogManagerType.SESSION_START);			// abandon data and close socket and move back to sessionStart state
	}
	

	/**
	 * This allows you to submit a cancel operation to the active protocol  
	 */ 				
	public simulateResponse(data:Object) : void
	{
		this._data.svrResponse = data;
		
		this._currentProtocolPtr();			
	}

	
	public refreshAccountData() : void
	{
		this.protocolChain	  = new Array();
		this.protocolChainData = new Array();		
		
		// push in reverse so we can just pop them as we go

		this._source	 = "refreshAccountData";
		this._collection = "teachers";
		this.chainUpdateDocument();	   					// Update the account data - used when classes added etc. 
		
		this.chainConnect();								// Add the connection if not already connected
		
		this.doNextProtocol();							// Start Processing the request
	}
	
	
	public authGroupID() : void
	{
		this.chainGroupIDAuth();
		this.chainConnect();
	}

	
	public authTeacher() : void
	{
		_userAccount = {};
		
		protocolChain	  = new Array();
		protocolChainData = new Array();		
		
		// push in reverse so we can just pop them as we go
		
													// UserID | PWD externally
		_grpID 			 = "teachers";				// Authenticate against the teachers collection
		
		_protocolNext    = "ADMIN.1.0";				// After group authentication we switch server to ADMIN.1.0 protocol
		_protocolAuth 	 = "DB_AUTHENTICATE";		// This is the server side authentication protocol			
		_authType        = "authenticate";			// we can also reauthenticate
		
		chainUsrPwdAuth();							// Authenticate the user/pw against the collection selected by the group auth
		
//			_grpID        	 = "Admin";					// Force authentication for groupID <Admin> - GroupID authenticates against auth_groups collection		
//			chainGroupIDAuth();	   						// Authenticate the Group ID - 
		
		chainConnect();								// Add the connection if not already connected
		
		doNextProtocol();							// Start Processing the request
	}
	
	
	public authAdminGuest() : void
	{
		_userAccount = {};
		
		protocolChain	  = new Array();
		protocolChainData = new Array();		
		
		// push in reverse so we can just pop them as we go

		userPW           = "GUEST";					// Generate SHA256 pwd encoding			
		_usrID			 = "GUEST";
		_grpID 			 = "users";					// Authenticate against the users collection
		
		_protocolNext    = "GUEST.1.0";				// After group authentication we switch server to GUEST.1.0 protocol
		_protocolAuth 	 = "DB_AUTHENTICATE";		// This is the server side authentication protocol  
		_authType        = "authenticate";			// we can also reauthenticate
		
		chainUsrPwdAuth();							// Authenticate the user/pw against the collection selected by the group auth
		
//			_grpID        	 = "Admin";					// Force authentication for groupID <Admin> - GroupID authenticates against auth_groups collection		
//			chainGroupIDAuth();	   						// Authenticate the Group ID - 
		
		chainConnect();								// Add the connection if not already connected
		
		doNextProtocol();							// Start Processing the request
	}
	
	
	public authAdminUI() : void
	{
		_userAccount = {};
		
		protocolChain	  = new Array();
		protocolChainData = new Array();		
								
		// push in reverse so we can just pop them as we go
		
		_protocolNext    = "ADMIN.1.0";				// After group authentication we switch server to ADMIN.1.0 protocol
		_protocolRequest = "REQUEST_FLEX_LOADER";	// Server Command
		chainAccountLoader();						

													// UserID | PWD externally
		_grpID        	 = "users";					// Authenticate against the users collection
		_protocolNext 	 = "FLEX_LOADER.1.0";		// After authentication we switch server to FLEX_LOADER.1.0 protocol			
		_protocolAuth 	 = "DB_AUTHENTICATE";		// This is the server side authentication protocol  
		_authType        = "authenticate";			// we can also reauthenticate
		
		chainUsrPwdAuth();							// Authenticate the user/pw against the collection selected by the group auth
		
//			_grpID        	 = "Admin";					// Force authentication for groupID <Admin> - GroupID authenticates against auth_groups collection		
//			chainGroupIDAuth();	   						// Authenticate the Group ID - 
		
		chainConnect();								// Add the connection if not already connected
		
		doNextProtocol();							// Start Processing the request
	}

	
	public authUser() : void
	{
		_userAccount = {};
		
		protocolChain	  = new Array();
		protocolChainData = new Array();		
					
		// push in reverse so we can just pop them as we go
		
		_protocolNext    = "STUDY_LOGGER.1.0";		// After group authentication we switch server to STUDY_LOGGER.1.0 protocol
		_protocolRequest = "STUDY_LOADER_REQUEST";	// Server Command
		chainAccountLoader();						
		
		_protocolNext	 = "STUDY_LOADER.1.0";		// After authentication we switch server to STUDY_LOADER.1.0 protocol			
		_protocolAuth	 = "STUDY_AUTHENTICATE";	// This is the server side authentication protocol 			
		_authType        = "authenticate";			// we can also reauthenticate

		chainUsrIdAuth();							// Authenticate the userID/groupID against the collection selected by the group auth
		
//			chainGroupIDAuth();	   						// Authenticate the Group ID - the group ID should have already been externally
		
		chainConnect();								// Add the connection if not already connected
		
		doNextProtocol();		// Start Processing the request
	}
	
			
	public authForReconnect() : void
	{
		protocolChain	  = new Array();
		protocolChainData = new Array();		
		
		// push in reverse so we can just pop them as we go
		
		_protocolNext    = "STUDY_LOGGER.1.0";		// After group authentication we switch server to STUDY_LOGGER.1.0 protocol
		_protocolAuth	 = "STUDY_AUTHENTICATE";	// This is the server side authentication protocol 			
		_authType        = "reauthenticate";		// we can also authenticate

		chainUsrIdAuth();							// Authenticate the userID/groupID against the collection selected by the group auth
		
		chainConnect();								// Add the connection if not already connected
		
		doNextProtocol();		// Start Processing the request
	}
	
	
	private chainConnect() : void
	{		
		let obj:Object;
		
		// If we don't have an active connection to the server - do that first
		if(!_logManager.connectionActive)
		{
			// Configure initial protocol state object
			
			obj = {};			
			obj.protocolState = "START_CONNECTION_PROTOCOL";			
			
			protocolChain.push(connectProtocol); 
			protocolChainData.push(obj);						
		}			
	}
	
	
	private chainUpdateDocument() : void
	{
		let obj:Object;
		
		// Configure initial protocol state object
		
		obj = {};			
		obj.protocolState = "START_UPDATE";
		
		protocolChain.push(updateProtocol); 
		protocolChainData.push(obj);		
	}
	
	
	private chainGroupIDAuth() : void
	{
		let obj:Object;
		
		// Configure initial protocol state object
		
		obj = {};			
		obj.protocolState = "START_GROUP_AUTH";
		obj.grpID         = _grpID;
		
		protocolChain.push(authGroupProtocol); 
		protocolChainData.push(obj);		
	}
	
	
	/**
	 * 		Note that this is a relic of the way the studies were setup in DB during active studies - 
	 *   	changing groupID and userPW to a common grppwd would be advantageous but would break all existing versions of the code. 
	 */
	public chainUsrIdAuth() : void
	{
		let obj:Object;
		
		// Configure initial protocol state object
		
		obj = {};			
		
		obj.protocolState = "START_USRID_AUTH";
		
		// This is used to discriminate between a request and a user initiated cancel which is injected as a simulated response			
		obj.type 		  = _authType;			// we can also reauthenticate"authenticate";				  
		
		obj.userID        = _usrID;
		obj.grpID         = _grpID;						// The groupid is a stand-in for a user password
		obj.protocolAuth  = _protocolAuth;
		obj.protocolNext  = _protocolNext;
		
		protocolChain.push(authUserPwdProtocol); 
		protocolChainData.push(obj);		
	}
	
	
	public chainUsrPwdAuth() : void
	{
		let obj:Object;
		
		// Configure initial protocol state object
		
		obj = {};			
		
		obj.protocolState = "START_USRPWD_AUTH";

		// This is used to discriminate between a request and a user initiated cancel which is injected as a simulated response			
		obj.type 		  = _authType;			// we can also reauthenticate"authenticate";				  
		
		obj.userID        = _usrID;
		obj.userPW        = _usrPW;
		obj.grpID         = _grpID;
		obj.protocolAuth  = _protocolAuth;
		obj.protocolNext  = _protocolNext;
					
		protocolChain.push(authUserPwdProtocol); 
		protocolChainData.push(obj);		
	}

	
	public chainAccountLoader() : void
	{
		let obj:Object;
		
		// Configure initial protocol state object
		
		obj = {};			
		
		obj.protocolState 	= "START_ACCOUNT_LOADER";			
		obj.protocolNext  	= _protocolNext;
		obj.protocolRequest = _protocolRequest;
			
		protocolChain.push(accountLoaderProtocol); 
		protocolChainData.push(obj);		
	}
	
	
	/**
	 *  Events occuring in the logManager can alter the UI state-machine
	 * 
	 * These commands are managed in the LogManager - anything else is forwarded here
	 * 
	 * 		CMongo.ACKLOG_PACKET
	 * 		CMongo.ACKLOG_PROGRESS
	 * 		CMongo.ACKLOG_TERMINATE
	 * 
	 * This may receive any of the following messages
	 *	   
		* 		CLogEvent.PACKET_DATA	- whenever the socket is connected
		* 
		*/
	private forwardLogProtocol(evt:CLogEvent) : void
	{			
		// Connection specific messages come through this listener.			
		_data.svrResponse =  evt.dataPacket;
		
		// Send the result to the active protocol
		_currentProtocolPtr();
	}
	
	
	
	private forwardConnectProtocol(evt:CLogEvent) : void
	{			
		// Connection specific messages come through this listener.			
		_data.svrResponse =  evt;
		
		// Send the result to the active protocol
		_currentProtocolPtr();
	}

	
	private forwardDataProtocol(evt:DataEvent) : void
	{			
		// Connection specific messages come through this listener.			
		_data.svrResponse =  evt.data;
		
		// Send the result to the active protocol
		_currentProtocolPtr();
	}
	
	
	
	private doNextProtocol() : void
	{
		// If there are more protocols to complete do next 
		
		if(protocolChain.length != 0)
		{
			_currentProtocolPtr = protocolChain.pop();
			_data 				= protocolChainData.pop();
		
			_currentProtocolPtr();			// Start the protocol
		}						
	}			
	
	
	/**
	 * Track Session Connection Status
	 * 
	 * We watch the logManager component for CONNECT_STATUS events that indicate changes in the connection.
	 * There are 3 distinct session phases.
	 * 	1. startup     - where the user has not yet successfully authenticated
	 *  2. running     - where the user is in active instruction after initial authentication
	 *  3. termination - where instruction is finished and the log data needs to be flushed
	 *                   note: When successfully flushed the system returns to the startup state 
	 * 
	 * @param evt  CLogEvent.CONNECT_STATUS
	 *
	 *  Events occuring in the logManager connection state can alter the UI state machine
	 *  
	 * This may receive any of the following messages
	 * 
	 * 		CLogEvent.DDNS_IN_PROGRESS 		- ignored
	 * 		CLogEvent.DDNS_RESOLVED 		- ignored
	 * 		CLogEvent.DDNS_FAILED 			- ignored
	 * 
	 * 		CLogEvent.CONNECTION_OPEN		- used to initiate protocol
	 * 		CLogEvent.CONNECTION_CLOSED		- used to initiate error processing
	 * 		CLogEvent.CONNECTION_TERMINATED - ignored
	 *  
	 */
	private connectProtocol() : void
	{
		let authMsg:XML;
		let authStr:string;
					
		// We keep watching the connection status even after sending authentication requests
		// in case the channel fails.  But always scrap the authenticationProtocol if anything
		// happens to the connection prior to full authentication.
		
		switch(_data.protocolState)
		{
			
			case "START_CONNECTION_PROTOCOL":
				
				_data.protocolState = "CONNECTION_RESPONSE";		// switch state
				
				_logManager.addEventListener(CLogEvent.CONNECT_STATUS, forwardConnectProtocol);					
				
				// Connect the socket and wait for CLogEvent.CONNECTION_OPEN on connectionprotocol 
				
				_logManager.connectForInterface();					// Tell the logManager to do a indirectConnect i.e. Through DDNS
				break;
			
			case "CONNECTION_RESPONSE":
				
				switch(_data.svrResponse.subType)
				{
					case CLogEvent.CONNECTION_OPEN:

						_logManager.removeEventListener(CLogEvent.CONNECT_STATUS, forwardConnectProtocol);					
						
						switch(_logManager.sessionStatus)
						{								
							case CLogManager.SESSION_START:
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CLogEvent.CONNECTION_OPEN));
								
								doNextProtocol();									
								break;
							
							case CLogManager.SESSION_INTERRUPTED:
								// Shouldn't happen during authentication									
								break;
							
							default:
								break;
						}					
						break;
					
					
					case CLogEvent.CONNECTION_CLOSED:

						_logManager.removeEventListener(CLogEvent.CONNECT_STATUS, forwardConnectProtocol);					
						
						dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CLogEvent.CONNECTION_CLOSED));
						
						switch(_logManager.sessionStatus)
						{
							case CLogManager.SESSION_START:
								// Shouldn't happen during authentication									
								break;
							
							case CLogManager.SESSION_INTERRUPTED:
								// Shouldn't happen during authentication									
								break;
							
							default:
								break;
						}
						break;
					
					
					case CLogEvent.CONNECTION_TERMINATED:
						
						_logManager.removeEventListener(CLogEvent.CONNECT_STATUS, forwardConnectProtocol);					
						
						// Shouldn't happen during authentication																
						break;
					
					case CLogEvent.DDNS_IN_PROGRESS:
					case CLogEvent.DDNS_RESOLVED:
						break;
						
					case CLogEvent.DDNS_FAILED:
						
						_logManager.removeEventListener(CLogEvent.CONNECT_STATUS, forwardConnectProtocol);
						
						dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CLogEvent.DDNS_FAILED));
													
						// Shouldn't happen during authentication									
						break;
					
					default:					
						break;
				}			
				break;
		}
	}		

	
	/**
	 * 	This obtains a boot loader
	 * 
	 * 	This is how the authentication worked during active studies on TED in CSessionManager - it is not used in the Live Teacher public interface.
	 *  It is left here for archival reasons - if you want to allow DB driven loader selection you can implement this again.
	 * 
	 */
	private bootLoaderProtocol() : void 
	{			
		
		switch(_data.protocolState)
		{
			// Authentication is a 2 step process.
			//
			// 1. Authenticate a GROUP ID
			// 2. Authenticate an account within the group collection
			
			// This authenticates a GROUP ID - which assigns an account collection and data collection to the session
			// internally on the server.  Until this is done it is not possible to authenticate further as there is no
			// account collection associated with the session
			
			case "START_BOOT_LOADER":
				
				_data.protocolState = "BOOT_LOADER_RESPONSE";
				
				_logManager.addEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
				
				_logManager.submitJSONQuery({"request_type":"BOOT_SETTINGS", "override":"" });	// TODO: add support for override using  _initFragment from URL														
				break;				
			
			case "BOOT_LOADER_RESPONSE":

				switch(_data.svrResponse.type)
				{						
					case "query":
										
						switch(_data.svrResponse.result)
						{					
							// successful query for a settings record
							case CAuthEvent.SUCCESS:
								
								_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
								
								_userAccount["bootLoader"] = _data.svrResponse;
								
								//##TODO allow this to dynamically update the protocolChain 
								
								// Move to the desired loader state
								
//									currentState  = interfaceJSON.bootLoader.ui;											
//									_sessionState = interfaceJSON.bootLoader.protocol;
								
//									updateInteractiveStateFSM(interfaceJSON.bootLoader.command);							
								
								break;
							
							case CAuthEvent.FAIL:
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.FAIL));
								break;
						}
						break;
					
					// User may click Cancel during operation - This transitons to cancel state - whenever the response comes in it is ignored
					
					case "click":
						
						_data.protocolState = "BOOTLOADER_CANCELLED";							
						break;												
				}
				break;
			
			case "BOOTLOADER_CANCELLED":
				
				switch(_data.svrResponse.type)
				{						
					case "query":	
						
						_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
						
						dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.BOOTLDR_CANCELLED));
						break; 
				}
				break;
		}
	}
	
	
	/**
	 * This manages the panel sequence used to authenticate
	 * 
	 * 	Authentication Sequence Type 1:
	 * 		a) SessionManager has already obtained a BootSettings object and moved us to currentStat LoginC here
	 * 		b) Next we need to use the GroupID entered by the user in LoginC to the group record.
	 * 		c) Then we authenticate a user name against the group user list -  
	 *  
	 * @param evt
	 * 
	 */
	private authGroupProtocol() : void 
	{			
		
		switch(_data.protocolState)
		{
			// Authentication is a 2 step process.
			//
			// 1. Authenticate a GROUP ID
			// 2. Authenticate an account within the group collection
			
			// This authenticates a GROUP ID - which assigns an account collection and data collection to the session
			// internally on the server.  Until this is done it is not possible to authenticate further as there is no
			// account collection associated with the session
			
			case "START_GROUP_AUTH":
				
				_data.protocolState = "AUTH_GROUPID_RESPONSE";
				
				_logManager.addEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
				
				_logManager.submitJSONQuery({"request_type":"GROUP_QUERY", "groupid":_data.grpID.toUpperCase()});					
				break;				
			
			case "AUTH_GROUPID_RESPONSE":
									
				switch(_data.svrResponse.type)
				{						
					case "query":
						
						_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
																				
						switch(_data.svrResponse.result)
						{					
							case CAuthEvent.SUCCESS:
								
								// Record the group data
								_userAccount["group"] = _data.svrResponse;
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.GROUPID_SUCCESS));

								doNextProtocol();
								break;
							
							case CAuthEvent.FAIL:
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.FAIL));
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.GROUPID_FAILED));
								break;												
						}
						break; 
					
					// User may click Cancel during operation - This transitons to cancel state - whenever the response comes in it is ignored
					
					case "click":
						
						_data.protocolState = "AUTH_CANCELLED";							
						break;						
				}
				break;
			
			case "AUTH_CANCELLED":
				
				switch(_data.svrResponse.type)
				{						
					case "query":	
						
						_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
						
						dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.GROUPID_CANCELLED));
						break; 
				}
				break;
		}
	}

	
	/**
	 * This manages the panel sequence used to authenticate
	 * 
	 * 	Authentication Sequence Type 1:
	 * 		a) SessionManager has already obtained a BootSettings object and moved us to currentStat LoginC here
	 * 		b) Next we need to use the GroupID entered by the user in LoginC to the group record.
	 * 		c) Then we authenticate a user name against the group user list -  
	 *  
	 * @param evt
	 * 
	 */
	private authUserPwdProtocol() : void 
	{
		
		switch(_data.protocolState)
		{
			// If we change the server code to a common "grppwd" field then we can eliminate one of these start points - however this will break
			// existing code versions used during trials
			
			case "START_USRID_AUTH":
				
				_data.protocolState = "AUTH_USRPWD_RESPONSE";
				
				_logManager.addEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
				
				_logManager.submitJSONQuery({"request_type":_data.protocolAuth, "user":_data.userID, "groupid":_data.grpID, "protocol_request":_data.protocolNext});					
				break;									
			
			case "START_USRPWD_AUTH":
				
				_data.protocolState = "AUTH_USRPWD_RESPONSE";
				
				_logManager.addEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
				
				_logManager.submitJSONQuery({"request_type":_data.protocolAuth, "user":_data.userID, "pwd":_data.userPW, "groupid":_data.grpID, "protocol_request":_data.protocolNext});					
				break;				
			
			case "AUTH_USRPWD_RESPONSE":
				
				switch(_data.type)
				{						
					case "reauthenticate":
						_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
						
						switch(_data.svrResponse.result)
						{					
							case CAuthEvent.SUCCESS:
								
								try
								{
									dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.AUTH_SUCCESS));
									
									doNextProtocol();
								}
								catch(e:Error)
								{
									dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.FAIL));
									dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.AUTH_FAILED));
									
									_logManager.failSession();																			
								}
								break;
							
							case CAuthEvent.FAIL:
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.FAIL));
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.AUTH_FAILED));
								
								_logManager.failSession();									
								break;						
						}								
						break;
					
					case "authenticate":
						
						_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
						
						switch(_data.svrResponse.result)
						{					
							case CAuthEvent.SUCCESS:
								
								try
								{
									// Record the user data
									_userAccount["userData"] = _data.svrResponse;
									_accountActive 			 = true;
									
									// transition the log manager sessionState to RUNNING
									_logManager.activateSession(_data.svrResponse.sessionid);
									
									dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.AUTH_SUCCESS));
																		
									doNextProtocol();
								}
								catch(e:Error)
								{
									dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.FAIL));
									dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.AUTH_FAILED));
									
									_logManager.failSession();																			
								}
								break;
							
							case CAuthEvent.VALIDATE:
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.VALIDATE));
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.AUTH_FAILED));
								
								_logManager.failSession();
								break;
							
							case CAuthEvent.FAIL:
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.FAIL));
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.AUTH_FAILED));
								
								_logManager.failSession();									
								break;						
						}								
						break;
					
					// User may click Cancel during operation - This transitons to cancel state - whenever the response comes in it is ignored
					
					case "cancel":
						
						_data.protocolState = "AUTH_CANCELLED";							
						break;						
				}
				break;
			
			case "AUTH_CANCELLED":
				
				switch(_data.svrResponse.type)
				{						
					case "query":	
						
						_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
						
						dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.AUTH_CANCELLED));
						break; 
				}
				break;
		}
	}
	
	
	/**
	 * 	This obtains a flex loader
	 * 
	 * 
	 */
	private accountLoaderProtocol() : void 
	{			
		
		switch(_data.protocolState)
		{
			// Authentication is a 2 step process.
			//
			// 1. Authenticate a GROUP ID
			// 2. Authenticate an account within the group collection
			
			// This authenticates a GROUP ID - which assigns an account collection and data collection to the session
			// internally on the server.  Until this is done it is not possible to authenticate further as there is no
			// account collection associated with the session
			
			case "START_ACCOUNT_LOADER":
				
				_data.protocolState = "ACCOUNT_LOADER_RESPONSE";
				
				// Query for the boot loader settings - returns default in DB
				_logManager.addEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
				
				_logManager.submitJSONQuery({"request_type":_data.protocolRequest, "protocol_request":_data.protocolNext});							
				break;				
			
			case "ACCOUNT_LOADER_RESPONSE":
				
				// Note that FlexLoader and StudyLoader do the same thing in this switch - but are separated to emphasis the fact that the data 
				// returned by each is significantly different.
				
				switch(_data.svrResponse.type)
				{						
					case "Flexloader":
						
						switch(_data.svrResponse.result)
						{					
							// successful query for a settings record
							case CAuthEvent.SUCCESS:
								// So we now have the loader and interface for the flex interface 									
								_userAccount["session"] = _data.svrResponse;
								
								_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
																	
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.LOADER_SUCCESS));
								break;
							
							case CAuthEvent.FAIL:
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.FAIL));
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.LOADER_FAILED));
								break;
						}
						break;
					
					case "Studyloader":
						
						switch(_data.svrResponse.result)
						{					
							case CAuthEvent.SUCCESS:
								
								_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
								
								// The load processor in the group document description will build an appropriate loader server-side
								// So we now have the loader along with the progress data for the individual 
								
								_userAccount['session'] = _data.svrResponse;
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.LOADER_SUCCESS));
								break;
							
							case CAuthEvent.FAIL:
								
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.FAIL));
								dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.LOADER_FAILED));
								break;
						}
						break;								
					
					
					// User may click Cancel during operation - This transitons to cancel state - whenever the response comes in it is ignored
					
					case "cancel":
						
						_data.protocolState = "ACCOUNT_LOADER_CANCELLED";							
						break;												
				}
				break;
			
			case "ACCOUNT_LOADER_CANCELLED":
				
				switch(_data.svrResponse.type)
				{						
					case "Flexloader":
					case "Studyloader":
						
						_logManager.removeEventListener(CLogEvent.PACKET_FORWARD, forwardLogProtocol);					
						
						dispatchEvent(new CAuthEvent(CAuthEvent.AUTH_STATUS, CAuthEvent.LOADER_CANCELLED));
						break; 
				}
				break;
		}
	}

	
// RAW data protocol **********************************************
// RAW data protocol **********************************************
// RAW data protocol **********************************************
	

	/**
	 * 	Used to update the account data following the addition of a new class or other modifications to the account.
	 *  
	 */
	private updateProtocol() : void 
	{			
		let dataPacket:Object;
		
		switch(_data.protocolState)
		{
			// Authentication is a 2 step process.
			//
			// 1. Authenticate a GROUP ID
			// 2. Authenticate an account within the group collection
			
			// This authenticates a GROUP ID - which assigns an account collection and data collection to the session
			// internally on the server.  Until this is done it is not possible to authenticate further as there is no
			// account collection associated with the session
			
			case "START_UPDATE":
				
				_data.protocolState = "UPDATE_RESPONSE";
				
				_logManager.connectProtocol(forwardDataProtocol);					
				
				_mongoPacket = CMongo.queryPacket(_source, CMongo.FIND, _collection, {"_id":_usrID}, {}); 
				
				_logManager.sendPacket(_mongoPacket);					
				break;				
			
			case "UPDATE_RESPONSE":
				
				try
				{
					_logManager.disConnectProtocol(forwardDataProtocol);
					
					dataPacket = JSON.parse(_data.svrResponse);
					
					// Ensure the packet is for us.
					
					if(dataPacket.source == _source)
					{						
						switch(dataPacket.result)
						{				
							case "OK":
								
								processProtocolPass(dataPacket);			// Polymorphic pass processing 
								break;
							
							case "fail":
								
								processProtocolFail(dataPacket);			// Polymorphic fail processing 
								break;
							
							default:
								
								if(traceMode) trace("updateProtocol Responded: " + _data.svrResponse);
								break;					
						}
					}
					else
					{
						if(traceMode) trace("updateProtocol Responded: " + _data.svrResponse);
					}
					
				}
				catch(err:Error)				
				{
					if(traceMode) trace("updateProtocol - Message Format Error: " + err.tostring());
				}
				break;				
		}
	}

	
	/**
	 * 	Allow polymorphic pass management
	 * 	
	 */
	protected processProtocolPass(dataPacket:Object ) : void
	{			
		try
		{
			switch(dataPacket.command)
			{
				case CMongo.ACK_FIND:

					_userAccount["userData"]["account"] = dataPacket.document;
					
					dispatchEvent(new CPortal_Event(CPortal_Event.PORTAL_EVENT, CPortal_Event.CLASSLIST_UPDATED));						
					break;
				
				case CMongo.ACK_INSERT:
					break;
				
				case CMongo.ACK_UPDATE:						
					break;
				
				case CMongo.ACK_UPSERT:
					break;
				
				case CMongo.ACK_RECOVER:
					break;
				
				case CMongo.ACK_RECYCLE:
					break;
				
				case CMongo.ACK_REMOVE:
					break;								
			}							
		}
		catch(err:Error)				
		{
			if(traceMode) trace("adminProtocol - Message Format Error: " + err.tostring());
		}
	}		
	
	
	/**
	 * 	Allow polymorphic fail management
	 * 	
	 */
	protected processProtocolFail(dataPacket:Object ) : void
	{			
		try
		{
			switch(dataPacket.command)
			{
				case "unknown":
					break;
				
				case CMongo.ACK_FIND:
					break;
				
				case CMongo.ACK_INSERT:
					break;
				
				case CMongo.ACK_UPDATE:
					break;
				
				case CMongo.ACK_UPSERT:
					break;								
				
				case CMongo.ACK_RECYCLE:
					
					break;
				
				case CMongo.ACK_REMOVE:
					// Cancel further deletes
					
					//						_deleteItemNdx = -1;
					//						_deleteNdx = null;
					
					break;								
			}							
		}
		catch(err:Error)				
		{
			if(traceMode) trace("adminProtocol - Message Format Error: " + err.tostring());
		}
	}		
}

// class at file scope

class SingletonObj
{
//nothing else required here
}


