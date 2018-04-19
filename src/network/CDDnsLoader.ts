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

import { CURLLoader } 			from "./CURLLoader";

import { ILogManager } 			from "../managers/ILogManager";
// import { CLogManager } 			from "../managers/CLogManager";

import { CDnsEvent } 			from "../events/CDnsEvent";
import { CIOErrorEvent } 		from "../events/CIOErrorEvent";
import { CSecurityErrorEvent } 	from "../events/CSecurityErrorEvent";
import { CEFEvent } 			from "../events/CEFEvent";
import { CProgressEvent } 		from "../events/CProgressEvent";

import { CUtil } 				from "../util/CUtil";
import { CURLRequest } from "./CURLRequest";




export class CDDnsLoader extends CURLLoader
{
	// There are 2 static IP's used as backup locations for the DDNS 
	
	// private this.source:string    = "http://tedserver.psy.cmu.edu/DDNS.XML"; // "http://www.zipwiz.com/DDNS.XML";   //"http://192.168.1.1/DNS.TXT";
	
	private source:string    = "http://tedserver.psy.cmu.edu/DDNS.JSON"; 	//## Mod Mar 26 2014 - changed to JSON formatted DDNS   
	private ddnsJSON:any;

	private tracer:any;
	

	constructor(request:CURLRequest=null, _StextArea:Object = null)
	{			
		super(request);		
		
		this.tracer = _StextArea;
	}
	
	
	// Request the DDNS record from the DDNS server
	//
	public resolveArbiter() : void
	{
		let request:CURLRequest = new CURLRequest(this.source);
							
		// wire up the listeners
		
		this.configureDDNSListeners(true);
		
		try 
		{
			this.load(request);
			CUtil.trace("Document load requested: " + this.source);
			
			// if(this.tracer)
			// {
			// 	this.tracer.TRACE("------------------------------------", '#0000bb');			
			// 	this.tracer.TRACE("Document load requested: ", '#0000bb', this.source);								
			// }				
		}			
		catch (error) 
		{
			CUtil.trace("Error loading requested document: " + this.source);
			
			// if(this.tracer)
			// 	this.tracer.TRACE("Error loading requested document: ", '#0000bb', this.source);								
		}
	}
	
	
	// *** DDNS lookup		
	
	
	public configureDDNSListeners(fAdd:boolean ):void 
	{
		if(fAdd)
		{
			this.addEventListener(CEFEvent.COMPLETE, this.completeHandlerDDNS);
			this.addEventListener(CProgressEvent.PROGRESS, this.progressHandlerDDNS);
			this.addEventListener(CSecurityErrorEvent.SECURITY_ERROR, this.securityErrorHandlerDDNS);
			this.addEventListener(CIOErrorEvent.IO_ERROR, this.ioErrorHandlerDDNS);				
		}
		else
		{
			this.removeEventListener(CEFEvent.COMPLETE, this.completeHandlerDDNS);
			this.removeEventListener(CProgressEvent.PROGRESS, this.progressHandlerDDNS);
			this.removeEventListener(CSecurityErrorEvent.SECURITY_ERROR, this.securityErrorHandlerDDNS);
			this.removeEventListener(CIOErrorEvent.IO_ERROR, this.ioErrorHandlerDDNS);
		}
	}
	
	
	private completeHandlerDDNS(evt:Event):void 
	{
		CUtil.trace("DDNS Load Successful:");
		
		let server:any;
		let ipAddress:string = "";
		
		let _logManager:ILogManager;
		
		// Disconnect the dDNS listeners
		//
		this.configureDDNSListeners(false);			

		// extract the json data
		try
		{
			this.ddnsJSON = JSON.parse(this.data);
			
			for (server in this.ddnsJSON.servers)
			{
				if(server.protocol == 'TEDSERVER_E')
				{
					// _logManager = CLogManager.getInstance();
					
					_logManager.sessionHost = server.ipAddress;
					_logManager.sessionPort = Number(server.port);
					
					break;
				}
			}
		}
		catch(err)
		{
			CUtil.trace('Invalid DDNS.JSON specification');
		}			
		
		this.dispatchEvent(new CDnsEvent(CDnsEvent.COMPLETE, server.ipAddress));
		
		//gLogR.ipLogger = data;  // "10.36.2.156";		//	data;  // This IP used for Scitech study  "10.36.2.156";				
	}
	
	
	
	private progressHandlerDDNS(evt:CProgressEvent):void 
	{
		CUtil.trace("DDNS progressHandler loaded:" + evt.loaded + " total: " + evt.total);
		
		// if(this.tracer)
		// 	this.tracer.TRACE(("DDNS progressHandler loaded:" + evt.bytesLoaded + " total: " + evt.bytesTotal ), '#0000bb');											
	}
	
	private securityErrorHandlerDDNS(evt:CSecurityErrorEvent):void 
	{
		//progressDlg.setFooter("DDNS securityErrorHandler: " + evt);

		// if(this.tracer)
		// 	this.tracer.TRACE("DDNS securityErrorHandler: ", '#0000bb', evt.tostring());								
		
		// dDNS has failed - set error message and wait for user dialog termination
		//
		this.configureDDNSListeners(false);			
		
		this.dispatchEvent(new CDnsEvent(CDnsEvent.FAILED, evt.toString()));			
	}
	
	
	private ioErrorHandlerDDNS(evt:CIOErrorEvent):void 
	{
		//progressDlg.setFooter("DDNS ioErrorHandler: " + evt);
		
		// if(this.tracer)
		// 	this.tracer.TRACE("DDNS ioErrorHandler: ", '#0000bb', evt.tostring());								

		// dDNS has failed - set error message and wait for user dialog termination
		//
		this.configureDDNSListeners(false);			
		
		this.dispatchEvent(new CDnsEvent(CDnsEvent.FAILED, evt.toString()));			
	}
	
	// *** DDNS lookup		
	
}