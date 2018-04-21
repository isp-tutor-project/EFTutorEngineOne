import { CUtil } from "../util/CUtil";
import { CDataEvent } from "../events/CDataEvent";
import { CIOErrorEvent } from "../events/CIOErrorEvent";
import { CSecurityErrorEvent } from "../events/CSecurityErrorEvent";

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

export class CSocket 
{
	// Custom Port Constants
	
	public static PORT_NTP:number     =	12000;
	public static PORT_ARBITER:number =	12001;
	public static PORT_SERVER:number  =	12002;
	public static PORT_LOGGER:number  =	12003;				
	
	// XML int CLIENT types
	
	public static xmlTYPE_UNKNOWN:number = 0;

	public static xmlCLIENT_ARB:number = 1;
	public static xmlCLIENT_TED:number = 2;
	public static xmlCLIENT_SES:number = 3;
	public static xmlCLIENT_LGR:number = 4;
	public static xmlCLIENT_TUT:number = 5;
	public static xmlCLIENT_WOZ:number = 6;
	public static xmlCLIENT_NTP:number = 7;

	public static xmlSERVER_ARB:number = 8;
	public static xmlSERVER_TED:number = 9;
	public static xmlSERVER_SES:number = 10;
	public static xmlSERVER_LGR:number = 11;
	public static xmlSERVER_NTP:number = 12;

	// XML values

	public static xmlCLIENT_MESSAGE:string = "clientmessage";          // message from client
	public static xmlSERVER_MESSAGE:string = "servermessage";          // message from server 

	public static xmlADVERTISE:string 		= "advertise_service";      // Advertise client component to the server 
	public static xmlPUBLISH:string 		= "publish_service";        // Publish service / components to clients
	public static xmlTYPE:string 			= "type";                   // Client Message attribute
	public static xmlNAME:string 			= "name";
	public static xmlPRIVATE_IP:string 		= "private_ip";
	public static xmlPUBLIC_IP:string 		= "public_ip";
	public static xmlCONNECT_IP:string 		= "connect_ip";
	
	public static xmlNOOP:string 			= "noopevent";		
	
	public static xmlPROTOCOL_ERROR:string = "protocol_error";
	public static xmlERROR_ID:string 		= "error_id";	
	
	public static xmlQUERY:string 			= "query";                  // Client Query to Server
	public static xmlUNKNOWN:string 		= "Unknown";                // unknown server/client name 
	
	public static xmlNTP_MESSAGE:string 	= "ntp_message";
	public static xmlNTPT1:string 			= "T1";
	public static xmlNTPT2:string 			= "T2";
	
	public static xmlDOM_REQUEST:string 	= "policy-file-request";
	
	public static xmlACK:string 			= "ack";                    // Acknowledge
	public static xmlACKSESSION:string 		= "acksession";             // Acknowledge registration - no database integration
	public static xmlACKTERM:string 		= "ackterm"; 		        // Acknowledge temination request
	public static xmlACKLOG:string 			= "acklog";                 // Acknowledge
	public static xmlNAKLOG:string 			= "naklog";                 // Negative Acknowledge
	
	public static xmlACKAUTH:string 		= "ackauth";                // Acknowledge authentication  - database integration
	public static xmlNAKAUTH:string 		= "nakauth";                // Negative Acknowledge authentication
	public static xmlACKATTACH:string 		= "ackattach";              // Acknowledgement of reattachment attempt
	
	public static xmlSQLERROR:string		= "sqlerror";				// Server backend failure
	
	public static xmlInvalidUsername:string	= "INVALID_USERNAME";
	public static xmlInvalidPassword:string	= "INVALID_PASSWORD";

	private 	_host:string;
	private 	_port:string;
			
	public 		connecting:boolean = false;
	
	// Methods
	
	constructor(host:string = null, port:number = 0)
	{
		// NOTE: There is a 15 sec timeout on bad socket addresses
		//
		
		// Notes: 
		// 1. http://127.0.0.1:80/crossdomain.xml - This syntax only enables port 80
		// 2. filename must be specified (i.e. crossdomain.xml)
		// 3. A policy file must be served either from a webserver or an XMLSocket Server
		// 4. If using a webserver the following call is required to load the default policy file.
		// Security.loadPolicyFile("http://127.0.0.1/crossdomain.xml");
		
	}
	
	public openSocket(hostName:string, port:number) : void
	{
		CUtil.trace("CSocket: openSocket - " + hostName + " port:" + port);
		
		this._host = hostName;
		this._port = port.toString();
		
		// Wire up the all the listeners
		
		// configureListeners(true);
		
		// connecting = true;
		// connect(hostName,port);			
	}
	
	
	// Ensure socket is closed and collectable - closeSocket manages sockets that are either
	// closed - connected or pending connection - we maintain listeners until the socket is 
	// good and dead, to avoid unhandled event exceptions
			
	public closeSocket() : void
	{
		CUtil.trace("CSocket: closeSocket - " + this._host + " port:" + this._port);
		
	}			
	
	
	public sendData(data:Object) :boolean
	{
		let fResult:boolean = true;
		
		
		return fResult;
	}

	private configureListeners(connect:boolean = true):void
	{
	}

	protected connectHandler(event:Event):void
	{
		CUtil.trace("CSocket connectHandler: " + event);
					
	}

	protected closeHandler(event:Event):void
	{
		CUtil.trace("CSocket closeHandler: " + event);
					
	}

	protected dataHandler(event:CDataEvent):void
	{
		//CUtil.trace("CSocket dataHandler: " + event);
					
	}

	protected ioErrorHandler(event:CIOErrorEvent):void
	{
		CUtil.trace("CSocket ioErrorHandler: " + event);
		
	}

	protected progressHandler(event:ProgressEvent):void
	{
		CUtil.trace("CSocket progressHandler loaded:" + event.loaded + " total: " + event.total);			
		
	}

	protected securityErrorHandler(event:CSecurityErrorEvent):void
	{
		CUtil.trace("CSocket securityErrorHandler: " + event);
		
	}

	
	
	//*************  These handlers are designed to manage the closing and abandonment of active or pending connections.
	//*************  Abandoning a socket prior to completion of all socket processes will result in unhandled event exceptions

	private configureAbandonListeners(connect:boolean = true):void
	{
	}
			
	private abandonConnectHandler(event:Event):void
	{
		CUtil.trace("Abandoned Socket connectHandler - Now Closing: " + event);
		
	}
	
	private abandonCloseHandler(event:Event):void
	{
		CUtil.trace("Abandoned Socket CloseHandler - Socket Released: " + event);

	}
	
	private abandonDataHandler(event:CDataEvent):void
	{
		CUtil.trace("Abandoned Socket DataHandler: " + event);
	}
	
	private abandonIoErrorHandler(event:CIOErrorEvent):void
	{
		CUtil.trace("Abandoned Socket ioErrorHandler: " + event);
		
	}
	
	private abandonProgressHandler(event:ProgressEvent):void
	{
		CUtil.trace("Abandoned Socket ProgressHandler: " + event);
	}
	
	private abandonSecurityErrorHandler(event:CSecurityErrorEvent):void
	{
		CUtil.trace("Abandoned Socket SecurityErrorHandler: " + event);
		
	}
	
}