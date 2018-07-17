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

//** imports

import { CLoadablePackage } from "./CLoadablePackage";
import { CLoadableModule }  from "./CLoadableModule";
import { CAuthenticator }   from "./CAuthenticator";
import { CLogManager }      from "./CLogManager";

import { CAuthEvent }       from "../events/CAuthEvent";
import { CLogEvent }        from "../events/CLogEvent";

import { CURLLoader }       from "../network/CURLLoader";

import { ILogManager }      from "../managers/ILogManager";
import { CLogManagerType }  from "../managers/CLogManagerType";

import { CUtil }            from "../util/CUtil";
import { CIOErrorEvent }    from "../events/CIOErrorEvent";
import { CURLRequest }      from "../network/CURLRequest";



export class CSessionManager 
{
            
    private _useHeadPhoneCheck:boolean = false;		// initialized from loader spec
    private _useSoundCheck:boolean 	   = false;		// initialized from loader spec	
    private _useFullScreen:boolean     = false;		// initialized from loader spec
    
    private _forceFullScreen:boolean = true;		// Set this to true to force fullscreen mode
    private _sndCheckDone:boolean 	 = true;		// Set this to true to bypass sound checks

    private _loadablePackage:CLoadablePackage = new CLoadablePackage();
    private _loadableModule:CLoadableModule   = null;		
    
    // This is the loaded FLASH tutor instance
    
    private _tutorObject:any;
    private _sceneGraphXML:any;
    private _sceneDescrXML:any;
    private _sceneGraphJSON:any;
    private _tutorGraphJSON:any;
            
    // For Browser Manager info see --- http://help.adobe.com/en_US/flex/using/WS2db454920e96a9e51e63e3d11c0bf64e50-7ff4.html
    
    private _urlObject:Object;
    private _bootLoader:string = "LOCAL";			// This is either LOCAL or REMOTE
    private _bootUI:string;							// If bootLoader is LOCAL - this is the startup UI panel
    
    private _logManager:ILogManager;

    private _Authenticator:CAuthenticator;
    
    //		
    // Sessions can be in one of several finite states.  It listens to the this._logManager to 
    // determine state transitions. 
    //
    // SESSION_UNAUTHENTICATED:
    //  This state is the initial state before the user has signed-in to their account
    //  In this state the system is placed into full-screen mode and the sign-in
    //  dialog is presented to the user.
    //  
    // SESSION_AUTHENTICATING:
    //  The system is waiting for and acknowledgement from the server 
    //
    // SESSION_AUTHENTICATED:
    //   The system has authenticated the user.  
    //   The interface is loaded and the instruction begins. 
    //
    // SESSION_TERMINATED:
    //   Normal instruction termination - 
    //   The instruction transmits a terminate packet to the server which responds with a 
    //   termAck sequence to allow the client to close its connection permanently
    //   On receipt of the term packet the server closes the context and flags it as complete.
    //   Reconnection or further data is ignored.
    //
    //  SESSION_INTERRUPTED
    //	 An unexpected event has caused the connection to fail.  The logmanager should reattempt 
    //   connection.
    //
    
    private _sessionState:string    = CSessionManager.SESSION_INITIALSTATE;
    private _oldSessionState:string = CSessionManager.SESSION_INITIALSTATE;
    private _oldcurrentState:string;

    private static readonly SESSION_INITIALSTATE:string 		= "session_initialstate";
    
    private static readonly SESSION_BOOTSETTINGS_REQUEST:string = "session_bootsettings_request";
            
    private static readonly SESSION_UNAUTHENTICATED:string 	    = "session_unauthenticated";
    private static readonly SESSION_AUTH_GROUPID:string		    = "SESSION_AUTH_GROUPID";
    private static readonly SESSION_AUTH_STUDY:string			= "SESSION_AUTH_STUDY";		
    private static readonly SESSION_AUTH_USERPWD:string		    = "SESSION_AUTH_USERPWD";
    private static readonly SESSION_DEMO:string				    = "SESSION_DEMO";
    private static readonly SESSION_PUBLIC_PORTAL:string		= "SESSION_PUBLIC_PORTAL";
    private static readonly SESSION_AUTH_ADMIN:string			= "SESSION_AUTH_ADMIN";
    
    private static readonly SESSION_AUTHENTICATING:string  	    = "session_authenticating";		
    private static readonly SESSION_AUTHENTICATED:string   	    = "session_authenticated";
    private static readonly SESSION_INITIALIZED:string			= "session_initialized";
    private static readonly SESSION_LOADING:string				= "session_loading";
    private static readonly SESSION_LOAD:string				    = "session_load";
    private static readonly SESSION_STUDYLOADER_REQUEST:string	= "SESSION_STUDYLOADER_REQUEST";
    private static readonly SESSION_QUERY_BOOTLOADER:string     = "SESSION_QUERY_BOOTLOADER";
    
    private static readonly SESSION_OPEN_CHANNEL:string		    = "session_open_channel";
    
    private static readonly SESSION_START:string				= "session_start";
    private static readonly SESSION_HEADPHONECHECK:string		= "session_headphonecheck";
    private static readonly SESSION_SOUNDCHECK:string			= "session_soundcheck";
    
    private static readonly SESSION_FULLSCREENCHECK:string		= "session_fullscreencheck";
    private static readonly SESSION_FULLSCREENPROMPT:string	    = "session_fullscreenprompt";
    private static readonly SESSION_ALLOWFULLSCREEN:string		= "session_allowfullscreen";
    private static readonly SESSION_ENTERFULLSCREEN:string		= "session_enterfullscreen";
    
    private static readonly SESSION_INPROGRESS:string			= "session_inprogress";
    private static readonly SESSION_INTERRUPTED:string     	    = "session_interrupted";	
    private static readonly SESSION_RESUMED:string		     	= "session_resumed";	
    private static readonly SESSION_TERMINATED:string      	    = "session_terminating";
    private static readonly SESSION_FLUSHING:string			    = "SESSION_FLUSHING";
                    
    private _enableConnectionManager:boolean      		= false;
    private _enableConnectionManagerUser:boolean  		= false;
    private _enableConnectionManagerDebug:boolean 		= false;
    
    private static readonly CONNECTION_MANAGER:string 			= "connectionmanager";	
    private static readonly CONNECTION_DEBUG:string   			= "connectiondebugger";	
    private static readonly CONNECTION_DISABLE:string 			= "connectiondisable";	
    
    private traceMode:boolean = true;
    private _inTutor:boolean = false;

    private _bootSource:string;						// Whether we are using webserver files or db queries for boot info 
    
    private _loader:any;
    private _phase:any;
    private _features:any;
    private _spellerLdr:any;
    private _libraryLdr:any;
    private _moduleLdr:any;
    private _interfaceLdr:any;
    
    private _account:any;
    
    private remoteMode:boolean = false;
    
    private libPath:string;
    private modPath:string;
    // private RSLs:Array<SWFLoader> = new Vector.<SWFLoader>;

    private fileLoader:CURLLoader;
    private LOADER_URL:string = "./loader.json";
    
    private interfaceJSON:any;
    private _accountMode:string;
    private _stateInited:boolean = false;
    
    // reconnection support
    private pProtocolNext:string;
    private pProtocolState:string;
    
    
    // Google Analytics support
    
    private _tracker:any;//AnalyticsTracker;
    private _trackerDebug:boolean = false;
            
    public static readonly WOZLIVE:string	= "WOZLIVE";
    public static readonly WOZREPLAY:string	= "WOZREPLAY";		

    // Make initFragment available to all 
    
    public static _initFragment:string;					// Loader override support
    
    
    
    
    /**
     * It all starts here
     * This is the root panel manager for the tutorLoader system.
     */
    public CSessionManager()
    {                    
        // Attach to the logManager instance and start listening for session protocol events.
        
        this._logManager = new CLogManager({});
        this._logManager = CLogManager.getInstance();

        // Get singleton authentication object
        
        this._Authenticator = CAuthenticator.getInstance();

        
//*#*#*#  See TutorLoader-config.xml		
//##@@ 	- Used for development ONLY - Forces localhost binding for database - overrides DDNS 

        if(CONFIG_localhost)
            this._logManager.useLocalHost();					
    
        
        // If this is being downloaded as an on demand component then 
        // We need to wait to initialize children until the object is instantiated 
        //
        addEventListener(Event.PREINITIALIZE, this.preInitialize);  
        addEventListener(Event.CREATION_COMPLETE, this.creationCompleteHandler);  
        addEventListener(Event.ADDED_TO_STAGE, this.onStageHandler);						
        addEventListener(Event.CURRENT_STATE_CHANGE, this.this.currentStateChanged );			
    }


    /**
     *  Setup any URL override of the default state prior to UIComponent child creation which
     *  occurs in the initialize phase.
     */
    private preInitialize(e:Event):void
    {								
        removeEventListener(Event.PREINITIALIZE, this.preInitialize);
        
        this.browserInitializer();
    }
    
    
    /**
     * As soon as we are created we init the browser manager to discourage back button events 
     * and immediately start loading the interface XML (JSON) spec
     * 
     * @param event
     */
    private creationCompleteHandler(event:Event):void
    {		
        removeEventListener(Event.CREATION_COMPLETE, this.creationCompleteHandler);
                                
        // If there is no URL override of the initial state load the interface XML | JSON specification file from the server
        // If this fails we try and get it from the DB service - interfaceSpecErrorHandler
        // TODO: Currently this is legacy code but should be updated to allow JSON file based operation without DB  
        
        if(this._initFragment == "")
        {
            this.fileLoader = new CURLLoader;
            this.fileLoader.addEventListener(Event.COMPLETE, this.interfaceSpecLoaded);
            this.fileLoader.addEventListener(CIOErrorEvent.IO_ERROR, this.interfaceSpecErrorHandler);
            this.fileLoader.load(new CURLRequest(this.LOADER_URL);
        }
    }
    

    /**
     * When we go on stage we init Google Analytics and disable the right mouse button
     * 
     * @param event
     */
    private onStageHandler(event:Event):void
    {
        removeEventListener(Event.ADDED_TO_STAGE, this.onStageHandler);
        
        // Throw away all right click events - 
        
        addEventListener(MouseEvent.RIGHT_CLICK, this.rightClickHandler);		
        
        // TODO: Start - Google Analytics support
        
        // _tracker = new GATracker( this, "UA-18104655-2", "AS3", _trackerDebug );
        
        // if(_trackerDebug)
        // {
        //     _tracker.debug.verbose = true;
        //     _tracker.debug.mode = VisualDebugMode.advanced;
        //     _tracker.debug.traceOutput = true;
        //     _tracker.debug.GIFRequests = true;
        // }
        
        // _tracker.trackPageview( "/ted" );
        
        // End - Google Analytics support
        
        // start listening to keyboard for connectionManager special key combinations
        
        stage.addEventListener(KeyboardEvent.KEY_DOWN, this.checkCommandKeyHdlr);			
    }		
    
    
    /**
     *  Note: this.currentState is called as part of the construction process but after the constructor is complete.
     * 	      this.currentState is not validated (commitcurrentState) until the UIComponent is "initialize"d  which happens just prior to
     *        Event.CREATION_COMPLETE.
     * 		  We want this.currentState to be correct before the children are created in "initialize" so we need
     *        to do browser initialization in the PreInitialize phase to get the browser fragment
     * 
     *  @private 
     */
    public set currentState(value:string)
    {
        this.this.currentState = value;
        
        // This is called when the object is created to init the state - we ignore this 
        // so we don't change the URL fragment for this default action.
        //
        if(initialized)
            this.changeURLFragment(value);
    }
    
    
    /**
     * This is here to allow us to inject a predefined URL pattern for testing.
     * 
     */
    private browserInitializer() : void
    {
        // BROWSER Manager debugging 			
        // BROWSER Manager debugging 			
        // BROWSER Manager debugging
        
        // Init the browser manager from the singleton
        
        let urlObject:Object = {};
        
        // e.g. simulate following URL			
        //http://go.tedtutor.org/#home=pubPortal;pubPortal=Student_SignIn;classid=OOL-PAU-SGO
        //http://go.tedtutor.org/#home=pubPortal;pubPortal=Student_SignIn;classid=YNH-NIN-BDO
        //http://go.tedtutor.org/#home=pubPortal;pubPortal=Student_SignIn;classid=IGA-SKF-ABF
        //http://go.tedtutor.org/#home=pubPortal;pubPortal=Student_SignIn;classid=PIL-JMT-GKS
        //http://go.tedtutor.org/#home=pubPortal;pubPortal=Student_SignIn;classid=CWJ-SLI-DAQ
                                
        // e.g. simulate following URL			
        //http://go.tedtutor.org/#home=pubPortal;pubPortal=Account_Validate;user=kevinwillows@gmail.com;validation=VDHETLGUIGGIJKSQYLJXFDMUWVBVGQBT
        //http://go.tedtutor.org/#home=pubPortal;pubPortal=Account_Lockout;user=kevinwillows@gmail.com;validation=BXWBVAUOGWVNWILGAYGIBTPHSOVVWSLF

        // VALIDATE *******************
//			urlObject.home		= 'pubPortal';	
//			urlObject.pubPortal = 'Account_Validate';
//			urlObject.user   	= 'kevinwillows@gmail.com';
//			urlObject.validation= 'UOPJRLDRTMULXIDTYKRQVIHCMWWLQPPK';

        // LOCKOUT *******************
//			urlObject.home		= 'pubPortal';	
//			urlObject.pubPortal = 'Account_Lockout';
//			urlObject.user   	= 'kevinwillows@gmail.com';
//			urlObject.validation= 'BXWBVAUOGWVNWILGAYGIBTPHSOVVWSLF';
        
        //CLASSLINK *******************
        // urlObject.home		= 'pubPortal';	
        // urlObject.pubPortal = 'Student_SignIn';
        // urlObject.classid   = 'PIL-JMT-GKS';			// Format 'MZF-ADT-UXY'
        
        // let newFragment:string = URLUtil.objectToString(urlObject);
        
        
//*#*#*#  See TutorLoader-config.xml
//
//##@@ 	- Used to override Fragment Debug Mode - Development
//			
//*#*#*#  ref: http://help.adobe.com/en_US/flex/using/WS2db454920e96a9e51e63e3d11c0bf67670-7ff2.html
        
        // if(!CONFIG::FragmentDebug)
        //     newFragment = "";
                    
        // // instantiate the browser manager
        
        // this.initBrowserMan(newFragment);			
    }
    
    
    private initBrowserMan(newFragment:string) : void
    {
        // let urlObject:Object;
        
        // // Init the browser manager from the singleton
        // _browserManager = BrowserManager.getInstance();
        
        // // This is required prior to acquiring the initfragment otherwise it will return ""
        // // If init finds a fragment it will fire browserURLchange - this will potentially result
        // // in a call to this.currentState to reflect the URL
        // //
        // _browserManager.addEventListener(BrowserChangeEvent.BROWSER_URL_CHANGE, browserURLchange);			
        // _browserManager.init(newFragment, "Welcome to TED!");
        
        // // When debugging we pass a populated newFragment - however browserManager.init will not dispatch an update
        // // event in this case. So we do it manually.
        
        // if(newFragment != "")			//@@ active in debug only - i.e. when newFragment != ""
        // {
        //     browserURLchange(null);
        // }
        
        // // Record initial loader override
        // //
        // this._initFragment = _browserManager.fragment;
                    
        return;
    }
    
    
    /**
     *  This is Dispatched when the URL is changed by the browser - back / next / manually
     * 
     */
    // private browserURLchange(evt:BrowserChangeEvent) : void
    // {
    //     let urlObject:Object;
        
    //     CUtil.trace("browserURLchange:" + _browserManager.fragment);
        
    //     // If we are in the tutor We want to backup into the pubPortal
        
    //     if(this._inTutor)
    //     {
    //         this._inTutor     = false;
    //         this.currentState = "pubPortal";
            
    //         this._Authenticator.abandonConnection();
    //     }
    //     else
    //     {
    //         parseURL();
    //     }
    // }
    
    
    // private parseURL() :boolean
    // {
    //     let successFlag:boolean = false;
    //     let urlObject:Object;
        
    //     //**** iniitalize the page from the browser URL fragment if extant
        
    //     if(_browserManager.fragment != "")
    //         urlObject = URLUtil.stringToObject(_browserManager.fragment);
    //     else
    //         urlObject = {};
        
    //     if(urlObject.demo)
    //     {
    //         switch(urlObject.demo)
    //         {
    //             case "pretest":
    //                 this._Authenticator.groupID = "GO_GUEST";					
    //                 this._Authenticator.userPW  = "GO_GUEST";
    //                 this._Authenticator.userID  = "PREASSESS";
                    
    //                 this._Authenticator.addEventListener(CAuthEvent.AUTH_STATUS, sessionHandler);
                    
    //                 this._Authenticator.authUser();
    //                 break;
                
    //             case "posttest":
    //                 this._Authenticator.groupID = "GO_GUEST";					
    //                 this._Authenticator.userPW  = "GO_GUEST";
    //                 this._Authenticator.userID  = "POSTASSESS";
                    
    //                 this._Authenticator.addEventListener(CAuthEvent.AUTH_STATUS, sessionHandler);
                    
    //                 this._Authenticator.authUser();
    //                 break;
                                    
    //             case "assess":
    //                 this._Authenticator.groupID = "GO_GUEST";					
    //                 this._Authenticator.userPW  = "GO_GUEST";
    //                 this._Authenticator.userID  = "ASSESS";
                    
    //                 this._Authenticator.addEventListener(CAuthEvent.AUTH_STATUS, bootSessionHandler);
                    
    //                 this._Authenticator.authUser();
                    
    //                 successFlag  = true;
    //                 break;
                
    //             case "tutor":
    //                 this._Authenticator.groupID = "GUEST";					
    //                 this._Authenticator.userPW  = "GUEST";
    //                 this._Authenticator.userID  = "TUTOR";
                    
    //                 this._Authenticator.addEventListener(CAuthEvent.AUTH_STATUS, bootSessionHandler);
                    
    //                 this._Authenticator.authUser();
                    
    //                 successFlag  = true;
    //                 break;
    //         }				
    //     }
            
    //     else if(urlObject.home)
    //     {
    //         switch(urlObject.home)
    //         {
    //             case "pubPortal":
    //                 this.currentState = "pubPortal";
    //                 successFlag  = true;
    //                 break;
                
    //             case "loginAdmin":						
    //                 this.currentState = "loginAdmin";
    //                 successFlag  = true;
    //                 break;
                
    //             case "tutorLoader":
    //                 this.currentState = "tutorLoader";
    //                 this._sessionState = urlObject.protocol;					// SESSION_AUTH_USERPWD	 OR SESSION_AUTH_GROUPID						
    //                 updateInteractiveStateFSM(urlObject.command);		// GET_USER_PWD		OR GET_GROUP_ID
                    
    //                 successFlag  = true;
    //                 break;
                
    //             default:
    //                 break;
    //         }	
    //     }			
        
    //     // update the browser history - 
    //     // FireFox - Navigation clicks are caught by browserURLChange
    //     // IE      - Navigation clicks are caught by browserURLChange
    //     // Chrome  - We buffer up 50 entries to keep them from using the back button
    //     //			 They will not get an error message
    //     // 
    //     //			for(let i1:number = 0 ; i1 < 10 ; i1++)
    //     //				_browserManager.setFragment("TED"+(i1%2));
        
    //     return successFlag;
    // }

    
    /**
     *   This is used to update the URL frament in the address bar of the browser
     *   Once the component is init'd, changing the this.currentState will cause this to 
     *   reflect the state on the browser for state where we wish the user to be 
     *   able to navigate to with browser History (back / next).
     * 
     */
    // private changeURLFragment(newPortal:string) : void 
    // {
    //     let urlObject:Object;
    //     let newFragment:string;
        
    //     if(this.traceMode) CUtil.trace("changeURLFragment:=" + newPortal);
        
    //     if(_browserManager.fragment != "")
    //         urlObject = URLUtil.stringToObject(_browserManager.fragment);
    //     else
    //         urlObject = {};
        
    //     urlObject.home = newPortal;
        
    //     newFragment = URLUtil.objectToString(urlObject);
        
    //     _browserManager.setFragment(newFragment);						
    // }
    
    
    private bootSessionHandler(evt:CAuthEvent) : void
    {
        switch(evt.subType) 
        {
            case CAuthEvent.LOADER_SUCCESS:
                // instantiate the browser manager update the title in the browser tab
                
                // _browserManager.init("demo", "Welcome to TED!");			
                
                this._inTutor      = true;
                this._sessionState = CSessionManager.SESSION_START;
                
                // Load the session UI
                this.updateInteractiveStateFSM();
                break;
            
            case  CAuthEvent.FAIL:							
                // instantiate the browser manager update the title in the browser tab
                
                // _browserManager.init("pubPortal", "Welcome to TED!");			
                
                this.currentState = "pubPortal";
                break;				
        }
    }
    
    
    /**
     *   Once the Interface spec is loaded we start the session state-machine
     *   NOTE: this is deprecated but should be updated to allow config file based operation 
     * 
     */
    private interfaceSpecLoaded(evt:Event):void
    {
        this.fileLoader.removeEventListener(Event.COMPLETE, this.interfaceSpecLoaded);
        this.fileLoader.removeEventListener(CIOErrorEvent.IO_ERROR, this.interfaceSpecErrorHandler);
                    
        try
        {
            this.interfaceJSON = JSON.parse(this.fileLoader.data);
            
            // Extract the local / remote operating mode
            
            this._accountMode = this.interfaceJSON.bootLoader.accountMode; 		
            this._bootSource  = "FILE";
        }
        catch(e)
        {
            CUtil.trace(e);
            alert("JSON Syntax Error in Loader");
        }				
        
        if(this.this.traceMode) CUtil.trace("Data loaded: ", this.interfaceJSON);				
        
        // Determine the startup panel
        this.initBootLoader();
    }
    
    
    /**
     * Interface spec unavailable - attempt to get spec from server
     * 
     * Entering upateIntereactiveState with interfaceJSON as null will inititate the SESSION_BOOTSETTINGS_REQUEST
     * to obtain a flex loader sequence - i.e. it defines a start "this.currentState" for the interface that defines
     * a login protocol. 
     * 
     */
    private interfaceSpecErrorHandler(evt:Event) : void
    {
        this.fileLoader.removeEventListener(Event.COMPLETE, this.interfaceSpecLoaded);
        this.fileLoader.removeEventListener(CIOErrorEvent.IO_ERROR, this.interfaceSpecErrorHandler);
        
        this._bootSource  = "DB";		
        
        // Determine the startup panel
        this.initBootLoader();
        
    }
    
    /**
     *   We never get here if there is a URL override fragment passed in the browser
     * 
     */
    private initBootLoader() : void
    {			
        // Then if we are hard coded for remote bootloader resolution - get it from the server
        
        if(this._bootLoader == "REMOTE")
        {					
            // Initial call to start the sessionState machine
            
            this.updateInteractiveStateFSM();
        }
            
            // Otherwise use the hard coded start up panel.
            
        else
        {
            // instantiate the browser manager update the title in the browser tab
                                
            this.currentState = "pubPortal";
        }
    }
    
    
    /**
     *  These events update the interface to reflecct changes to the authetication process
     *  i.e. a switch to admin authentication
     *  
     * 	This may receive any of the following messages
     * 		
     * 		CAuthEvent.GROUPID_SUCCESS
     * 		CAuthEvent.GROUPID_FAILED
     * 		CAuthEvent.AUTH_SUCCESS
     * 		CAuthEvent.AUTH_FAILED
     * 
     */
    private authenticationProtocol(evt:CAuthEvent) : void
    {
        // Depending upon the session status we handle authenticaion messages differently
        //
        //	A: When starting a new session authentication comes in multiple steps
        //	B: When reconnecting Authentication is done in a single step quietly without a UI
        //	   using the information gathered during the initial login sequence	
        //
        switch(this._logManager.sessionStatus)
        {								
            case CLogManager.SESSION_START:
                
                this.updateInteractiveStateFSM(evt.subType, evt, evt.dataPacket );
                
                break;
            
            case CLogManager.SESSION_INTERRUPTED:

                switch(evt.subType)
                {
                    case CAuthEvent.AUTH_SUCCESS:
                        
                        // transition the log manager sessionState to RUNNING
                        this._logManager.activateSession();
                        
                        // restart the Queue stream  
                        
                        this._logManager.setQueueStreamState(true);
                        
                        this._Authenticator.removeEventListener(CAuthEvent.AUTH_STATUS, this.authenticationProtocol);					
                        
                        break;
                    
                    case CAuthEvent.AUTH_FAILED:
                        
                        // If it fails we teardown the socket and retry - assuming there was a transmission error
                        // Note: this hsould never fail as we are reauthenticating with credentials that worked previously
                        
                        this._logManager.recycleConnection(false);
                        
                        break;					
                }

                break;
            
            default:
                break;
        }					
    }
    
    
    /**
     *  Events occuring in the logManager connection state can alter the UI state machine
     *  
     * This may receive any of the following messages
     * 
     *	CLogEvent.SESSION_TERMINATED
        *  CLogEvent.SESSION_FLUSHED
        *  
        */
    private sessionProtocol(evt:CLogEvent) : void
    {			
        // Connection specific messages come through this listener.
        // We look for disconnects - to support auto reconnect 
        
        this.updateInteractiveStateFSM(evt.subType, evt, evt.dataPacket );
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
    private connectionProtocol(evt:CLogEvent ) : void
    {
        let authMsg:XML;
        let authStr:string;
        
        CUtil.trace(evt.subType);			
        
        // We keep watching the connection status even after sending authentication requests
        // in case the channel fails.  But always scrap the authenticationProtocol if anything
        // happens to the connection prior to full authentication.
        
        switch(evt.subType)
        {
            case CLogEvent.CONNECTION_OPEN:
                
                switch(this._logManager.sessionStatus)
                {								
                    case CLogManager.SESSION_START:
                        
                        this.updateInteractiveStateFSM(CSessionManager.SESSION_QUERYthis._bootLoader );

                        // Start watching for special key code combinations that elicit the connectionManager
                        
                        stage.addEventListener(KeyboardEvent.KEY_DOWN, this.checkCommandKeyHdlr);
                        
                        break;
                    
                    case CLogManager.SESSION_INTERRUPTED:
                        
//							SauthenticationManager.protocolNext  = pProtocolNext;
//							SauthenticationManager.protocolState = pProtocolState;
                        
                        this._Authenticator.addEventListener(CAuthEvent.AUTH_STATUS, this.authenticationProtocol);					
                        this._Authenticator.authForReconnect();
                        
                        break;
                    
                    default:
                        break;
                }					
                break;
            
            
            case CLogEvent.CONNECTION_CLOSED:
                
                switch(this._logManager.sessionStatus)
                {
                    case CLogManager.SESSION_START:
                                                    
                        //Alert.show("Check Network Connection and retry", "Error: Connection Attempt Failed");
                        
                        break;
                    
                    // If the session is still runnning we attempt to do reconnections quietly (no UI) so as 
                    // not to interrupt the instruction.  We do this continually until session termination
                    // where we can pop-up a dialog for further intervention.
                    
                    case CLogManager.SESSION_INTERRUPTED:
                        
                        // stop the Queue stream until we reconnect 
                        
                        this._logManager.setQueueStreamState(false);						
                        
                        this._logManager.connectToReattach();
                        break;
                    
                    default:
                        break;
                }
                break;

            
            case CLogEvent.CONNECTION_TERMINATED:					
                break;
            
            case CLogEvent.DDNS_FAILED:
                
                alert("DDNS Lookup Failed!" + "Error: Server Configuration Error");
                
                break;
            
            
            default:					
                break;
        }			
    }		
    
    
    /**
     *  The session state-machine
     * 
     */
    private updateInteractiveStateFSM(cmd:string = "", evt:any = null, dataPacket:any = null ) : void
    {
                    
        switch(this._sessionState)
        {										
            case CSessionManager.SESSION_START:
                
                // The load processor in the group document description will build an appropriate loader server-side
                // So we now have the loader along with the progress data for the individual 

                this._account      = this._Authenticator.userAccount;		
                this._loader       = this._account.session.this._loader;
                this._interfaceLdr = this._account.session.this._loader._xface;
                
                switch(this._loader.domain)
                {
                    case 'flex':							
                        this._sessionState = CSessionManager.SESSION_LOADING;
                        
                        this.updateInteractiveStateFSM(CSessionManager.SESSION_LOAD);
                        break;
                    
                    case 'flash':							
                        try
                        {
                            this._phase        = this._account.session.profile.this._phase;
                            this._features     = this._account.session.this._features;
                            
                            this._moduleLdr    = this._loader._module;
                            this._spellerLdr   = this._loader._speller;
                            this._libraryLdr   = this._loader._library;
                            
                            this._useHeadPhoneCheck = this._interfaceLdr.hpcheck;
                            this._useSoundCheck	   = this._interfaceLdr.sdcheck;
                            this._useFullScreen     = this._interfaceLdr.fscheck;
                        }
                        catch(e:Error)
                        {
                            CUtil.trace(e);
                            alert("Loader Spec Invalid - JSON Syntax Error in Account Record" + "Error");
                        }					
                                                    
                        // Move to the desired loader state
                        
                        this._sessionState = CSessionManager.SESSION_HEADPHONECHECK;								
                        this.updateInteractiveStateFSM(CSessionManager.SESSION_HEADPHONECHECK);
                        break;
                }
                break;				
            
            
            case CSessionManager.SESSION_HEADPHONECHECK:		// waiting for initial user click to confirm headphones ready 	
                
                switch(cmd)
                {
                    case CSessionManager.SESSION_HEADPHONECHECK:
                        
                        if(this._useHeadPhoneCheck)
                        {
                            this.currentState="headPhoneCheck";
                        }
                        else 
                        {
                            this._sessionState = CSessionManager.SESSION_SOUNDCHECK;					
                            this.updateInteractiveStateFSM(CSessionManager.SESSION_SOUNDCHECK);
                        }								
                        break;
                    
                    case CSessionManager.SESSION_SOUNDCHECK:
                        
                        this._sessionState = CSessionManager.SESSION_SOUNDCHECK;									
                        this.updateInteractiveStateFSM(CSessionManager.SESSION_SOUNDCHECK);
                        
                        break;						
                }
                break;
            
            
            case CSessionManager.SESSION_SOUNDCHECK:		// waiting for sound check
                
                // as soon as we flip to fullscreen interactive we need to set the prompt
                // to ensure the user clicks the allow button
                
                switch(cmd)
                {
                    case CSessionManager.SESSION_SOUNDCHECK:
                        
                        if(this._useSoundCheck)
                        {
                            this.currentState="soundCheck";
                        }
                        else 
                        {
                            this._sessionState = CSessionManager.SESSION_FULLSCREENCHECK;								
                            this.updateInteractiveStateFSM(CSessionManager.SESSION_FULLSCREENCHECK);
                        }								
                        break;						
                    
                    case CSessionManager.SESSION_ENTERFULLSCREEN:
                        
                        this._sessionState = CSessionManager.SESSION_FULLSCREENPROMPT;								
                        this.updateInteractiveStateFSM(CSessionManager.SESSION_ENTERFULLSCREEN);
                        
                        break;							
                }
                break;

            // If we don't have sound or headphone checks we need a separate scene to "click on"
            // as Flash will disallow mode changes that aren't the result of a click
            // 
            case CSessionManager.SESSION_FULLSCREENCHECK:		
                
                // as soon as we flip to fullscreen interactive we need to set the prompt
                // to ensure the user clicks the allow button
                
                switch(cmd)
                {
                    case CSessionManager.SESSION_FULLSCREENCHECK:
                        
                        if(this._useFullScreen)
                        {
                            if((!this._useSoundCheck) && (!this._useHeadPhoneCheck))							
                            {
                                this.currentState="noSoundFullScreen";
                            }
                            else 
                            {
                                this._sessionState = CSessionManager.SESSION_FULLSCREENPROMPT;								
                                this.updateInteractiveStateFSM(CSessionManager.SESSION_ENTERFULLSCREEN);
                            }
                        }
                        else 
                        {
                            this._sessionState = CSessionManager.SESSION_LOADING;								
                            this.updateInteractiveStateFSM(CSessionManager.SESSION_LOAD);		
                        }								
                        break;						
                    
                    case CSessionManager.SESSION_ENTERFULLSCREEN:
                        
                        this._sessionState = CSessionManager.SESSION_FULLSCREENPROMPT;								
                        this.updateInteractiveStateFSM(CSessionManager.SESSION_ENTERFULLSCREEN);
                        
                        break;							
                }
                break;
            
            
            case CSessionManager.SESSION_FULLSCREENPROMPT:	// waiting for user to accept full screen interactive mode
                
                // as soon as we flip to fullscreen interactive we need to set the prompt
                // to ensure the user clicks the allow button
                
                switch(cmd)
                {
                    case CSessionManager.SESSION_INTERRUPTED:						// exit from full screen
                        this._oldthis.currentState = this.currentState;
                        this.currentState     = "exitedFullScreen";
                        this._oldSessionState = this._sessionState;
                        this._sessionState    = CSessionManager.SESSION_INTERRUPTED;
                        break;							
                    
                    case CSessionManager.SESSION_RESUMED:
                        break;
                        
                    case CSessionManager.SESSION_ENTERFULLSCREEN:
                        
                        if(this._useFullScreen)
                        {																
                            this.currentState="allowFullScreen";
                            
                            // NOTE: do this after setting state to avoid screen flash
                            stage.displayState = StageDisplayState.FULL_SCREEN_INTERACTIVE;								
                        }
                        else 
                        {
                            this._sessionState = CSessionManager.SESSION_LOADING;								
                            this.updateInteractiveStateFSM(CSessionManager.SESSION_LOAD);		
                        }								
                        break;			
                    
                    case CSessionManager.SESSION_ALLOWFULLSCREEN:
                        
                        this._sessionState = CSessionManager.SESSION_LOADING;								
                        this.updateInteractiveStateFSM(CSessionManager.SESSION_LOAD);		
                        
                        break;
                }					
                break;

            
            case CSessionManager.SESSION_LOADING:
                
                    switch(cmd)
                    {
                        case CSessionManager.SESSION_INTERRUPTED:						// exit from full screen
                            CUtil.trace("exiting full screen");
                            
                            this._oldthis.currentState = this.currentState;
                            this.currentState     = "exitedFullScreen";
                            this._oldSessionState = this._sessionState;
                            this._sessionState    = CSessionManager.SESSION_INTERRUPTED;
                            break;							
                        
                        // Load interrupted

                        case CSessionManager.SESSION_LOAD:
                            
                            //addEventListener(Event.ENTER_FRAME, initApp);
                                                            
                            this.initApp(null);
                            
                            break;													
                        
                        
                        case CSessionManager.SESSION_RESUMED:

                            // If the load completed in the background - Add the Flash Tutor to the container
                            
                            if(this.this._tutorObject)
                            {
                                // ## Mod Apr 2014 - Support for different aspect ratios
                                
                                if(this._tutorObject.hasOwnProperty("extAspectRatio"))
                                {
                                    switch(this._tutorObject["extAspectRatio"])
                                    {
                                        case "STD":
                                            this.currentState  = "tutor";
                                            // Note: StutorContainer will not exist until this.currentState == tutor
                                            
                                            StutorContainer.SsceneContainer.addChild(this._tutorObject);		//CEFTutorDoc
                                            break;
                                            
                                        case "WIDE":
                                            this.currentState  = "wstutor";
                                            // Note: SwsTutorContainer will not exist until this.currentState == wstutor
                                            
                                            SwsTutorContainer.SsceneContainer.addChild(this._tutorObject);		//CEFTutorDoc
                                            break;
                                    }
                                }
                                else
                                {
                                    this.currentState  = "tutor";
                                    // Note: StutorContainer will not exist until this.currentState == tutor
                                    
                                    StutorContainer.SsceneContainer.addChild(this._tutorObject);		//CEFTutorDoc
                                }
                                
                                this._sessionState = CSessionManager.SESSION_INPROGRESS;										
                            }
                            
                            // Otherwise show the loader again
                            
                            else
                            {
                                this.currentState = "tutorLoader";
                            }
                            break;
                        
                        // session start
                        
                        case CSessionManager.SESSION_INITIALIZED:
                            
                            // ## Mod Apr 2014 - Support for different aspect ratios
                            
                            if(this._tutorObject.hasOwnProperty("extAspectRatio"))
                            {
                                switch(this._tutorObject["extAspectRatio"])
                                {
                                    case "STD":
                                        this.currentState  = "tutor";
                                        break;
                                    
                                    case "WIDE":
                                        this.currentState  = "wstutor";
                                        break;
                                }
                            }
                            else
                            {
                                this.currentState  = "tutor";
                            }
                                                            
                            this._sessionState = CSessionManager.SESSION_INPROGRESS;
                            
                            this._logManager.addEventListener(CLogEvent.SESSION_STATUS, this.sessionProtocol);

                            break;
                    }
                    break;

            
            case  CSessionManager.SESSION_INTERRUPTED:
                
                    switch(cmd)
                    {
                        case CSessionManager.SESSION_INTERRUPTED:						// exit from full screen during resume
                            this.currentState     = "exitedFullScreen";
                            break;							
                        
                        // resuming full screen mode - first transition to allow fullscreen interactive
                        
                        case CSessionManager.SESSION_ENTERFULLSCREEN:														
                            this.currentState  = "allowFullScreen";
                            break;
                        
                        // When accepted - go back to whereever we were.
                        
                        case CSessionManager.SESSION_ALLOWFULLSCREEN:
                            this._sessionState = this._oldSessionState;
                            this.currentState  = this._oldthis.currentState;
                            
                            // Handle the special case where we are returning to allowFullScreen itself
                            // so we send the resume message to initiate the process
                            
                            this.updateInteractiveStateFSM(SESSION_RESUMED);		
                            break;														
                    }						
                    break;
            

            case  CSessionManager.SESSION_INPROGRESS:
                
                    switch(cmd)
                    {		
                        case CSessionManager.SESSION_INTERRUPTED:						// exit from full screen
                            _oldthis.currentState = this.currentState;
                            
                            if(!this._logManager.connectionActive)
                            {
                                this.currentState = "requestConnectionFix";
                            }
                            else
                            {
                                this.currentState = "exitedFullScreen";
                            }
                            _oldSessionState = this._sessionState;
                            this._sessionState    = CSessionManager.SESSION_INTERRUPTED;
                            break;							
                        
                        case  CLogEvent.SESSION_TERMINATED:
                        
                            // This means that the terminate log packet has been sent to the server and the queue is 
                            // in the process of being flushed.
                            //
                            this._sessionState = CSessionManager.SESSION_TERMINATED;
                            
                            updateInteractiveStateFSM(SESSION_FLUSHING);							
                            break;
                        
                        case  CLogEvent.SESSION_FLUSHED:
                            
                            // This case was added to support instances where we are not logging (i.e. demo modes) but need to 
                            // show the finished scene
                            //
                            this._sessionState = CSessionManager.SESSION_TERMINATED;
                            
                            updateInteractiveStateFSM(CLogEvent.SESSION_FLUSHED);							
                            break;																	
                    }						
                    break;
                
            case  CSessionManager.SESSION_TERMINATED:
                
                    switch(cmd)
                    {		
                        case SESSION_INTERRUPTED:						// exit from full screen
                            _oldthis.currentState = this.currentState;
                            this.currentState     = "exitedFullScreen";
                            _oldSessionState = this._sessionState;
                            this._sessionState    = CSessionManager.SESSION_INTERRUPTED;
                            break;							
                        
                        case CSessionManager.SESSION_FLUSHING:
                            
                            // We use a delay on the transition so the submitting data is not seen if the queue 
                            // empties in a timely fashion
                            
                            SconnectionManager.verticalCenter   = 0;
                            SconnectionManager.horizontalCenter = 0;
                            SconnectionManager.validateNow();		//?? is this required
                            
                            this.currentState  = "dataSubmission";
                            break;
                        
                        case  CLogEvent.SESSION_FLUSHED:
                            
                            stage.displayState = StageDisplayState.NORMAL; 	
                            this._inTutor    	   = false;							//## Mod Sep 29 2014 - reset inTutor so browserURLchange doesn't switch us back to the pubPortal
                                                                                // when this.currentState changes below
                            this.currentState = "thankyou";
                            
                            this._logManager.removeEventListener(CLogEvent.SESSION_STATUS, sessionProtocol);								
                            break;							
                    }					
                    break;
                
            
            //**********
            
            default:
                    break;	
        }
    }
    
    
    /**
     *  Events occuring in the logManager can alter the UI state-machine
     * 
     */
    private currentStateChanged(evt:mx.events.StateChangeEvent ) : void
    {
        CUtil.trace("Home New-State: " + evt.newState);

        
        //***********************************************************************
        // remove the Flash Tutor to the container when leaving tutor mode					
        //## Mod Sep 2014 - this._tutorObject has stage event handlers that cause doOnStage calls
        //                  so we need to ensure that when a tutorObject is invalidated it is removed
        //                  from the display list.
        //					Ensures that multiple CEFTutorDoc.doOnStage calls are not emitted when 
        //                  switching between demos 
        //
        
        switch(evt.oldState)
        {
            case "dataSubmission":
            case "noSoundFullScreen":
            case "exitedFullScreen":										
            case "headPhoneCheck":
            case "soundCheck":
            case "allowFullScreen":				
            case "interfaceLoader":					
            case "tutor":					
            case "wstutor":					
                
                if(this._tutorObject && (evt.newState == "pubPortal"))
                {
                    CUtil.trace("leaving Tutor");
                    
                    if(this._tutorObject.hasOwnProperty("extAspectRatio"))
                    {
                        if(this._tutorObject["extAspectRatio"]=='STD' && StutorContainer)
                            StutorContainer.SsceneContainer.removeChild(this._tutorObject);			//CEFTutorDoc
                            
                        else if (this._tutorObject["extAspectRatio"]=='WIDE' && SwsTutorContainer)
                            SwsTutorContainer.SsceneContainer.removeChild(this._tutorObject);		//CEFTutorDoc
                    }
                    else
                    {
                        if(StutorContainer)
                            StutorContainer.SsceneContainer.removeChild(this._tutorObject);			//CEFTutorDoc
                    }
                }					
                break;
            
            
            default:
                break;
        }
        
        
        
        
        //***********************************************************************
        //** Remove Listeners from Old State			
        
        switch(evt.oldState)
        {
            case "pubPortal":
                SpublicPortal.removeEventListener(CPortal_Event.PORTAL_EVENT, this.PortalEventHandler);
                break;						
            
            case "dataSubmission":
                removeEventListener(MouseEvent.CLICK, this.clickForDataSubmission);			
                break;
            
            case "noSoundFullScreen":
                removeEventListener(MouseEvent.CLICK, this.clickForFullScreen);			
                break;
            
            case "exitedFullScreen":										
                removeEventListener(MouseEvent.CLICK, this.resumeFullScreen);			
                break;	
            
            case "headPhoneCheck":
                removeEventListener(MouseEvent.CLICK, this.onHeadPhonesReady);			
                break;	
            
            case "soundCheck":
                SsoundCheck.removeEventListener(Event.COMPLETE, this.soundCheckHdlr);
                break;
            
            case "allowFullScreen":				
                stage.removeEventListener(FullScreenEvent.FULL_SCREEN_INTERACTIVE_ACCEPTED, this.fullScreenInteractiveHdlr);		
                break;	
            
            case "loginTED":					
                // Stop listening for connectionProtocol messages from the logManager
                
                this._logManager.removeEventListener(CLogEvent.CONNECT_STATUS, connectionProtocol);										
                SauthenticationManager.removeEventListener(CAuthEvent.AUTH_STATUS, this.authenticationProtocol);
                break;
                
            case "loginAdmin":					
                SauthenticationManager.removeEventListener(CAuthEvent.AUTH_STATUS, this.sessionHandler);
                break;

            case "interfaceLoader":					
                // Stop listening for connectionProtocol messages from the logManager
                
                this._logManager.removeEventListener(CLogEvent.CONNECT_STATUS, this.connectionProtocol);										
                
                break;

            case "tutor":					
            case "wstutor":					
            
                break;
            
            default:
                break;
        }
        
        //***********************************************************************
        //** Prep interface for New State
        
        switch(evt.newState)
        {
            case "pubPortal":				
                SpublicPortal.addEventListener(CPortal_Event.PORTAL_EVENT, PortalEventHandler);
                break;						
            
            case "dataSubmission":
                addEventListener(MouseEvent.CLICK, this.clickForDataSubmission);			
                break;
            
            case "noSoundFullScreen":
                addEventListener(MouseEvent.CLICK, this.clickForFullScreen);			
                break;
            
            case "exitedFullScreen":	
                addEventListener(MouseEvent.CLICK, this.resumeFullScreen);			
                break;
            
            case "headPhoneCheck":		
                addEventListener(MouseEvent.CLICK, this.onHeadPhonesReady);			
                break;	
            
            case "soundCheck":
                SsoundCheck.addEventListener(Event.COMPLETE, this.soundCheckHdlr);
                seqSoundCheck.addEventListener(EffectEvent.EFFECT_END, this.fireSoundCheck);
                break;
            
            case "allowFullScreen":					
                stage.addEventListener(FullScreenEvent.FULL_SCREEN, this.fullScreenHdlr);
                stage.addEventListener(FullScreenEvent.FULL_SCREEN_INTERACTIVE_ACCEPTED, this.fullScreenInteractiveHdlr);							
                break;	
            
            case "loginTED":					
                // Stop listening for connectionProtocol messages from the logManager
                
                this._logManager.addEventListener(CLogEvent.CONNECT_STATUS, this.connectionProtocol);					
                
                SauthenticationManager.addEventListener(CAuthEvent.AUTH_STATUS, this.authenticationProtocol);					
                break;
            
            case "loginAdmin":				
                                    
                SauthenticationManager.addEventListener(CAuthEvent.AUTH_STATUS, this.sessionHandler);					
                break;
            
            case "interfaceLoader":					
                // Stop listening for connectionProtocol messages from the logManager
                
                this._logManager.addEventListener(CLogEvent.CONNECT_STATUS, connectionProtocol);										
                
                break;
            
            case "tutor":					
            case "wstutor":					
                this._logManager.addEventListener(CLogEvent.CONNECT_STATUS, connectionProtocol);					
                break;
            
            default:
                break;
        }
    }
    

    // Allow Ctrl Click on bad scientist to start admin login
    
    private PortalEventHandler(e:CPortal_Event) : void
    {
        switch(e.subType)
        {
            case CPortal_Event.ADMIN_ACCESS:
                this.currentState = "loginAdmin";
                break;
            
            case CPortal_Event.PRE_DEMO:
                this._Authenticator.groupID = "GO_GUEST";					
                this._Authenticator.userPW  = "GO_GUEST";
                this._Authenticator.userID  = "PREASSESS";
                
                this._Authenticator.addEventListener(CAuthEvent.AUTH_STATUS, sessionHandler);
                
                this._Authenticator.authUser();
                break;
            
            case CPortal_Event.POST_DEMO:
                this._Authenticator.groupID = "GO_GUEST";					
                this._Authenticator.userPW  = "GO_GUEST";
                this._Authenticator.userID  = "POSTASSESS";
                
                this._Authenticator.addEventListener(CAuthEvent.AUTH_STATUS, sessionHandler);
                
                this._Authenticator.authUser();
                break;
            
            case CPortal_Event.TUTOR_DEMO:
                this._Authenticator.groupID = "GO_GUEST";					
                this._Authenticator.userPW  = "GO_GUEST";
                this._Authenticator.userID  = "TUTOR";
                
                this._Authenticator.addEventListener(CAuthEvent.AUTH_STATUS, sessionHandler);
                
                this._Authenticator.authUser();
                break;
            
            case CPortal_Event.USER_ACCESS:
            
                this._inTutor      = true;
                this._sessionState = SESSION_START;
                
                // Load the session UI
                updateInteractiveStateFSM();				
                break;
            
            default:
                break;
        }
    }

    
    private sessionHandler(evt:CAuthEvent) : void
    {
        switch(evt.subType) 
        {
            case CAuthEvent.LOADER_SUCCESS:
                
                this._inTutor      = true;
                this._sessionState = SESSION_START;
                
                // Load the session UI
                updateInteractiveStateFSM();
                break;
        }
    }
    
    
    /**
     * 
     * @param EffectEvent
     * 
     */
    private fireSoundCheck(e:EffectEvent):void
    {
        CUtil.trace("fire sound Check");
        
        seqSoundCheck.removeEventListener(EffectEvent.EFFECT_END, fireSoundCheck);			
        
        SsoundCheck.playIntro();
    }		
    
    
    /**
     * Throw away right mouse clicks
     * 
     * @param MouseEvent
     * 
     */
    private rightClickHandler(e:MouseEvent):void
    {
        e.stopImmediatePropagation();			
    }
    
    
    private soundCheckHdlr(e:Event):void
    {
        SsoundCheck.removeEventListener(Event.COMPLETE, soundCheckHdlr);

        _sndCheckDone = true;
        
        updateInteractiveStateFSM(SESSION_ENTERFULLSCREEN);
    }
            
    
    /**
     * Prompt user to click allow button (FLASH requirement)
     * 
     * @param MouseEvent
     * 
     */
    private onHeadPhonesReady(e:MouseEvent):void
    {
        updateInteractiveStateFSM(SESSION_SOUNDCHECK);
    }
    
    
    private fullScreenHdlr(e:FullScreenEvent) : void
    {
        if(!e.fullScreen)
        {
            // When the tutor goes off screen we need to update the cursorproxy since it's stage property 
            // become invalid
            
            if(this._tutorObject && this._tutorObject.hasOwnProperty("setCursor"))
                                    this._tutorObject["setCursor"](WOZREPLAY);

            updateInteractiveStateFSM(SESSION_INTERRUPTED);
            
            stage.addEventListener(FullScreenEvent.FULL_SCREEN_INTERACTIVE_ACCEPTED, fullScreenInteractiveHdlr);
            
            enableConnectionManager(CONNECTION_DISABLE);
        }		
        else
        {
            CUtil.trace("Entered Full Screen - noop");
        }
    }		
    private fullScreenInteractiveHdlr(e:FullScreenEvent) : void
    {
        // As soon as the user acknowledges full screen interactive we either start authentication 
        // or if we are reentering full screen we just show the tutor

        updateInteractiveStateFSM(SESSION_ALLOWFULLSCREEN);
        
        // start listening to keyboard for connectionManager special key combinations
        
        stage.addEventListener(KeyboardEvent.KEY_DOWN, checkCommandKeyHdlr);
        
        //enableConnectionManager(CONNECTION_MANAGER);		// Force connection manager on - for chrome experiment		
    }
    private resumeFullScreen(e:MouseEvent):void
    {
        // If we are not in or left fullscreen and are re/entering 
        
        if(this._logManager.connectionActive)
        {
            if(stage.displayState != StageDisplayState.FULL_SCREEN_INTERACTIVE)
            {
                if(stage.allowsFullScreen) CUtil.trace("full screen OK");
                if(stage.allowsFullScreenInteractive) CUtil.trace("full screen interactive OK");
                
                stage.addEventListener(FullScreenEvent.FULL_SCREEN, fullScreenHdlr);
                stage.addEventListener(FullScreenEvent.FULL_SCREEN_INTERACTIVE_ACCEPTED, fullScreenInteractiveHdlr);		
                
                updateInteractiveStateFSM(SESSION_ENTERFULLSCREEN);
                
                // NOTE: do this after setting state to avoid screen flash
                stage.displayState = StageDisplayState.FULL_SCREEN_INTERACTIVE; 			
            }
        }
    }
    private this.clickForFullScreen(e:MouseEvent) : void
    {
        // Wait for user to click to start session when no sound is required 
        // but fullscreen is
        
        updateInteractiveStateFSM(SESSION_ENTERFULLSCREEN);
    }
    
    
    private this.clickForDataSubmission(e:MouseEvent) : void
    {
        removeEventListener(MouseEvent.CLICK, this.clickForDataSubmission);			
        
        this._logManager.flushGlobalStateLocally(this._Authenticator.userID);

        addEventListener(MouseEvent.CLICK, this.clickForDataSubmission);						
    }
    
    
    private saveLogDataManually(e:Event) : void
    {
        this._logManager.flushGlobalStateLocally(this._Authenticator.userID);
    }

    
    private checkCommandKeyHdlr(e:KeyboardEvent) : void
    {
        if(!_enableConnectionManager)
        {
            if(e.ctrlKey && String.fromCharCode(e.charCode) == "d")
            {
                enableConnectionManager(CONNECTION_DEBUG);
//					enableConnectionManager(CONNECTION_MANAGER);
//					SconnectionManager.switchToPanelView();
            }				
            else if(e.ctrlKey && e.shiftKey)
            {
                enableConnectionManager(CONNECTION_MANAGER);
            }
            else if(e.ctrlKey)
            {
                enableConnectionManager(CONNECTION_MANAGER);					
            }
        }
        else
        {
            if(_enableConnectionManagerDebug)
            {
                if(!(e.ctrlKey && String.fromCharCode(e.charCode) == "d"))
                {
                    enableConnectionManager(CONNECTION_DISABLE);
                }				
            }
            else if(!(e.ctrlKey && e.shiftKey))
            {
                enableConnectionManager(CONNECTION_DISABLE);					
            }				
            else if(!(e.ctrlKey))
            {
                enableConnectionManager(CONNECTION_DISABLE);					
            }				
        }
    }
    
    
    private enableConnectionManager(_enable:string) : void
    {
        
        // SconnectionManager may not exist yet
        
        if(SconnectionManager) switch(_enable)
        {
            case CONNECTION_MANAGER:
                stage.removeEventListener(KeyboardEvent.KEY_DOWN, checkCommandKeyHdlr);
                stage.addEventListener(KeyboardEvent.KEY_UP, checkCommandKeyHdlr);
                
                CUtil.trace("Enable Connection Manager");
                _enableConnectionManagerUser = true;
                _enableConnectionManager     = true;
                
                SconnectionManager.enableConnectionButtons(true);
                
                SconnectionManager.addEventListener("SAVE_LOGDATA", saveLogDataManually);
                break;
            
            case CONNECTION_DEBUG:
                stage.removeEventListener(KeyboardEvent.KEY_DOWN, checkCommandKeyHdlr);					
                stage.addEventListener(KeyboardEvent.KEY_UP, checkCommandKeyHdlr);
                
                CUtil.trace("Enable Connection Debugger");
                _enableConnectionManagerDebug = true;
                _enableConnectionManager      = true;

                SconnectionManager.enableConnectionButtons(true);
                break;
            
            
            case CONNECTION_DISABLE:
                stage.addEventListener(KeyboardEvent.KEY_DOWN, checkCommandKeyHdlr);					
                stage.removeEventListener(KeyboardEvent.KEY_UP, checkCommandKeyHdlr);
                
                CUtil.trace("Disable Connection Manager");
                _enableConnectionManager      = false;					
                _enableConnectionManagerUser  = false;					
                _enableConnectionManagerDebug = false;

                SconnectionManager.enableConnectionButtons(false);
                break;
        }			
    }
    
    private initApp(e:Event) : void
    {									
        //removeEventListener(Event.ENTER_FRAME, initApp);
                    
        // Load the collection of modules
        //
        switch(this._loader.domain)
        {
            case "flash":
                
                this.currentState = this._interfaceLdr.state;
                
                xfaceLoader(this._loader);
                
                break;
            
            case "flex":
                
                this.currentState = this._interfaceLdr.state;
                
                break;
        }
    }
    
    
    private xfaceLoader(loader:any) : void
    {		
        let compSet:CFXSwfLoader;
        let libArray:Array;
        let modArray:Array;
        
        // recover the selected user account
        
        this._loader = loader;
                    
        // unload the signin elements 
        
        unloadAllModules();
                            
        try
        {
            //**************************************************************************
            // Add the Interface XML spec to the LoadablePackage of files 
            // Note that the incoming XML data in the loader has to be assigned to a 
            // variable, in this case "sceneGraphXML" 
            
            if(this._loader.sgxml != null)			
                _loadablePackage.addModule(new CFXthis.fileLoader(), "loadFile", new Array(this._loader.sgpath + this._loader.sgxml), this, "_sceneGraphXML");
            
            
            //**************************************************************************
            // Add the Interface XML spec to the LoadablePackage of files 
            // Note that the incoming XML data in the loader has to be assigned to a 
            // variable, in this case "sceneGraphXML"
            //@@ Mod Jul 17 2013 - Separated scenegraph from scene description
            
            if(this._loader.scenesxml != null)			
                _loadablePackage.addModule(new CFXthis.fileLoader(), "loadFile", new Array(this._loader.scenespath + this._loader.scenesxml), this, "_sceneDescrXML");
            
            
            //**************************************************************************
            // Add the Scenegraph JSON spec to the LoadablePackage of files 
            // Note that the incoming JSON data in the loader has to be assigned to a 
            // variable, in this case "sceneGraphJSON"
            //@@ Mod Jul 17 2013 - Separated scenegraph from scene description
            
            if(this._loader.graphjson != null)			
                _loadablePackage.addModule(new CFXthis.fileLoader(), "loadFile", new Array(this._loader.graphpath + this._loader.graphjson), this, "_sceneGraphJSON");
            
            
            //**************************************************************************
            // Add the sceneGraph JSON spec to the LoadablePackage of files 
            // Note that the incoming JSON data in the loader has to be assigned to a 
            // variable, in this case "sceneGraphJSON"
            //@@ Mod Jul 17 2013 - Separated scenegraph from scene description
            
            if(this._loader.anigraphjson != null)			
                _loadablePackage.addModule(new CFXthis.fileLoader(), "loadFile", new Array(this._loader.graphpath + this._loader.anigraphjson), this, "_sceneGraphJSON");
            
            
            //**************************************************************************
            // Add the HunspellDictionary to the LoadablePackage of files
            // Note that no data assignment is required for this as the object itself 
            // like the SWF loader contains the data 
            
            if(this._spellerLdr != null)
                _loadablePackage.addModule(_spellDictionary, "load", new Array(this._spellerLdr.path + this._spellerLdr.rules, this._spellerLdr.path + this._spellerLdr.dict));
            
            
            //**************************************************************
            //************* Add the modules to the LoadablePackage of files
            
            // Create a load context for the swf modules
            
            context					  = new LoaderContext();
            context.applicationDomain = ApplicationDomain.currentDomain;
            
            // NOTE - cannot set securityDomain for local files
            //
            if(remoteMode)
                context.securityDomain = SecurityDomain.currentDomain;
            
            // Create the common loader that will be used for all SWF loads
            
            compSet = new CFXSwfLoader();
            
            
            // Extract the libraries path and files from the XML loader spec
            // Note: this._libraryLdr and path MAY NOT be null - should throw on error 
            
            libPath  = this._libraryLdr.path;
            
            if(libPath != null)
            {						
                libArray = this._libraryLdr.libs.split(",");
                
                // Then add the qualified path etc to the loadablePackage
                
                while(libArray.length)
                {
                    _loadablePackage.addModule(compSet, "loadSWF", new Array(libPath + libArray.shift(), context));
                }		
            }
            
            // Extract the module path and files from the XML loader spec  
            // Note: this may be null if there are no extra modules
            
            if(this._moduleLdr != null)
                modPath  = this._moduleLdr.path;
            
            if(modPath != null)
            {
                modArray = this._moduleLdr.mods.split(",");
                
                // Then add the qualified path etc to the loadablePackage
                
                while(modArray.length)
                {
                    _loadablePackage.addModule(compSet, "loadSWF", new Array(modPath + modArray.shift(), context));
                }
            }
        }
        catch(e:Error)
        {
            CUtil.trace(e);
            Alert.show("Library spec invalid - JSON Syntax Error in Loader", "Error");					
        }
                    
        //*******************************************************
        // The loadablePackage is now ready - begin the Load
        
        addEventListener("LOADCOMPLETE", appCreateHandler);
        
        if(_loadablePackage.length)
        {
            // Initialize the progress annulus
            
            Sprogress.numSegments = _loadablePackage.length;
            Sprogress.diameter    = (Math.min(width,height) / 4);
            
            ModuleLdrHandler(null);
        }	
        else
        {
            CUtil.trace("Module Specification Error");
        }
    }
    

    private ModuleLdrHandler(evt:Event) : void
    {			
        
        // if this is the result of a load op then process the loader
        
        if(_loadableModule)				
        {				
            _loadableModule.loader.removeEventListener(Event.COMPLETE, ModuleLdrHandler);

            if(_loadableModule.load== "loadSWF")
            {
                RSLs.push(_loadableModule.loader.SWF);
            }
            
            if(_loadableModule.valueObj != null)
            {
                _loadableModule.valueObj[_loadableModule.valueProperty] = _loadableModule.loader.data;
            }
        }
        
        // load each object in sequence
        
        _loadableModule = _loadablePackage.nextModule(); 
        
        if(_loadableModule)
        {
            // Increment the target ring segment
            
            CUtil.trace("lOADING: " + _loadableModule.loadParms);
            
            Sprogress.listenTo(EventDispatcher(_loadableModule.loader));
            
            _loadableModule.loader.addEventListener(Event.COMPLETE, ModuleLdrHandler);
            
            _loadableModule.loader[_loadableModule.loadFunction].apply(_loadableModule.loader, _loadableModule.loadParms);
        }
        else
        {
            dispatchEvent(new Event("LOADCOMPLETE"));
        }
    }
    
    
    /**
     * 
     * @param event
     * 
     */
    private unloadAllModules() : void
    {
        let loadObj:SWFLoader;
        
        while(RSLs.length)			
        {
            loadObj = RSLs.pop();
            
            loadObj.unloadAndStop();
        }			
    }
    
    
    /**
     * 
     * @param event
     * 
     */
    private appCreateHandler(evt:Event):void
    {						
        removeEventListener("LOADCOMPLETE", appCreateHandler);

        //## Mod Oct 31 2012 - Google Analytics support
        
        _tracker.trackEvent("Loader", this._loader._id, "Selected" );
        
        // initialize the logging mode
        // set the logging state - based on the TRoot global
        
        //@@MOD Sep 23 2013 - Support for local logging - i.e. save to local path
        
        switch(this._interfaceLdr.log)
        {
            case "REMOTE":
                this._logManager.fLogging = CONST.RECLOGEVENTS;		// standard mode is - RECLOGEVENTS								
                break;
            
            case "LOCAL":
                this._logManager.fLogging = CONST.RECORDEVENTS;		// Records events to the queue for local save							
                break;
            
            case "NONE":
            default:				
                this._logManager.fLogging = CONST.RECLOGNONE;			// queue disabled - no logging
                break;
        }

        // tell logmanager about the account
        
        this._logManager.account = this._account;
        
        // load the target application and let it run
        
        this._tutorObject = CUtil.instantiateObject("moduleName", this._loader.appclass);
        this._tutorObject.name = "Document";
                    
        if(this._tutorObject.hasOwnProperty("extAccount"))		
            this._tutorObject["extAccount"] = this._account;							//@@ Mod Dec 03 2013 - Pass the DB account data to Flash
        
        this._tutorObject["extLoader"] 	      = true;							//@@ deprecated - Jun 27 2012 - All tutor instances that 
                                                                            //   use the ConcreteAbstract CEFTutorDoc codebase no longer 
                                                                            //   support internal loading		
        this._tutorObject["extFDeferDemoClick"] = true;

        this._logManager.fTutorPart            = this._phase;							//@@ Mod Nov 20 2013 - placed features in phase table
        this._tutorObject["extTutorFeatures"]  = this._features;
                    
        this._tutorObject["extFDemo"]  	      = this._interfaceLdr.demo;
        this._tutorObject["extFDebug"]  	      = this._interfaceLdr.debug;			
        this._tutorObject["extFRemoteMode"]    = this._interfaceLdr.remote;			
        
        if(this._tutorObject.hasOwnProperty("extFSkillometer"))		
            this._tutorObject["extFSkillometer"] = this._interfaceLdr.skillometer;
        
        //@@ Mod Apr 20 2012 - added support for module path specification - This simplifies running
        //                     multiple simultaneous tutors / demos - everything is expected to be 
        //					   relative to this path. 
        
        if(this._tutorObject.hasOwnProperty("extmodPath") && this._moduleLdr)		
            this._tutorObject["extmodPath"] = this._moduleLdr.path;
        
        if(this._tutorObject.hasOwnProperty("extLogManager"))		
            this._tutorObject["extLogManager"] = this._logManager;
        
        //@@ Mod Feb 16 2013 - support spell checking FLA TextField
        if(this._tutorObject.hasOwnProperty("extSpellManager"))		
            this._tutorObject["extSpellManager"] = _spellManagerProxy; 
        
        //@@ Mod Feb 22 2013 - support single spelling dictionary preload
        if(this._tutorObject.hasOwnProperty("extSpellDictionary"))		
            this._tutorObject["extSpellDictionary"] = _spellDictionary; 
        
        //@@ Mod Feb 23 2013 - support sceneGraph dynamic loading 
        //@@ Mod Jul 17 2013 - Separated scenegraph from scene description 
        if(this._tutorObject.hasOwnProperty("extSceneGraphXML") && (_sceneGraphXML != null))		
            this._tutorObject["extSceneGraphXML"] = _sceneGraphXML; 
        
        //@@ Mod Feb 23 2013 - support sceneGraph dynamic loading 
        if(this._tutorObject.hasOwnProperty("extSceneDescr") && (_sceneDescrXML != null))		
            this._tutorObject["extSceneDescr"] = _sceneDescrXML; 
        
        //@@ Mod Jul 17 2013 - Separated scenegraph from scene description 
        if(this._tutorObject.hasOwnProperty("extSceneGraph") && (_sceneGraphJSON != null))		
            this._tutorObject["extSceneGraph"] = _sceneGraphJSON; 
        
        //@@ Mod Aug 31 2013 - Separated animation graph from scene description 
        if(this._tutorObject.hasOwnProperty("extsceneGraph") && (_sceneGraphJSON != null))		
            this._tutorObject["extsceneGraph"] = _sceneGraphJSON; 
        
        //@@ Mod May 22 2013 - support prepost back button processing 
        if(this._tutorObject.hasOwnProperty("extForceBackButton") && (this._interfaceLdr.forcebackbutton != undefined))		
            this._tutorObject["extForceBackButton"] = this._interfaceLdr.forcebackbutton; 
        
        //			enumChildren(this, this.name);					// @@ debug
        //			enumChildren(stage, "Stage");					// @@ debug	
        
        // Screen Capture Support 
        
        stage.addEventListener(KeyboardEvent.KEY_DOWN, screenCaptureHdlr);
        
        // Set the stage focus so we always receive keyboard clicks
        //
        // note: If we don't do this and there is not a textfield with focus 
        //       then we don't receive keyboard events.
        
        stage.focus=stage;
                    
        //****************************
        // Transition to tutor
        //
        // Note: This may be ignored if the load was interrupred by pressing the Esc key - i.e. it may have completed in the background
        //
        
        updateInteractiveStateFSM(SESSION_INITIALIZED);
        
        //@@ Mod Mar 9 2015 - Support interrupt if connection lost
        //
        // Session manager listens to the tutor for these to ensure we don't get ahead of the logging. 
        
        this._tutorObject.addEventListener("CONNECTION_LOST", doWaitForConnFix);

        
        // Kick start the queue 
        
        this._logManager.setQueueStreamState(true);
        
        // Add the Flash Tutor to the container
        // Check the contained has been created - If the user exits fullscreen while loading it may
        // have been inhibited - this will be done on resume from exitedFullScreen
        
        // ## Mod Apr 2014 - Support for different aspect ratios
        
        if(this._tutorObject.hasOwnProperty("extAspectRatio"))
        {
            if(this._tutorObject["extAspectRatio"]=='STD' && StutorContainer)
                StutorContainer.SsceneContainer.addChild(this._tutorObject);			//CEFTutorDoc
            
            else if (this._tutorObject["extAspectRatio"]=='WIDE' && SwsTutorContainer)
                SwsTutorContainer.SsceneContainer.addChild(this._tutorObject);		//CEFTutorDoc
        }
        else
        {
            if(StutorContainer)
                StutorContainer.SsceneContainer.addChild(this._tutorObject);			//CEFTutorDoc
        }
        
        return;			
    }
    
    
    // If the tutor loses the connection the SceneGraphNavigator will emit CONNECTION_LOST to allow the sessionManager to 
    // force the user to fix the connection before proceeding.
    // When the user hits the next button when there is a connection problem CONNECTION_LOST is emitted.
    //  
    private doWaitForConnFix(e:Event) : void
    {
        // NOTE: This will cause fullScreenHdlr to Interrupt the session. 
        
        stage.displayState = StageDisplayState.NORMAL; 	
        
        this._logManager.addEventListener(CLogEvent.CONNECT_STATUS, connectionStateProtocol);			
    }
    
    private connectionStateProtocol(evt:CLogEvent ) : void
    {			
        // When connection reestablished allow the user to continue.
        
        if(this._logManager.connectionActive)
        {				
            this._logManager.removeEventListener(CLogEvent.CONNECT_STATUS, connectionStateProtocol);
            this.currentState = "exitedFullScreen";				
        }
    }		
      

    private spellCheckHdlr(event:CSpellEvent):void 
    { 
    }
    
    private screenCaptureHdlr(event:KeyboardEvent):void 
    { 
        CUtil.trace(event.currentTarget.name + " hears key press: " + String.fromCharCode(event.charCode) + " (key code: " + event.keyCode + " character code: " + event.charCode + ")");
        
        if(this._tutorObject && event.ctrlKey && String.fromCharCode(event.charCode) == "c")
                                                                                screenCap();
    }		
    
    private screenCap() : void
    {
        let stage_snapshot:BitmapData = new BitmapData(320, 240);
        let myRectangle:Rectangle     = new Rectangle(0, 0, 320, 240);			
        let scaleMatrix:Matrix        = new Matrix();
        let file:FileReference		  = new FileReference();
        
        if(this._tutorObject)
        {
            // ## Mod Apr 2014 - Support for different aspect ratios
            
            if(this._tutorObject.hasOwnProperty("extAspectRatio"))
            {
                if(this._tutorObject["extAspectRatio"]=='STD')
                    scaleMatrix.scale(myRectangle.width / 1024, myRectangle.height / 768);
                
                else if(this._tutorObject["extAspectRatio"]=='WIDE')
                    scaleMatrix.scale(myRectangle.width / 1366, myRectangle.height / 768);
            }
            else
            {
                scaleMatrix.scale(myRectangle.width / 1024, myRectangle.height / 768);
            }
            
            stage_snapshot.draw(this._tutorObject, scaleMatrix, null, null, myRectangle);
            
            let png_binary:ByteArray = new ByteArray();
            
            png_binary = PNGEncoder.encode(stage_snapshot);		
            
            file.save(png_binary, "");
        }
    }	
    
}

