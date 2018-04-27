

export class CONST {

    public static readonly BOOT_LOADER:string   = "./data/bootLoader.json";
    public static readonly LOCAL:string          = "LOCAL";
    public static readonly WAIT:number           = 250;

	public static readonly DONT_LAUNCH:boolean  = false;
	public static readonly LAUNCH:boolean  		= true;


	public static readonly TUTOR_JSON_IMAGE:string[] = [
		"scenedescr.json",
		"scenegraph.json",
		"tutorgraph.json"
	];
	
	public static readonly TUTOR_FACTORIES:string[] = [
		"_sceneDescr",
		"_sceneGraph",
		"_tutorGraph"
	];
	
    //*************** Navigator static constants
    
	public static readonly CANCELNAV:string  = "CancelNav";
	public static readonly OKNAV:string		 = "OK";

	public static readonly ENDMODAL:string = "ENDMODAL";
	public static readonly DLGSTAY:string	= "DLGStay";
	public static readonly DLGNEXT:string	= "DLGNext";

	public static readonly WOZREPLAY:string  = "rootreplay";
	public static readonly WOZCANCEL:string  = "rootcancel";
	public static readonly WOZPAUSING:string = "rootpause"; 
	public static readonly WOZPLAYING:string = "rootplay"; 
	
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

	public static readonly GOTONEXTSCENE:string     = "incSceneGraph";
	public static readonly GOTONEXTANIMATION:string = "incAnimationGraph";

}

