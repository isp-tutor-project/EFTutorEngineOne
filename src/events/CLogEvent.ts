//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2011 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CLogEvent.as
//                                                                        
//  Purpose:   CLogEvent object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Oct 28 2011  
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

import { CEFEvent } from "./CEFEvent";
import { CUtil } from "../util/CUtil";

import Event = createjs.Event;



export class CLogEvent extends Event
{	
	// event types		
	public static readonly COMPLETE:string  	   		= "complete";	

	public static readonly PACKET_FORWARD:string  	  	= "Packet Forward";	
	
	public static readonly SESSION_STATUS:string		= "sessionstatus";
	public static readonly CONNECT_STATUS:string		= "connectstatus";
	public static readonly DATASTREAM_STATUS:string		= "datastreamstatus";
	public static readonly STREAM_STATUS:string			= "streamstatus";
	public static readonly QUEUE_STATUS:string			= "queuestatus";
	public static readonly SEND_STATUS:string			= "sendstatus";
	
	public static readonly STATE_MSG:string	 			= "logstate";
	public static readonly PROG_MSG:string		 		= "logprogress";		
	public static readonly STATUS_MSG:string	 		= "logstatus";				
	public static readonly SERVER_FAILED:string    		= "serverfailed";		
			
	// subtypes
	
	public static readonly AUTH_SUCCESS:string	 	   	= "loginsuccess";
	public static readonly AUTH_FAILED:string	 	  	= "loginfailed";
	
	public static readonly DDNS_IN_PROGRESS:string    	= "DDNS in progress";
	public static readonly DDNS_RESOLVED:string       	= "DDNS resolved";
	public static readonly DDNS_FAILED:string    	  	 = "DDNS failed";
	
	public static readonly CONNECTION_OPEN:string     	= "Connection open";
	public static readonly CONNECTION_CLOSED:string  	= "Connection closed";
	public static readonly CONNECTION_RECYCLING:string	= "Connection recycling";
	public static readonly CONNECT_FAILED:string  	   	= "Connect failed";
	public static readonly CONNECTION_TERMINATED:string	= "Connection terminated";
	
	public static readonly SESSION_ABANDONED:string   = "Session abandoned";
	public static readonly SESSION_RESTARTED:string   = "Session Restarted";	
	public static readonly SESSION_FLUSHED:string     = "Session Flushed";	
	public static readonly SESSION_TERMINATED:string  = "Session Terminated";
	
	public static readonly SOCKET_OPENED:string 	   = "Socket opened";
	public static readonly SOCKET_CLOSED:string  	   = "Socket closed";	
	public static readonly SOCKET_IOERR:string  	   = "Socket io failed";	
	public static readonly SOCKET_SECERR:string  	   = "Socket sec failed";	

	public static readonly QUEUE_OPENED:string 	  		= "Queue opened";
	public static readonly QUEUE_CLOSED:string  	   	= "Queue closed";	
	public static readonly QUEUE_CHANGED:string  	   	= "Queue changed";	
	public static readonly QUEUE_WAITING:string  	   	= "Queue waiting";	
	public static readonly QUEUE_SENDING:string  	   	= "Queue sending";	
	public static readonly QUEUE_RESET:string  	   		= "Queue reset";	
	
	public static readonly STREAM_OPENED:string 	   = "STREAM opened";
	public static readonly STREAM_CLOSED:string  	   = "STREAM closed";	

	public static readonly QUERY_SUCCESS:string  	   = "Query Success";	
	public static readonly QUERY_FAILED:string  	   = "Query failed";	

	public static readonly PACKET_DATA:string  	   = "Packet Data";	
	
	private traceMode:boolean = false;
	
	// Event Parms
	
	public subType:string;
	public logNdx:number;
	public logTtl:number;
	public dataPacket:Object;
	
	
	constructor(type:string = CLogEvent.COMPLETE, _subType:string = null, _logNdx:number = 0, _logTtl:number = 0, _dataPacket:Object=null, bubbles:boolean = false, cancelable:boolean = false ) 
	{
		super(type, bubbles, cancelable);
		
		this.subType 	 = _subType;
		this.logNdx  	 = _logNdx;
		this.logTtl  	 = _logTtl;
		this.dataPacket  = _dataPacket;
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone() : Event		
	{
		if(this.traceMode) CUtil.trace("cloning CLogEvent:");
		
		return new CLogEvent(this.type, this.subType, this.logNdx, this.logTtl, this.dataPacket, this.bubbles, this.cancelable );		
	}
}