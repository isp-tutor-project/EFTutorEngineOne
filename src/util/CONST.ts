

export class CONST {

	public static readonly TUTORCONTAINER = "STutorContainer";
    
    public static readonly ACTION_PFX       = "$nodeAction.";    
    public static readonly SCENE_CHOICESET  = "choiceset";
    public static readonly SCENE_TRACK      = "track";
    public static readonly SCENE_ACTION     = "action";		
    public static readonly TEMPLATE_VAR     = "templateVar";	
    public static readonly NOVAR            = "__novar";	
    
    public static readonly SCENE_DATA         = "SceneData";	
    public static readonly TRACK_DATA         = "TrackData";	
    
    public static readonly START_CUEPOINT     = "$start";	
    public static readonly END_CUEPOINT       = "$end";	

    // custom HTML control types
    // 
	public static readonly EFTEXT_TYPE        = "eftext";
	public static readonly EFINPUT_TYPE       = "efinput";
	public static readonly EFLISTBOX_TYPE     = "eflist";
    public static readonly EFTABLE_TYPE       = "eftable";
    public static readonly EFDATA_TYPE        = "efdata";

	public static readonly GLOBAL_MODULE      = "$GLOBAL";
	public static readonly GLOBAL_CODE        = "$GLOBAL";
	public static readonly COMMON_CODE        = "$Common";
	public static readonly EXT_SIG            = "$";

    // Webroot relative paths    
    public static readonly TUTOR_COMMONPATH:string      = "EFTutors/";
    public static readonly ACCOUNT_LOADER:string        = "/EFTutors/accounts.json";
    
    // EFMod<ule> relative paths
    public static readonly MODID_FILEPATH:string        = "/EFconfig.json";
    public static readonly GRAPH_FILEPATH:string        = "/EFgraphs/scenegraphs.json";
    public static readonly EXTS_FILEPATH:string         = "/EFbuild/exts.js";
    public static readonly MIXINS_FILEPATH:string       = "/EFbuild/mixins.js";
    public static readonly DATA_FILEPATH:string         = "/EFbuild/_EFTUTORDATA.json";
    public static readonly LIBR_FILEPATH:string         = "/EFbuild/_EFLIBRARYDATA.json";
    public static readonly FONTFACE_FILEPATH:string     = "/EFfonts/fontfaces.css";
    public static readonly TRACKDATA_FILEPATH:string    = "/EFaudio/EFscripts/script_assets.json";
    public static readonly TRACKASSETS_FILEPATH:string  = "/EFaudio/EFassets/";

    // EFTutors relative paths
    public static readonly GLOBALS_FILEPATH:string      = "/EFbuild/globals.js";
    public static readonly GDATA_FILEPATH:string        = "/EFbuild/_EFTUTORDATA.json";
    public static readonly GLIBR_FILEPATH:string        = "/EFbuild/_EFLIBRARYDATA.json";

    public static readonly SEGMENT_PREFIX:string        = "_s";
    public static readonly VOICE_PREFIX:string          = "_v";
    public static readonly ANMODULE_FILEPATH:string     = ".js";
    public static readonly TYPE_MP3                     = ".mp3";
    public static readonly TYPE_WAV                     = ".wav";

    public static readonly TUTOR_GLOBALCODE            = "TutorGlobalCode";
    public static readonly TUTOR_GLOBALDATA            = "TutorGlobalData";

    public static readonly LOCAL:string                 = "LOCAL";
    public static readonly WAIT:number                  = 250;

	public static readonly DONT_LAUNCH:boolean  = false;
    public static readonly LAUNCH:boolean  		= true;
    
    // This is the AnimateCC controlContainer unscaled height
    // 
    public static readonly CONTROLCONTAINER_DESIGNHEIGHT:number = 100;

    public static readonly EFMODULE_PREFIX:string   = "EFMod_";
	public static readonly THERMITE_PREFIX:string   = "TC_";
	public static readonly MODULE_PREFIX:string     = "TM_";
	public static readonly MODLINK_PREFIX:string    = "TL_";
    public static readonly SCENE_EXT 				= "sceneExt";
    public static readonly TUTOR_EXT 				= "tutorExt";
    


	public static readonly TUTOR_VARIABLE:string[] = [
        "tutorconfig.json",
		"tutorgraph.json"
	];
	
	public static readonly TUTOR_FACTORIES:string[] = [
        "tutorConfig",
		"tutorGraph"
	];
	

    //** Transition constants */
	public static readonly EFFECT_FADE   	= "fade";
	public static readonly EFFECT_SWAP 		= "swap";
    	//**  Button States - must match AnimateCCData conventions : see Adobe generated JS code */

	public static STATE_UP   		= "";
	public static STATE_OVER 		= "";
	public static STATE_DOWN		= "";
	public static STATE_DISABLED	= "";	                    // Note that we have a dual interpretation of the AnimateCC HIT state
	public static STATE_HIT 		= "";

	public static readonly SHAPE_UP   		    = "shape";
	public static readonly SHAPE_OVER 		    = "shape_1";
	public static readonly SHAPE_DOWN		    = "shape_2";
	public static readonly SHAPE_DISABLED	    = "shape_3";	// Note that we have a dual interpretation of the AnimateCC HIT state
	public static readonly SHAPE_HIT 		    = "shape_3";

	public static readonly INSTANCE_UP   		= "instance";
	public static readonly INSTANCE_OVER 		= "instance_1";
	public static readonly INSTANCE_DOWN		= "instance_2";
	public static readonly INSTANCE_DISABLED	= "instance_3";	// Note that we have a dual interpretation of the AnimateCC HIT state
	public static readonly INSTANCE_HIT 		= "instance_3";


	public static readonly STATE_OUT   		= "state_out";	// this represents a transition not a display object

	public static readonly NEXTSCENE      = "nextbutton";
	public static readonly PREVSCENE      = "prevbutton";

	static readonly MOUSE_MOVE:string 		= "mousemove";			// Click event from the button 
	static readonly MOUSE_DOWN:string 		= "mousedown";			// Click event from the button 
	static readonly MOUSE_UP:string 		= "mouseup";			// Click event from the button 
	static readonly MOUSE_CLICK:string 		= "click";				// Click event from the button 
	static readonly DOUBLE_CLICK:string 	= "dblclick";			// Click event from the button 

	static readonly CLICK:string 			= "click";				// Click event from the button 
				


    //*************** Navigator static constants
    
	public static readonly CANCELNAV:string  = "CancelNav";
	public static readonly OKNAV:string		 = "OK";

	public static readonly ENDMODAL:string = "ENDMODAL";
	public static readonly DLGSTAY:string	= "DLGStay";
	public static readonly DLGNEXT:string	= "DLGNext";

	public static readonly EF_REPLAY:string  = "rootreplay";
	public static readonly EF_CANCEL:string  = "rootcancel";
	public static readonly EF_PAUSING:string = "rootpause"; 
	public static readonly EF_PLAYING:string = "rootplay"; 
	
//********

	// RGB to Luminance conversion constants
	
	public static readonly LUMA_R:number = 0.212671;
	public static readonly LUMA_G:number = 0.71516;
	public static readonly LUMA_B:number = 0.072169;

    public static readonly SESSION_START:string 		= "sessionstart";
    public static readonly SESSION_RUNNING:string 		= "sessionrunning";
    public static readonly SESSION_INTERRUPTED:string 	= "sessioninterrupted";
    public static readonly SESSION_COMPLETE:string		= "sessioncomplete";
            
	// ** Network message types - Server Response packet contents
	
	public static readonly xmlUSER_AUTH:string			=	"userAuth";
	public static readonly xmlUPDATE_PROGRESS:string	=	"updateProgress";
	public static readonly xmlLOG_STATE:string			=	"logState";
	public static readonly xmlQUERY_STATE:string		=	"queryState";
			
	public static readonly xmlACKAUTH:string			=	"ackauth";
	public static readonly xmlNAKAUTH:string			=	"nakauth";
	
	public static readonly xmlACKPROGLOG:string			=	"ackprogresslog";
	public static readonly xmlNAKPROGLOG:string			=	"nakprogresslog";
	
	public static readonly xmlACKSTATEQUERY:string		=	"ackstatequery";
	public static readonly xmlNAKSTATEQUERY:string		=	"nakstatequery";
	
	public static readonly xmlACKLATESTSTATEQUERY:string=	"acklateststatequery";
	public static readonly xmlNAKLATESTSTATEQUERY:string=	"naklateststatequery";
	
	public static readonly xmlACKSTATELOG:string		=	"ackstatelog";
	public static readonly xmlNAKSTATELOG:string		=	"nakstatelog";
	
	public static readonly xmlERROR:string				=	"error";
	public static readonly xmlMESSAGE:string			=	"message";
	public static readonly xmlSQLERROR:string			=	"sqlerror";
	
	public static readonly INVALID_USER:string			=	"INVALID_USERPASS";
	
	// Custom Port Constants
		
	public static readonly PORT_NTP:number     =	12000;
	public static readonly PORT_ARBITER:number =	12001;
	public static readonly PORT_SERVER:number  =	12002;
	public static readonly PORT_LOGGER:number  =	12003;				

	
	public static readonly RECLOGNONE:number    = 0;			// Disable all recording
	public static readonly RECORDEVENTS:number  = 1;			// Record Events
	public static readonly LOGEVENTS:number     = 2;			// Log Events to Server
	public static readonly RECLOGEVENTS:number  = 3;			// Record and Log all events


	public static readonly MODE_JSON:string    = "MODE_JSON";
	
	public static readonly JSON_ACKLOG:string  = "JSON_ACKLOG";
	public static readonly JSON_ACKTERM:string = "JSON_ACKTERM";

    //** MONGODB */
	public static readonly FIND:string   	 	= '"find"';					// NOTE: these must be "quoted" 
	public static readonly INSERT:string 	 	= '"insert"'; 
	public static readonly CREATEACCT:string	= '"createacct"'; 
	public static readonly UPSERT:string 	 	= '"upsert"'; 
	public static readonly UPDATE:string 	 	= '"update"'; 
	public static readonly UNSET:string 		= '"unset"'; 
	public static readonly REMOVE:string 	 	= '"remove"';
	public static readonly RECYCLE:string	 	= '"recycle"';
	public static readonly RECOVER:string	 	= '"recover"';
	public static readonly DBCOMMAND:string   	= '"dbcommand"';
	
	public static readonly DBRUN_DBCOMMAND:string	= "dbcommand";	
	public static readonly DBRUN_LISTDBS:string		= "listdatabases";	
	public static readonly DBRUN_LISTCOLS:string	= "listcollections";	
	
	public static readonly DBRUN_DROPCOLLECTION:string = "dropcollection";		
	public static readonly DBRUN_UPDATEDOCUMENT:string = "updatedocument";
	
	public static readonly ACK_FIND:string    		= 'find';					// NOTE: these must not be "quoted" 
	public static readonly ACK_INSERT:string  		= 'insert'; 
	public static readonly ACK_CREATEACCT:string	= 'createacct'; 
	public static readonly ACK_UPSERT:string  		= 'upsert'; 
	public static readonly ACK_UPDATE:string  		= 'update'; 
	public static readonly ACK_UNSET:string  		= 'unset'; 
	public static readonly ACK_REMOVE:string  		= 'remove';
	public static readonly ACK_RECYCLE:string 		= 'recycle';
	public static readonly ACK_RECOVER:string 		= 'recover';
	public static readonly ACK_DBCOMMAND:string  	= 'dbcommand';
	
	public static readonly QUERY_ALL:string = "";
	
	public static readonly LOG_PACKET:string    = '"LOG_PACKET"';
	public static readonly LOG_TERMINATE:string = '"LOG_TERMINATE"';
	public static readonly LOG_PROGRESS:string  = '"LOG_PROGRESS"';		
	
	public static readonly ACKLOG_PACKET:string    = 'LOG_PACKET';
	public static readonly ACKLOG_TERMINATE:string = 'LOG_TERMINATE';
	public static readonly ACKLOG_PROGRESS:string  = 'LOG_PROGRESS';		
	public static readonly ACKLOG_NAK:string 	   = 'NAK_ERROR';		
	
	// These must match the equivalents in protocolStudyLdr.dart
	
	public static readonly _READY:string      = "READY";
	public static readonly _INPROGRESS:string = "IN PROGRESS";
	public static readonly _COMPLETE:string   = "COMPLETE";

	public static readonly GOTONEXTSCENE:string = "incTutorGraph";
	public static readonly GOTONEXTTRACK:string = "incSceneGraph";

	public static readonly TIMER:string             = "timeout";
	public static readonly TIMER_COMPLETE:string    = "timercomplete";
}

