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


export class CLogManagerType
{
	public static readonly RECLOGNONE:number    = 0;			// Disable all recording
	public static readonly RECORDEVENTS:number  = 1;			// Record Events
	public static readonly LOGEVENTS:number     = 2;			// Log Events to Server
	public static readonly RECLOGEVENTS:number  = 3;			// Record and Log all events
	
	public static readonly MODE_JSON:string    = "MODE_JSON";
	
	public static readonly JSON_ACKLOG:string  = "JSON_ACKLOG";
	public static readonly JSON_ACKTERM:string = "JSON_ACKTERM";
	
}