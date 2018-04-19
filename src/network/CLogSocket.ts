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

import { CLogEvent } 		from "../events/CLogEvent";
import { CDataEvent } 		from "../events/CDataEvent";
import { CIOErrorEvent } 	from "../events/CIOErrorEvent";

import EventDispatcher = createjs.EventDispatcher;
import { CProgressEvent } from "../events/CProgressEvent";
import { CSecurityErrorEvent } from "../events/CSecurityErrorEvent";



export class CLogSocket extends EventDispatcher
{
	public tracer:Object;
	
	public _connected:boolean = false;


	constructor(host:String=null, port:number=0, _tracer:Object=null)
	{
		// Do default init		
		super();
		
		this.openSocket(host, port);

		// add the tracer if available - used in sockettest state only
		
		this.tracer = _tracer;
	}
	

	public openSocket(host:String=null, port:number=0, _tracer:Object=null) {

	}

	public closeSocket() {
		
	}

	public sendData(dataPacket:string) {

	}

	public get connected() : boolean {

		return this._connected;
	}

	// When a socket connects to a server transactional socket this 
	// routine is called.
	
	protected connectHandler(event:Event):void
	{
		// super.connectHandler(event);
		
		// if(tracer) tracer.TRACE("LSocket: connectHandler...", "#000088", event.toString() );
		
		this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.SOCKET_OPENED));			
	}
	
	// If a send operation is interrupted through a connection failure 
	// or a remote service failture the local socket will timeout after 
	// 20sec and dispatch this event. Note: in this case no error is reported.
	//
	
	protected closeHandler(event:Event):void
	{
		// super.closeHandler(event);

		// if(tracer) tracer.TRACE("LSocket: closeHandler...", "#000088", event.toString() );	
		
		this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.SOCKET_CLOSED));			
	}
	
	protected dataHandler(event:CDataEvent):void
	{
		// super.dataHandler(event);
	}
	
	protected ioErrorHandler(event:CIOErrorEvent):void
	{
		// super.ioErrorHandler(event);

		// if(tracer) tracer.TRACE("LSocket: ioErrorHandler...", "#880000", event.toString() );
		
		this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.SOCKET_IOERR));
	}
	
	protected progressHandler(event:CProgressEvent):void
	{
		// super.progressHandler(event);

		// if(tracer) tracer.TRACE("LSocket: progressHandler...", "#000088", event.toString() );	
	}
	
	protected securityErrorHandler(event:CSecurityErrorEvent):void
	{
		// super.securityErrorHandler(event);

		// if(tracer) tracer.TRACE("LSocket: securityErrorHandler...", "#880000", event.toString() );	

		// It appears that this will always produce an ioError as well but send this here in case.
		
		this.dispatchEvent(new CLogEvent(CLogEvent.CONNECT_STATUS, CLogEvent.SOCKET_SECERR));
	}						
	
}
