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

import { IModuleDesc } from "../util/IModuleDesc";



export class CURLRequest {

    public url:string;
    public type:string;
    public timeout:number;

    public static readonly MIME_TEXT:string  = "text/plain";
    public static readonly MIME_HTML:string  = "text/html";
    public static readonly MIME_JPEG:string  = "image/jpeg";
    public static readonly MIME_PNG:string   = "image/png";
    public static readonly MIME_MPEG:string  = "audio/mpeg";
    public static readonly MIME_OGG:string   = "audio/ogg";
    public static readonly MIME_AUDIO:string = "audio/*";
    public static readonly MIME_MP4:string   = "video/mp4";
    public static readonly MIME_APP:string   = "application/*";
    public static readonly MIME_JSON:string  = "application/json";
    public static readonly MIME_JS:string    = "application/javascript";
    public static readonly MIME_ES:string    = "application/ecmascript";
    public static readonly MIME_OCTET:string = "application/octet-stream";


    constructor(_url:string, _type:string = CURLRequest.MIME_JSON, _timeout = 2000 ) {

        this.url = _url;
        this.type = _type;
        this.timeout = _timeout;
    }


}